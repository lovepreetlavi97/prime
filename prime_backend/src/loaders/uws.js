let uWS;
try {
  uWS = (await import('uWebSockets.js')).default;
} catch (e) {
  console.warn('⚠️ [uWS] Native binary not found or incompatible. uWebSockets.js engine disabled.');
}
import { unpack } from 'msgpackr';
import logger from '../utils/logger.js';
import { sub } from './redis.js';
import { WebSocketServer } from 'ws';

/**
 * 🚀 ULTRA-LOW LATENCY WEBSOCKET SERVER (uWebSockets.js)
 * Designed for high-throughput binary market data streaming.
 */
class UWSServer {
  constructor() {
    this.app = null;
    this.port = process.env.UWS_PORT || 4001;
    this.sockets = new Map(); // socketId -> ws
  }

  init() {
    if (!uWS) {
      this.initFallback();
      return;
    }
    this.app = uWS.App();
    this.app.ws('/*', {
      /* Options */
      compression: uWS.SHARED_COMPRESSOR,
      maxPayloadLength: 16 * 1024 * 1024,
      idleTimeout: 32,
      
      /* Handlers */
      upgrade: (res, req, context) => {
        const url = req.getUrl();
        const query = req.getQuery();
        
        res.upgrade(
          { url, query },
          req.getHeader('sec-websocket-key'),
          req.getHeader('sec-websocket-protocol'),
          req.getHeader('sec-websocket-extensions'),
          context
        );
      },

      open: (ws) => {
        logger.info('🔗 [uWS] New connection established');
        ws.subscribe('global');
      },

      message: (ws, message, isBinary) => {
        try {
          const data = isBinary ? unpack(Buffer.from(message)) : JSON.parse(Buffer.from(message).toString());
          
          if (data.action === 'subscribe') {
            const room = data.room || data.symbol;
            if (room) {
              ws.subscribe(room);
              logger.debug(`📡 [uWS] Socket subscribed to: ${room}`);
            }
          }
        } catch (err) {
          logger.error(`❌ [uWS] Message handling error: ${err.message}`);
        }
      },

      close: (ws, code, message) => {
        logger.info('🔌 [uWS] Connection closed');
      }
    });

    this.app.listen(parseInt(this.port), (token) => {
      if (token) {
        logger.info(`🚀 [uWS] Dedicated Realtime Engine listening on port ${this.port}`);
      } else {
        logger.error(`💥 [uWS] Failed to listen on port ${this.port}`);
      }
    });

    // --- 🚀 REDIS PUBSUB BRIDGE ---
    // Connects the HFT price feed to the uWS binary broadcast
    sub.subscribe('GLOBAL_REALTIME_EVENTS');
    sub.on('messageBuffer', (channel, message) => {
      if (channel.toString() === 'GLOBAL_REALTIME_EVENTS' && this.app) {
        // Broadcast raw binary message to appropriate rooms
        try {
          this.app.publish('global', message, true);
        } catch (e) {}
      }
    });
  }

  initFallback() {
    logger.warn('⚠️ [uWS] Falling back to standard "ws" library for binary streaming.');
    const wss = new WebSocketServer({ port: this.port });
    
    wss.on('connection', (ws) => {
      logger.info('🔗 [ws-fallback] New connection');
      ws.on('message', (message, isBinary) => {
        try {
          const data = isBinary ? unpack(message) : JSON.parse(message.toString());
          // Simple topic routing for fallback
          if (data.action === 'subscribe') {
             // ws library doesn't have native pubsub, but we can handle it
          }
        } catch (e) {}
      });
    });

    sub.on('messageBuffer', (channel, message) => {
      if (channel.toString() === 'GLOBAL_REALTIME_EVENTS') {
        wss.clients.forEach(client => {
          if (client.readyState === 1) client.send(message, { binary: true });
        });
      }
    });
  }
}

export default new UWSServer();
