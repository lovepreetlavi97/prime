import { cache } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * 🛡️ DISTRIBUTED REDIS RATE LIMITER
 * Protects APIs from DDoS, brute-force, and heavy polling.
 * Fail-open design ensures system availability if Redis experiences hiccups.
 */
export default async function rateLimiter(req, reply) {
  try {
    // Identify by authenticated user ID, fallback to client IP
    const identifier = req.user?.id || req.user?._id || req.ip;
    const key = `rate_limit:${identifier}`;
    
    const limit = 150; // 150 requests per minute
    const current = await cache.incr(key);
    
    if (current === 1) {
      await cache.expire(key, 60); // Reset window after 60 seconds
    }
    
    // Set rate limit headers
    reply.header('X-RateLimit-Limit', limit);
    reply.header('X-RateLimit-Remaining', Math.max(0, limit - current));
    
    if (current > limit) {
      logger.warn(`⚠️ [RateLimit] Rate limit exceeded for ${identifier} (${current}/${limit})`);
      return reply.code(429).send({
        success: false,
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please wait a moment before sending more requests.'
      });
    }
  } catch (err) {
    logger.error(`❌ [RateLimit] Middleware error: ${err.message}`);
    // Fail-open: Let the request pass if rate limiter database connectivity fails
  }
}
