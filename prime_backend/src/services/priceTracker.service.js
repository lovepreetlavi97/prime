import Signal from '../models/Signal.js';
import logger from '../utils/logger.js';
import { sub, pub } from '../loaders/redis.js';
import socketService from '../loaders/socket.js';
import instrumentService from './instrument.service.js';
import { normalizeRealtimeEvent } from '../utils/realtime.js';
import { pack } from 'msgpackr';
import priceWebSocket from './priceWebSocket.js';

let activeSignalsCache = [];
let lastSyncTime = Date.now();
const batchBuffer = new Map(); // 🔥 High-efficiency update buffer

/**
 * Updates the local cache of active signals.
 */
export const updateCachedSignal = (signal) => {
  const signalObj = signal.toObject ? signal.toObject() : signal;
  
  if (!signalObj.token && signalObj.symbol) {
    const instrument = instrumentService.findToken(
        signalObj.symbol, 
        signalObj.strike, 
        signalObj.optionType
    );
    if (instrument) {
        signalObj.token = instrument.token;
        // 🔥 AUTO-SUBSCRIBE to market feed
        priceWebSocket.subscribeToToken(instrument.token);
    }
  }

  const index = activeSignalsCache.findIndex(s => String(s._id) === String(signalObj._id));
  
  if (index !== -1) {
    activeSignalsCache[index] = { ...activeSignalsCache[index], ...signalObj };
  } else if (['ACTIVE', 'TARGET_HIT', 'PROFIT'].includes(signalObj.status)) {
    activeSignalsCache.push(signalObj);
  }
};

/**
 * PRODUCTION PRICE TRACKER (OPTIMIZED)
 */
export const startPriceTracker = async () => {
  await refreshCache();

  sub.on('messageBuffer', async (channel, message) => {
    if (channel.toString() !== 'GLOBAL_REALTIME_EVENTS') return;

    try {
      // 1. Canonical Normalization
      const normalized = normalizeRealtimeEvent(message);
      if (normalized.event !== 'price_update') return;

      const { token, price } = normalized.data;
      if (!token || !price) return;
      
      // 2. Business Evaluation Pipeline
      for (const signal of activeSignalsCache) {
        if (signal.token === token) {
          handleSignalPriceUpdate(signal, price);
        }
      }
    } catch (e) {
      logger.error({ err: e.message, raw: message }, '❌ [PriceTracker] Business Logic Pipeline Error');
    }
  });

  // 🔥 HIGH-EFFICIENCY EMISSION LOOP (BATCHED)
  setInterval(async () => {
    if (batchBuffer.size === 0) return;

    const batch = Array.from(batchBuffer.values());
    batchBuffer.clear();

    try {
      if (pub.status === 'ready') {
        // Emit batch to all server instances using Binary MessagePack
        const payload = pack({
          event: 'price_update_batch',
          data: batch,
          timestamp: Date.now()
        });
        await pub.publish('GLOBAL_REALTIME_EVENTS', payload);
      }
    } catch (e) {}

    // Periodic Database Sync
    if (Date.now() - lastSyncTime > 15000) {
      syncToDatabase();
      lastSyncTime = Date.now();
    }
  }, 1000);

  setInterval(refreshCache, 60000);
};

const handleSignalPriceUpdate = async (signal, price) => {
  const oldStatus = signal.status;
  const oldHigh = signal.highPrice || 0;
  
  // 🔥 Price Stability: Don't lower highPrice
  signal.currentPrice = price;
  if (price > oldHigh) signal.highPrice = price;

  let statusChanged = false;

  // 1. Check Stop Loss
  if (price <= signal.sl && (signal.status === 'ACTIVE' || signal.status === 'TARGET_HIT')) {
    signal.status = 'SL_HIT';
    statusChanged = true;
  }

  // 2. Check Targets
  if (signal.targets?.length > 0 && (signal.status === 'ACTIVE' || signal.status === 'TARGET_HIT')) {
    const hit = signal.targets.some(t => price >= t);
    if (hit && signal.status === 'ACTIVE') {
      signal.status = 'TARGET_HIT';
      statusChanged = true;
    }
  }

  // 🔥 ADD TO BATCH BUFFER
  batchBuffer.set(String(signal._id), {
    _id: signal._id,
    currentPrice: signal.currentPrice,
    highPrice: signal.highPrice,
    status: signal.status,
    symbol: signal.symbol,
    timestamp: Date.now()
  });

  // 🔥 BROADCAST STATUS CHANGE IMMEDIATELY (CRITICAL)
  if (statusChanged) {
    socketService.emitGlobal('signal_status_change', { _id: signal._id, status: signal.status });
    
    logger.info({
      msgType: 'SIGNAL_STATUS_CHANGE',
      symbol: signal.symbol,
      _id: signal._id,
      newStatus: signal.status,
      price
    }, `💎 Status Changed: ${signal.symbol} -> ${signal.status}`);

    await Signal.findByIdAndUpdate(signal._id, { status: signal.status, currentPrice: price, highPrice: signal.highPrice });
  }
};

const refreshCache = async () => {
  try {
    const signals = await Signal.find({ 
      status: { $in: ['ACTIVE', 'TARGET_HIT', 'PROFIT'] } 
    }).lean();
    
    // Enrich with tokens and subscribe
    signals.forEach(s => {
      const instrument = instrumentService.findToken(s.symbol, s.strike, s.optionType);
      if (instrument) {
        s.token = instrument.token;
        priceWebSocket.subscribeToToken(instrument.token);
      }
    });

    activeSignalsCache = signals;
    logger.debug(`📡 [PriceTracker] Refreshed cache with ${signals.length} active signals`);
  } catch (err) {
    logger.error('Failed to refresh price tracker cache:', err.message);
  }
};

const syncToDatabase = async () => {
  if (activeSignalsCache.length === 0) return;
  try {
    const bulkOps = activeSignalsCache.map(s => ({
      updateOne: {
        filter: { _id: s._id },
        update: { $set: { currentPrice: s.currentPrice, highPrice: s.highPrice } }
      }
    }));
    await Signal.bulkWrite(bulkOps);
  } catch (err) {}
};

export const initDistributedListeners = () => {
    // This is now redundant as startPriceTracker handles it via GLOBAL_REALTIME_EVENTS
};
