import WebSocket from "ws";
import { pack } from "msgpackr";
import { pub } from "../../loaders/redis.js";
import logger from "../../utils/logger.js";
import indicatorEngine from "./dhanIndicatorEngine.js";

class DhanWebSocket {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.retryCount = 0;
    this.lastMessageTime = Date.now();
    this.subscribedTokens = new Set();
    this.lastIndexEmit = {}; // Throttle cache

    // Dhan Index Mappings
    this.indexMap = {
      "13": "NIFTY 50",
      "25": "BANKNIFTY",
      "99926000": "SENSEX" // Example static mapped SENSEX ID
    };

    // Feeder Mode checks
    this.isFeeder = process.env.NODE_APP_INSTANCE === '0' || process.env.IS_FEEDER === 'true' || process.env.NODE_ENV !== 'production';
  }

  async connect() {
    if (!this.isFeeder) {
      logger.info('ℹ️ [DhanFeed] Instance is not a feeder. Skipping Dhan connection.');
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const clientId = process.env.DHAN_CLIENT_ID || process.env.CLIENT_CODE || "12345";
      const accessToken = process.env.DHAN_ACCESS_TOKEN || process.env.TOTP_SECRET || "MOCK_TOKEN";
      const wsUrl = process.env.DHAN_WS_URL || "wss://api-feed.dhan.co";
      
      const fullUrl = `${wsUrl}?version=2&token=${accessToken}&clientId=${clientId}&authType=2`;
      logger.info(`📡 [DhanFeed] Connecting to Dhan WebSocket: wss://api-feed.dhan.co?version=2&clientId=${clientId}`);

      if (this.ws) {
        this.ws.removeAllListeners();
        this.ws.terminate();
      }

      this.ws = new WebSocket(fullUrl);

      this.ws.on("open", () => {
        logger.info("✅ [DhanFeed] Dhan Live Feed Connected!");
        this.isConnected = true;
        this.isConnecting = false;
        this.retryCount = 0;
        this.subscribedTokens.clear();

        // Subscribe to standard Nifty 50 and BankNifty spot indexes
        this.subscribeBaseIndices();
      });

      this.ws.on("message", (data) => {
        this.lastMessageTime = Date.now();
        this.handleMessage(data);
      });

      this.ws.on("error", (err) => {
        logger.error(`❌ [DhanFeed] WebSocket Error: ${err.message}`);
        this.isConnected = false;
      });

      this.ws.on("close", () => {
        logger.warn("⚠️ [DhanFeed] WebSocket Closed. Reconnecting...");
        this.isConnected = false;
        this.isConnecting = false;
        this.handleReconnect();
      });

    } catch (error) {
      logger.error(`💥 [DhanFeed] Connection Failed: ${error.message}`);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  handleReconnect() {
    this.retryCount++;
    const backoff = Math.min(1000 * Math.pow(2, this.retryCount), 60000);
    setTimeout(() => this.connect(), backoff);
  }

  subscribeBaseIndices() {
    // 13 = NIFTY 50 index spot, 25 = BANKNIFTY index spot
    this.subscribe("NSE_IDX", "13");
    this.subscribe("NSE_IDX", "25");
  }

  subscribe(exchangeSegment, securityId) {
    if (this.ws && this.isConnected) {
      const payload = {
        RequestCode: 15,
        InstrumentCount: 1,
        InstrumentList: [
          {
            ExchangeSegment: exchangeSegment,
            SecurityId: securityId
          }
        ]
      };
      this.ws.send(JSON.stringify(payload));
      this.subscribedTokens.add(`${exchangeSegment}:${securityId}`);
      logger.info(`📡 [DhanFeed] Subscribed to ${exchangeSegment}:${securityId}`);
    }
  }

  async handleMessage(data) {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
      if (buffer.length < 13) return;

      // Dhan v2 Binary response parsing
      // Offset 2 is Feed Response Code
      const responseCode = buffer.readUInt8(2);

      if (responseCode === 2 || responseCode === 1 || responseCode === 3 || responseCode === 4) {
        // Ticker (2), Quote (1), Full Data (3, 4)
        // Offset 5: Security ID (4 bytes int32)
        const securityId = buffer.readInt32LE(5);
        // Offset 9: LTP (4 bytes float)
        const ltp = buffer.readFloatLE(9);

        if (!securityId || isNaN(ltp) || ltp <= 0) return;

        const token = String(securityId);
        const name = this.indexMap[token] || null;

        // Feed to in-memory Indicators Engine
        indicatorEngine.processTick(token, ltp);

        const now = Date.now();
        if (name) {
          // Throttle index emissions to 500ms
          if (!this.lastIndexEmit[token] || now - this.lastIndexEmit[token] > 500) {
            this.broadcastPrice(token, ltp, name);
            this.lastIndexEmit[token] = now;
          }
        } else {
          this.broadcastPrice(token, ltp);
        }

        pub.hset('market:live_prices', token, ltp);
      }
    } catch (err) {
      logger.error(`⚠️ [DhanFeed] Tick parse error: ${err.message}`);
    }
  }

  broadcastPrice(token, ltp, instrumentName = null) {
    const payload = pack({
      event: 'price_update',
      data: {
        token,
        price: ltp,
        instrument: instrumentName,
        timestamp: Date.now()
      },
      room: instrumentName ? null : `market:${token}`
    });

    pub.publish('GLOBAL_REALTIME_EVENTS', payload);
  }
}

const dhanWebSocket = new DhanWebSocket();
export default dhanWebSocket;
