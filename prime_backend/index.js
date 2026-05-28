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

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Initialize Database
    await connectDB();

    // 2. Initialize Instruments (Dhan Scrip Master)
    await instrumentService.init();

    // 3. Initialize Fastify App
    const app = await createApp();

    // 3. Initialize Socket.io (Distributed Mode)
    await socketService.init(app.server);

    // 🚀 Initialize uWebSockets.js Engine (Hot Path)
    uwsLoader.init();

    // 4. Start Live Services (Price Tracker, Telegram, Workers, etc.)
    initDistributedListeners();
    
    startWorkers();
    startPriceTracker();
    await startTelegramIntegration();

    // 5. Initialize Dhan Price Feed WebSocket - Auto-connect
    dhanWebSocket.connect();

    // 6. Start Listening
    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`🚀 Server ready at http://localhost:${PORT}`);

  } catch (err) {
    logger.error('💥 Failed to start server:', err);
    console.error('FULL ERROR:', err);
    process.exit(1);
  }
};

startServer();
