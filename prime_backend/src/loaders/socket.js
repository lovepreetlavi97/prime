import { Server as SocketServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pub, sub } from './redis.js';
import presenceService from '../services/presence.service.js';
import logger, { startTimer, endTimer, shouldLog } from '../utils/logger.js';
import gateway from './gateway.js';
import { normalizeRealtimeEvent } from '../utils/realtime.js';
import { getTelegramStatus } from '../services/telegram.service.js';
import { pack } from 'msgpackr';




class SocketService {
  constructor() {
    this.io = null;
    this._isInitialized = false;
  }

  async init(server, app = null) {
    if (this._isInitialized) return this.io;

    this.io = new SocketServer(server, {
      cors: {
        origin: true, // In production, replace with specific origins
        methods: ['GET', 'POST'],
        credentials: true
      },
      adapter: createAdapter(pub, sub),
      transports: ['websocket'], // Force WebSocket for low latency
      pingTimeout: 20000,
      pingInterval: 10000
    });

    // 🛡️ JWT Socket Authentication Middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
          socket.handshake.auth.userId = null;
          socket.handshake.auth.tier = 'free';
          socket.handshake.auth.device = socket.handshake.headers['user-agent'] || 'unknown';
          return next();
        }

        if (app && app.jwt) {
          const decoded = app.jwt.verify(token);
          socket.handshake.auth.userId = decoded.id || decoded.userId;
          socket.handshake.auth.tier = decoded.tier || decoded.subscriptionType || 'free';
          socket.handshake.auth.device = decoded.device || socket.handshake.headers['user-agent'] || 'unknown';
        }
        next();
      } catch (err) {
        logger.warn(`⚠️ [SocketAuth] Auth failed for socket ${socket.id}: ${err.message}`);
        socket.handshake.auth.userId = null;
        socket.handshake.auth.tier = 'free';
        socket.handshake.auth.device = socket.handshake.headers['user-agent'] || 'unknown';
        next();
      }
    });

    // Initialize the New Gateway in Shadow Mode (Parallel Validation)
    gateway.init(this.io);

    this.io.on('connection', async (socket) => {
      const { userId, tier = 'free', device = 'unknown' } = socket.handshake.auth;
      logger.info(`🔗 Client connected: ${socket.id} (User: ${userId || 'Guest'}, Tier: ${tier}, Device: ${device})`);

      // Default room for all users
      socket.join('signals:free');

      if (userId) {
        await presenceService.setUserOnline(userId, socket.id, device, tier);
        socket.join(`user:${userId}`);
        
        // Subscription Tier Routing
        if (tier === 'pro' || tier === 'elite') {
          socket.join('signals:pro');
        }
        if (tier === 'elite') {
          socket.join('signals:elite');
        }
      }

      // 🔥 INITIAL SYNC: Send telegram status on connect
      socket.emit('telegram_status', getTelegramStatus());

      socket.on('subscribe_market', (symbol) => {
        if (symbol) {
          socket.join(`market:${symbol}`);
          logger.debug(`📡 Socket ${socket.id} joined market:${symbol}`);
        }
      });

      // Heartbeat ACK to refresh activity
      socket.on('heartbeat_ack', async () => {
        await presenceService.updateSocketActivity(socket.id);
      });

      socket.on('disconnect', async () => {
        if (userId) {
          await presenceService.setUserOffline(userId, socket.id);
        }
        logger.info(`🔌 Client disconnected: ${socket.id}`);
      });
    });

    this.throttleMap = new Map();

    // --- 🚀 ENTERPRISE HEARTBEAT STRATEGY ---
    setInterval(() => {
      if (this.io) {
        this.io.emit('heartbeat', {
          timestamp: Date.now(),
          status: 'OPTIMAL'
        });
      }
    }, 10000); // 10s Heartbeat

    // 🔥 TELEGRAM CONNECTIVITY BROADCAST
    setInterval(() => {
      if (this.io) {
        this.io.emit('telegram_status', getTelegramStatus());
      }
    }, 15000); // 15s TG Status Update

    // 🔥 STALE SOCKETS CLEANUP INTERVAl (30 seconds)
    setInterval(async () => {
      await presenceService.cleanupStaleSockets();
    }, 30000);

    this._isInitialized = true;
    logger.info('🚀 Optimized Realtime Gateway Established');
    return this.io;
  }

  /**
   * Cross-process emit helper (Intelligent Redis Channel Mapping)
   */
  async emitGlobal(event, data, room = null) {
    const payload = pack({ event, data, room });
    let channel = 'GLOBAL_REALTIME_EVENTS';

    // Map events to specific Redis channels to avoid single-instance bottlenecks
    if (event === 'new_signal') {
      channel = 'signal:new';
    } else if (event === 'update_signal') {
      channel = 'signal:update';
    } else if (event === 'signal_closed' || event === 'signal_status_change') {
      const status = data.status || '';
      if (status === 'SL_HIT') {
        channel = 'signal:sl-hit';
      } else if (['TARGET_HIT', 'PROFIT', 'CLOSED_PROFIT'].includes(status)) {
        channel = 'signal:target-hit';
      } else {
        channel = 'signal:update';
      }
    } else if (event === 'price_update') {
      const symbol = data.instrument || data.symbol || null;
      if (symbol === 'NIFTY 50' || symbol === 'NIFTY') {
        channel = 'market:nifty';
      } else if (symbol === 'BANKNIFTY') {
        channel = 'market:banknifty';
      } else {
        channel = room ? `market:${data.token || data.symbol || 'option'}` : 'GLOBAL_REALTIME_EVENTS';
      }
    } else if (event === 'notification_broadcast') {
      channel = 'notification:broadcast';
    } else if (event === 'notification_pro') {
      channel = 'notification:pro';
    } else if (event === 'notification_free') {
      channel = 'notification:free';
    }

    await pub.publish(channel, payload);
  }

  getIO() { return this.io; }
}

const socketService = new SocketService();
export default socketService;
