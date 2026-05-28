import Signal from '../../models/Signal.js';
import HomeContent from '../../models/HomeContent.js';
import User from '../../models/User.js';
import signalsService from '../signals/signals.service.js';
import { getTelegramStatus } from '../../services/telegram.service.js';

export const getBootstrapData = async (req, reply) => {
  try {
    const user = req.user;
    const now = new Date();
    
    // 1. Fetch Home Content
    const homeContent = await HomeContent.findOne().sort({ createdAt: -1 });

    // 2. Determine Pro Status
    const isPro = user?.role === 'ADMIN' || (
      user?.subscription?.plan && 
      user?.subscription?.plan !== 'free' && 
      user?.subscription?.isActive && 
      (!user?.subscription?.endDate || new Date(user.subscription.endDate) > now)
    );

    // 3. Fetch Signals (Optimized query)
    const signals = await signalsService.getAllSignals(true); // Fetch today's signals

    // 4. Mask signals for non-pro users
    const processedSignals = signals.map(s => {
      const signalObj = s.toObject ? s.toObject() : s;
      const isClosed = signalObj.status.startsWith('CLOSED') || 
                       ['SL_HIT', 'EXIT_ALERT', 'TARGET_HIT', 'PROFIT'].includes(signalObj.status);

      if (!isPro && !isClosed) {
        return {
          ...signalObj,
          entry: 0,
          targets: [0],
          sl: 0,
          currentPrice: 0,
          isLocked: true
        };
      }
      return signalObj;
    });

    // 5. Calculate Stats
    const stats = await signalsService.getOverallStats();

    // 6. Telegram Connectivity Check
    const telegram = getTelegramStatus();

    return {
      user: user || null,
      isPro,
      homeContent,
      signals: processedSignals,
      stats,
      telegram
    };
  } catch (err) {
    console.error('Bootstrap Error:', err);
    return reply.code(500).send({ error: 'Failed to bootstrap data' });
  }
};

export const getSystemHealth = async (req, reply) => {
  const mongoose = (await import('mongoose')).default;
  const { pub } = await import('../../loaders/redis.js');
  const socketService = (await import('../../loaders/socket.js')).default;

  const health = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    memory: process.memoryUsage(),
    dependencies: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: pub.status === 'ready' ? 'connected' : pub.status,
      socketIO: socketService.getIO() ? 'active' : 'inactive',
    },
    metrics: {
      activeSockets: socketService.getIO()?.engine.clientsCount || 0,
      eventLoopLag: 'pending_instrumentation'
    }
  };

  const isHealthy = health.dependencies.mongodb === 'connected' && health.dependencies.redis === 'connected';
  return reply.code(isHealthy ? 200 : 503).send(health);
};
