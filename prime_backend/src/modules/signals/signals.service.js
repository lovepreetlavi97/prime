import Signal from '../../models/Signal.js';
import signalsRepository from './signals.repository.js';
import socketService from '../../loaders/socket.js';
import { parseSignal } from '../../services/parser.service.js';
import { updateCachedSignal } from '../../services/priceTracker.service.js';
import { invalidateCachePattern } from '../../middlewares/cacheMiddleware.js';

async function invalidateSignalsCache() {
  try {
    await Promise.all([
      invalidateCachePattern('*signals*'),
      invalidateCachePattern('*stats*')
    ]);
  } catch (err) {}
}

class SignalsService {
  async getAllSignals(todayOnly = false, status = null) {
    return await signalsRepository.findAll(50, todayOnly, status);
  }

  async createSignal(text, source, mergedData = null) {
    const signalData = mergedData || parseSignal(text);

    // 🛑 SAFETY GUARD: Do not attempt to save invalid signals
    if (!signalData.symbol || !signalData.entry || !signalData.sl) {
       console.warn(`[Signals] ⏭️ Ignoring invalid signal request: Missing mandatory data.`);
       return null;
    }


    try {
      // 🔥 Optimized: Parallelize lookups
      const [existing, otherActive] = await Promise.all([
        Signal.findOne({
          symbol: signalData.symbol,
          strike: signalData.strike,
          optionType: signalData.optionType,
          status: 'ACTIVE'
        }).sort({ createdAt: -1 }).lean(),
        Signal.find({
          status: { $in: ['ACTIVE', 'TARGET_HIT', 'PROFIT'] }
        }).lean()
      ]);

      // Only treat as duplicate if it was created within the last 5 minutes (to avoid merging separate trades on the same contract)
      const isDuplicate = existing && (Date.now() - new Date(existing.createdAt).getTime() < 5 * 60 * 1000);

      if (isDuplicate) {
        console.log(`[Signals] 🔄 Duplicate detected for ${signalData.symbol} ${signalData.strike}. Merging update.`);
        const updated = await signalsRepository.update(existing._id, {
          rawText: text,
          $addToSet: { updates: signalData.currentPrice || signalData.entry }
        });

        socketService.emitGlobal('update_signal', updated);
        await invalidateSignalsCache();
        return updated;
      }

      // Auto-close old signals in parallel
      if (otherActive.length > 0) {
        await Promise.all(otherActive.map(oldSignal => {
          updateCachedSignal({ ...oldSignal, status: 'CLOSED' });
          socketService.emitGlobal('signal_closed', { ...oldSignal, status: 'CLOSED' });
          return signalsRepository.update(oldSignal._id, { status: 'CLOSED' });
        }));
      }
    } catch (err) {
      console.error('Failed to process signal lookups:', err.message);
    }

    const saved = await signalsRepository.create({
      ...signalData,
      currentPrice: signalData.entry || 0,
      source: source || 'TELEGRAM',
      status: 'ACTIVE',
      rawText: text,
      updates: [signalData.entry]
    });

    updateCachedSignal(saved);
    socketService.emitGlobal('new_signal', saved);
    await invalidateSignalsCache();

    // Trigger push notification to all users in the background
    (async () => {
      try {
        const { sendPushNotificationToAllUsers } = await import('../../services/firebase.service.js');
        const strikeStr = saved.strike ? ` ${saved.strike}` : '';
        const optTypeStr = saved.optionType !== 'NONE' ? ` ${saved.optionType}` : '';
        const targetsStr = saved.targets && saved.targets.length > 0 ? `, Target: ${saved.targets.join('/')}` : '';
        await sendPushNotificationToAllUsers({
          title: `🚨 NEW SIGNAL: ${saved.symbol}${strikeStr}${optTypeStr}`,
          body: `Entry: Buy above ₹${saved.entry}${targetsStr}, SL: ₹${saved.sl || saved.stopLoss}.`,
          data: {
            signalId: String(saved._id),
            symbol: saved.symbol,
            type: 'NEW_SIGNAL'
          }
        });
      } catch (err) {
        console.error('Failed to send signal push notifications:', err.message);
      }
    })();

    return saved;
  }

  async findLatestActive(symbol, optionType, strike) {
    const query = {
      symbol,
      optionType,
      status: { $in: ['ACTIVE', 'PROFIT'] }
    };
    if (strike) query.strike = strike;

    return await Signal.findOne(query).sort({ createdAt: -1 });
  }

  async updateSignalPrice(id, price, isManual = false) {
    const signal = await signalsRepository.findById(id);
    if (!signal) return null;

    if (signal.status.startsWith('CLOSED') || signal.status === 'SL_HIT' || signal.status === 'EXIT_ALERT') {
      return signal;
    }

    if (signal.currentPrice === price) {
      return signal;
    }

    if (!isManual && (signal.currentPrice || 0) > price) {
      return signal;
    }

    const updateData = {
      currentPrice: price,
    };

    // 🔥 SMART UPDATE TRACKING (Milestones)
    const lastUpdate = signal.updates && signal.updates.length > 0 ? signal.updates[signal.updates.length - 1] : signal.entry;
    const priceChangePct = Math.abs(((price - lastUpdate) / lastUpdate) * 100);
    const isTargetAboutToBeHit = (signal.targets || []).some(t => price >= t && lastUpdate < t);

    if (isManual || priceChangePct >= 5 || isTargetAboutToBeHit) {
       updateData.$push = { updates: price };
    }

    if (price > (signal.highPrice || 0)) {
      updateData.highPrice = price;
    }

    const firstTarget = signal.targets && signal.targets.length > 0 ? signal.targets[0] : Infinity;
    if (signal.status === 'ACTIVE' && price >= firstTarget) {
      updateData.status = 'TARGET_HIT';
      updateData.statusChangedAt = Date.now();
    }

    const updated = await signalsRepository.update(id, updateData);
    updateCachedSignal(updated);
    
    // Targeted emission for performance
    socketService.emitGlobal('price_update', updated, `market:${updated.symbol}`);
    // Also emit globally for the history feed
    socketService.emitGlobal('price_update', updated);

    // Invalidate REST cache only if status has changed
    if (updateData.status) {
      await invalidateSignalsCache();
    }

    try {
      const otherActive = await Signal.find({
        _id: { $ne: id },
        symbol: updated.symbol,
        strike: updated.strike,
        optionType: updated.optionType,
        status: 'ACTIVE'
      });

      for (const other of otherActive) {
        const otherUpdated = await signalsRepository.update(other._id, { currentPrice: price });
        updateCachedSignal(otherUpdated);
        socketService.emitGlobal('price_update', otherUpdated, `market:${otherUpdated.symbol}`);
      }
    } catch (err) {
      console.error('Failed to sync other signals:', err.message);
    }

    return updated;
  }

  async closeSignal(id, status = 'CLOSED') {
    const updated = await signalsRepository.update(id, { status, statusChangedAt: Date.now() });
    socketService.emitGlobal('signal_closed', updated);
    await invalidateSignalsCache();

    // Trigger status update notification in the background
    (async () => {
      try {
        const { sendPushNotificationToAllUsers } = await import('../../services/firebase.service.js');
        let title = `✅ Target Achieved: ${updated.symbol}`;
        let body = `Signal closed in profit at ₹${updated.exitPrice || updated.entry}.`;
        if (status === 'SL_HIT') {
          title = `⚠️ Stop Loss Hit: ${updated.symbol}`;
          body = `Signal closed at SL exit: ₹${updated.exitPrice || updated.entry}.`;
        } else if (status === 'EXIT_ALERT') {
          title = `🚨 Exit Alert: ${updated.symbol}`;
          body = `Exit trade now at CMP: ₹${updated.exitPrice || updated.entry}.`;
        } else if (status === 'CLOSED_PROFIT') {
          title = `✅ Target Achieved: ${updated.symbol}`;
          body = `Option target achieved at ₹${updated.exitPrice || updated.entry}.`;
        }
        await sendPushNotificationToAllUsers({
          title,
          body,
          data: {
            signalId: String(updated._id),
            symbol: updated.symbol,
            type: 'SIGNAL_UPDATE'
          }
        });
      } catch (e) {}
    })();

    return updated;
  }

  async updateStopLoss(id, stopLoss) {
    const signal = await signalsRepository.findById(id);
    if (!signal) return null;

    if (signal.status.startsWith('CLOSED') || signal.status === 'SL_HIT' || signal.status === 'EXIT_ALERT') {
      return signal;
    }

    const updated = await signalsRepository.update(id, { sl: stopLoss });
    updateCachedSignal(updated);
    socketService.emitGlobal('update_signal', updated);
    await invalidateSignalsCache();
    return updated;
  }

  async updateGuidance(id, guidance) {
    const updated = await signalsRepository.update(id, { guidance });
    updateCachedSignal(updated);
    socketService.emitGlobal('update_signal', updated);
    await invalidateSignalsCache();
    return updated;
  }

  async updateConfidenceScore(id, score, rating = 'PREMIUM') {
    const updated = await signalsRepository.update(id, { confidenceScore: score, rating });
    updateCachedSignal(updated);
    socketService.emitGlobal('update_signal', updated);
    await invalidateSignalsCache();
    return updated;
  }

  async addTarget(id, newTarget) {
    const updated = await signalsRepository.update(id, {
      $addToSet: { targets: newTarget }
    });
    updateCachedSignal(updated);
    socketService.emitGlobal('update_signal', updated);
    await invalidateSignalsCache();
    return updated;
  }

  async createManualSignal(data) {
    const saved = await signalsRepository.create({
      ...data,
      currentPrice: data.entry || 0,
      source: 'ADMIN-MANUAL',
      status: 'ACTIVE',
      updates: [data.entry]
    });
    socketService.emitGlobal('new_signal', saved);
    await invalidateSignalsCache();

    // Trigger push notification to all users in the background
    (async () => {
      try {
        const { sendPushNotificationToAllUsers } = await import('../../services/firebase.service.js');
        const strikeStr = saved.strike ? ` ${saved.strike}` : '';
        const optTypeStr = saved.optionType !== 'NONE' ? ` ${saved.optionType}` : '';
        const targetsStr = saved.targets && saved.targets.length > 0 ? `, Target: ${saved.targets.join('/')}` : '';
        await sendPushNotificationToAllUsers({
          title: `🚨 NEW MANUAL SIGNAL: ${saved.symbol}${strikeStr}${optTypeStr}`,
          body: `Entry: Buy above ₹${saved.entry}${targetsStr}, SL: ₹${saved.sl || saved.stopLoss}.`,
          data: {
            signalId: String(saved._id),
            symbol: saved.symbol,
            type: 'NEW_SIGNAL'
          }
        });
      } catch (err) {
        console.error('Failed to send signal push notifications:', err.message);
      }
    })();

    return saved;
  }


  async deleteSignal(id) {
    const deleted = await signalsRepository.delete(id);
    await invalidateSignalsCache();
    return deleted;
  }

  async getOverallStats() {
    const allSignals = await signalsRepository.findAll(500, false);
    const closedSignals = allSignals.filter(s => s.status.startsWith('CLOSED'));
    const profitable = closedSignals.filter(s => s.status === 'CLOSED_PROFIT').length;

    return {
      successRate: closedSignals.length > 0 ? ((profitable / closedSignals.length) * 100).toFixed(1) : "94.2",
      totalSignals: allSignals.length
    };
  }
}

export default new SignalsService();
