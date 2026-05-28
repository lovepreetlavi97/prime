import Redis from 'ioredis';
import logger from '../utils/logger.js';

/**
 * REDIS ARCHITECTURE (Distributed Scaling)
 * Separates responsibilities to avoid single-instance bottlenecks.
 */
class RedisLoader {
  constructor() {
    const config = {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: null, // 🔥 Required for BullMQ
    };

    // 1. CACHE: For session, presence, and transient data
    this.cache = new Redis(config);
    
    // 2. QUEUE: Dedicated for BullMQ
    this.queue = new Redis(config);

    // 3. PUBSUB: For cross-server socket signaling
    this.pub = new Redis(config);
    this.sub = new Redis(config);

    this.setupListeners();
  }

  setupListeners() {
    this.cache.on('connect', () => logger.info('🚀 Redis [Cache] Connected'));
    this.queue.on('connect', () => logger.info('🚀 Redis [Queue] Connected'));
    this.pub.on('connect', () => logger.info('🚀 Redis [Pub] Connected'));
    this.sub.on('connect', () => logger.info('🚀 Redis [Sub] Connected'));
    
    // 🔥 CRITICAL: Prevent app from crashing if Redis is down
    this.cache.on('error', (err) => logger.error('❌ Redis [Cache] Error:', err.message));
    this.queue.on('error', (err) => logger.error('❌ Redis [Queue] Error:', err.message));
    this.pub.on('error', (err) => logger.error('❌ Redis [Pub] Error:', err.message));
    this.sub.on('error', (err) => logger.error('❌ Redis [Sub] Error:', err.message));
  }

  getConnections() {
    return {
      cache: this.cache,
      queue: this.queue,
      pub: this.pub,
      sub: this.sub,
    };
  }
}

const redisLoader = new RedisLoader();
export default redisLoader;
export const { cache, queue, pub, sub } = redisLoader.getConnections();
