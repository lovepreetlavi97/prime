import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import compress from '@fastify/compress';
import errorMiddleware from './middlewares/errorMiddleware.js';
import authMiddleware from './middlewares/authMiddleware.js';
import optionalAuthMiddleware from './middlewares/optionalAuthMiddleware.js';
import rateLimiter from './middlewares/rateLimiter.js';
import { cacheOnSendHook } from './middlewares/cacheMiddleware.js';
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

  // ⚡ COMPRESSION
  await fastify.register(compress, {
    global: true,
    threshold: 1024, // Compress responses over 1KB
  });

  // 🔥 SECURE JWT
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set. Application cannot start securely.');
    process.exit(1);
  }
  await fastify.register(jwt, { secret: process.env.JWT_SECRET });

  // 🛡️ SECURITY HEADERS (Helmet Emulation)
  fastify.addHook('onSend', async (request, reply, payload) => {
    reply.header('X-DNS-Prefetch-Control', 'off');
    reply.header('Expect-CT', 'max-age=86400, enforce');
    reply.header('Frame-Options', 'SAMEORIGIN');
    reply.header('X-Frame-Options', 'SAMEORIGIN');
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Permitted-Cross-Domain-Policies', 'none');
    reply.header('Referrer-Policy', 'no-referrer');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    reply.header('Content-Security-Policy', "default-src 'self'; base-uri 'self'; font-src 'self' https: data:; form-action 'self'; frame-ancestors 'none'; frame-src 'self' https://*.razorpay.com; img-src 'self' data: https://*.razorpay.com; object-src 'none'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; connect-src 'self' https://api.razorpay.com https://*.razorpay.com; upgrade-insecure-requests");
    return payload;
  });

  // ⚡ API RESPONSE CACHING WRITE HOOK
  fastify.addHook('onSend', cacheOnSendHook);

  // 🛡️ DISTRIBUTED RATE LIMITER
  fastify.addHook('preHandler', async (req, reply) => {
    // Only rate limit API paths, skip health check
    if (req.url.startsWith('/api/')) {
      await rateLimiter(req, reply);
    }
  });

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

  return fastify;
};

export default createApp;
