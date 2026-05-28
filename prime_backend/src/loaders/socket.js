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

  async init(server) {
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

    // Initialize the New Gateway in Shadow Mode (Parallel Validation)
    gateway.init(this.io);

    this.io.on('connection', async (socket) => {

      const { userId, tier = 'free' } = socket.handshake.auth;
      logger.info(`🔗 Client connected: ${socket.id} (User: ${userId || 'Guest'}, Tier: ${tier})`);

      // Default room for all users
      socket.join('signals:free');

      if (userId) {
        await presenceService.setUserOnline(userId, socket.id);
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

    // 🔥 UNIFIED GLOBAL BROADCASTER (Legacy - Decommissioned for RealtimeGateway)
    /*
    sub.subscribe('GLOBAL_REALTIME_EVENTS');
    sub.on('message', (channel, message) => {
      // ... handled by gateway.js
    });
    */

    this._isInitialized = true;
    logger.info('🚀 Optimized Realtime Gateway Established');
    return this.io;
  }

  /**
   * Cross-process emit helper
   */
  async emitGlobal(event, data, room = null) {
    const payload = pack({ event, data, room });
    await pub.publish('GLOBAL_REALTIME_EVENTS', payload);
  }

  getIO() { return this.io; }
}

const socketService = new SocketService();
export default socketService;
