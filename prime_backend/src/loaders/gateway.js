import { sub } from './redis.js';
import logger from '../utils/logger.js';
import { normalizeRealtimeEvent } from '../utils/realtime.js';

/**
 * 🌐 INTELLIGENT REALTIME GATEWAY (Primary)
 * Handles high-frequency market data, channel separation, and performance throttling.
 */
class RealtimeGateway {
  constructor() {
    this.buffer = [];
    this.bufferLimit = 100;
    this.isEnabled = true; 
    this.throttleMap = new Map();
  }

  init(io) {
    this.io = io;
    logger.info({ mode: 'PRIMARY' }, '🌐 Intelligent Realtime Gateway Active');

    // Subscribe to specific and wildcard pattern Redis channels
    sub.subscribe('GLOBAL_REALTIME_EVENTS');
    sub.psubscribe('market:*', 'signal:*', 'notification:*');

    sub.on('pmessageBuffer', (pattern, channel, message) => {
      this.processEvent(message);
    });

    sub.on('messageBuffer', (channel, message) => {
      if (channel.toString() === 'GLOBAL_REALTIME_EVENTS') {
        this.processEvent(message);
      }
    });
  }

  processEvent(rawMessage) {
    try {
      // 1. Canonical Normalization
      const normalized = normalizeRealtimeEvent(rawMessage);
      if (!normalized.isNormalized || normalized.event === 'unknown') return;

      const { event, data, room } = normalized;

      // 2. 🔥 ARCHITECTURE: CHANNEL SEPARATION & THROTTLING
      // This prevents the "Synchronizing" lag by separating Indices from Signals
      let targetEvent = event;
      if (event === 'price_update' || event === 'price_update_batch') {
        const isIndex = data.instrument || ['NIFTY 50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'MIDCPNIFTY'].includes(data.instrument);
        
        if (event === 'price_update') {
          if (!isIndex) return; // 🔥 Signals are handled by price_update_batch for efficiency and ID mapping
          targetEvent = 'market_feed';
        } else {
          targetEvent = 'signal_updates';
        }

        // 🔥 PERFORMANCE THROTTLING: Only for Price Ticks (500ms)
        // Critical status changes (EXIT, TARGET) MUST bypass this.
        const throttleKey = `${targetEvent}:${room || 'global'}:${data.token || data._id || 'all'}`;
        const now = Date.now();
        if (now - (this.throttleMap.get(throttleKey) || 0) < 500) return;
        this.throttleMap.set(throttleKey, now);
      }

      // 3. Emission to Connected Clients
      if (this.io) {
        if (room) {
          this.io.to(room).emit(targetEvent, data);
        } else {
          this.io.emit(targetEvent, data);
        }
      }

    } catch (err) {
      logger.error({ err: err.message }, '❌ [Gateway] Critical Processing Error');
    }
  }

  // Shadow methods kept for backward compatibility if needed by other loaders
  reportOldFlowAction() {}
}

const gateway = new RealtimeGateway();
export default gateway;
