import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import errorMiddleware from './middlewares/errorMiddleware.js';
import authMiddleware from './middlewares/authMiddleware.js';
import optionalAuthMiddleware from './middlewares/optionalAuthMiddleware.js';
import signalsRoutes from './modules/signals/signals.routes.js';
import subscriptionRoutes from './modules/subscriptions/subscriptions.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import marketDataRoutes from './modules/marketData/marketData.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import homeContentRoutes from './modules/system/homeContent.routes.js';
import systemRoutes from './modules/system/system.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';

const isProduction = process.env.NODE_ENV === 'production';

const createApp = async () => {
  const fastify = Fastify({
    logger: isProduction ? { level: 'warn' } : {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' }
      }
    },
    routerOptions: {
      ignoreTrailingSlash: true,
    },
    connectionTimeout: 30000, 
    keepAliveTimeout: 65000,
  });

  // Decorators for easy middleware access
  fastify.decorate('authenticate', authMiddleware);
  fastify.decorate('authenticateOptional', optionalAuthMiddleware);

  // Plugins
  await fastify.register(cors, {
    origin: true, // Scaling: In production, strictly define allowed domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // 🔥 SECURE JWT
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Application cannot start securely.');
    process.exit(1);
  }
  await fastify.register(jwt, { secret: process.env.JWT_SECRET });

  // ... (Routes)
  await fastify.register(authRoutes, { prefix: '/api/v1/auth' });
  await fastify.register(userRoutes, { prefix: '/api/v1/profile' });
  await fastify.register(signalsRoutes, { prefix: '/api/v1/signals' });
  await fastify.register(subscriptionRoutes, { prefix: '/api/v1/subscriptions' });
  await fastify.register(adminRoutes, { prefix: '/api/v1/admin' });
  await fastify.register(marketDataRoutes, { prefix: '/api/v1/market' });
  await fastify.register(homeContentRoutes, { prefix: '/api/home-content' });
  await fastify.register(systemRoutes, { prefix: '/api/v1/system' });
  await fastify.register(aiRoutes, { prefix: '/api/v1/ai' });

  // Health check
  fastify.get('/health', async () => ({ 
    status: 'UP', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }));

  // Global Error Handler
  fastify.setErrorHandler(errorMiddleware);

  // 🔥 GRACEFUL SHUTDOWN HANDLER
  const gracefulShutdown = async (signal) => {
    fastify.log.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
      await fastify.close();
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      fastify.log.info('Closed DB connections and Server. Exit successful.');
      process.exit(0);
    } catch (err) {
      fastify.log.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  return fastify;
};

export default createApp;
