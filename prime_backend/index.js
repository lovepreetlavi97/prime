import 'dotenv/config';
import createApp from './src/app.js';
import connectDB from './src/loaders/mongoose.js';
import socketService from './src/loaders/socket.js';
import logger from './src/utils/logger.js';
import { startPriceTracker, initDistributedListeners } from './src/services/priceTracker.service.js';
import { startTelegramIntegration } from './src/modules/telegram/telegram.listener.js';
import dhanWebSocket from './src/services/dhan/dhanWebSocket.js';
import mockPriceService from './src/services/mockPriceService.js';
import instrumentService from './src/services/instrument.service.js';
import { startWorkers } from './src/loaders/queue.js';
import uwsLoader from './src/loaders/uws.js';
import { onDhanRecovery } from './src/services/dhan/dhanApiClient.js';
import signalsService from './src/modules/signals/signals.service.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Initialize Database
    await connectDB();

    // Register Dhan API recovery handler for pending unverified signals
    onDhanRecovery(() => {
      signalsService.autoReverifyPendingSignals().catch(err => {
        logger.error(`[DhanRecovery] Failed to auto-reverify pending: ${err.message}`);
      });
    });

    // 2. Initialize Instruments (Dhan Scrip Master)
    await instrumentService.init();

    // 3. Initialize Fastify App
    const app = await createApp();

    // 3. Initialize Socket.io (Distributed Mode with App context for JWT)
    await socketService.init(app.server, app);

    // 🚀 Initialize uWebSockets.js Engine (Hot Path)
    uwsLoader.init();

    // 4. Start Live Services (Price Tracker, Telegram, Workers, etc.)
    initDistributedListeners();
    
    startWorkers();
    startPriceTracker();
    await startTelegramIntegration();

    // 5. Initialize Dhan Price Feed WebSocket - Auto-connect
    dhanWebSocket.connect();

    // Start mock price service for testing/fallback in local dev
    mockPriceService.setSocketIO(socketService.getIO());
    mockPriceService.start();

    // 6. Start Listening
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 Server ready at http://localhost:${PORT}`);

    // 🔥 ORCHESTRATED GRACEFUL SHUTDOWN
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting orchestrator graceful shutdown...`);
      try {
        // 1. Close Fastify Server (stops accepting incoming connections)
        await app.close();
        
        // 2. Close DB
        const mongoose = (await import('mongoose')).default;
        await mongoose.connection.close();
        
        // 3. Close WebSockets
        if (dhanWebSocket.ws) {
          dhanWebSocket.ws.terminate();
        }
        if (priceWebSocket.ws) {
          priceWebSocket.ws.terminate();
        }
        
        // 4. Disconnect Redis connection pool
        const { default: redisLoader } = await import('./src/loaders/redis.js');
        const connections = redisLoader.getConnections();
        for (const conn of Object.values(connections)) {
          await conn.quit();
        }
        
        logger.info('✅ Closed DB, WebSockets, Redis pool, and Server. Exit clean.');
        process.exit(0);
      } catch (err) {
        logger.error('❌ Error during graceful shutdown:', err);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    logger.error('💥 Failed to start server:', err);
    console.error('FULL ERROR:', err);
    process.exit(1);
  }
};

startServer();
