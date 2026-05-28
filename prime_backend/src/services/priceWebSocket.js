import WebSocket from "ws";
import { pack } from "msgpackr";
import Piscina from 'piscina';
import path from 'path';
import { fileURLToPath } from 'url';
import { loginToAngelOne } from "./angelOneLoginService.js";
import { pub } from "../loaders/redis.js";
import logger from "../utils/logger.js";

class PriceWebSocket {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.retryCount = 0;
    this.lastMessageTime = Date.now();
    this.subscribedTokens = new Set();
    this.lastIndexEmit = {}; // 🔥 Throttle cache
    
    // Index Token Mapping
    this.indexMap = {
      "26000": "NIFTY 50",
      "26009": "BANKNIFTY",
      "1": "SENSEX",
      "19000": "SENSEX",
      "26037": "FINNIFTY",
      "26074": "MIDCPNIFTY"
    };

    // 🔥 FEEDER MODE: Only instance 0 should connect to Angel One
    this.isFeeder = process.env.NODE_APP_INSTANCE === '0' || process.env.IS_FEEDER === 'true' || process.env.NODE_ENV !== 'production';

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.workerPool = new Piscina({
      filename: path.resolve(__dirname, '../workers/marketDataWorker.js')
    });
  }

  async connect() {
    if (!this.isFeeder) {
      logger.info('ℹ️ [MarketFeed] Instance is not a feeder. Skipping Angel One connection.');
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      logger.info("📡 [MarketFeed] Initializing Singleton Angel One Connection...");
      
      const loginData = await loginToAngelOne();
      if (!loginData.success) throw new Error(loginData.message || "Login failed");

      const { feedToken, jwt, clientCode } = loginData;
      const wsUrl = process.env.ANGEL_WS_URL || "wss://smartapisocket.angelone.in/smart-stream";
      const apiKey = process.env.SMARTAPI_KEY;

      const fullUrl = `${wsUrl}?clientCode=${clientCode}&feedToken=${feedToken}&apiKey=${apiKey}`;
      
      if (this.ws) {
        this.ws.removeAllListeners();
        this.ws.terminate();
      }

      this.ws = new WebSocket(fullUrl);

      this.ws.on("open", () => {
        logger.info("✅ [MarketFeed] Angel One WebSocket Connected!");
        this.isConnected = true;
        this.isConnecting = false;
        this.retryCount = 0;
        this.subscribedTokens.clear();

        this.subscribeBaseIndices();
      });

      this.ws.on("message", (data) => {
        this.lastMessageTime = Date.now();
        this.handleMessage(data);
      });

      this.ws.on("error", (err) => {
        logger.error(`❌ [MarketFeed] WebSocket Error: ${err.message}`);
        this.isConnected = false;
      });

      this.ws.on("close", () => {
        logger.warn("⚠️ [MarketFeed] WebSocket Closed. Reconnecting...");
        this.isConnected = false;
        this.isConnecting = false;
        this.handleReconnect();
      });

    } catch (error) {
      logger.error(`💥 [MarketFeed] Connection Failed: ${error.message}`);
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
    const baseTokens = [
      { exchangeType: 1, tokens: ["26000", "26009", "26037", "26074"] }, // NIFTY, BANKNIFTY, FINNIFTY, MIDCP
      { exchangeType: 3, tokens: ["1", "19000"] }     // SENSEX
    ];
    
    baseTokens.forEach(group => this.sendSubscription(group.exchangeType, group.tokens));
  }

  sendSubscription(exchangeType, tokens) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({
        action: 1,
        params: { mode: 1, tokenList: [{ exchangeType, tokens }] }
      }));
    }
  }

  async handleMessage(data) {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "binary");
    
    // 🔥 OFFLOAD TO WORKER POOL (Zero-latency parsing)
    const result = await this.workerPool.run({ buffer, indexMap: this.indexMap });
    if (!result) return;

    const { token, price, instrument, timestamp } = result;
    const now = Date.now();

    if (instrument) {
      if (!this.lastIndexEmit[token] || now - this.lastIndexEmit[token] > 500) {
        this.broadcastPrice(token, price, instrument);
        this.lastIndexEmit[token] = now;
      }
    } else {
      this.broadcastPrice(token, price);
    }

    pub.hset('market:live_prices', token, price);
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

  /**
   * Public API to subscribe to new tokens
   */
  async subscribeToToken(token, exchangeType = 2) {
    if (!this.isFeeder) return;
    if (this.subscribedTokens.has(token)) return;
    
    this.sendSubscription(exchangeType, [String(token)]);
    this.subscribedTokens.add(token);
    logger.debug(`📡 [MarketFeed] Subscribed to ${token}`);
  }
}

const priceWebSocket = new PriceWebSocket();
export default priceWebSocket;
