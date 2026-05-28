import { cache } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * ⚡ HIGH-PERFORMANCE REDIS API CACHE MIDDLEWARE
 * Serves GET responses directly from Redis to eliminate DB overhead.
 * Handles user segmentation (pro vs. free) to prevent private data leakage.
 */
export const routeCache = (ttlInSeconds = 30) => {
  return async (req, reply) => {
    // Only cache GET requests
    if (req.method !== 'GET') return;

    const user = req.user;
    const now = new Date();
    
    // User segmentation check
    const isPro = user?.role === 'ADMIN' || (
      user?.subscription?.plan && 
      user?.subscription?.plan !== 'free' && 
      user?.subscription?.isActive && 
      (!user?.subscription?.endDate || new Date(user.subscription.endDate) > now)
    );

    const userSegment = isPro ? 'pro' : 'free';
    
    // Generate cache key combining path, query parameters, and user segment
    const key = `api_cache:${req.url}:${userSegment}`;
    
    try {
      const cachedResponse = await cache.get(key);
      if (cachedResponse) {
        const { status, headers, body } = JSON.parse(cachedResponse);
        
        // Restore headers
        for (const [name, value] of Object.entries(headers)) {
          reply.header(name, value);
        }
        
        reply.header('X-Cache', 'HIT');
        return reply.code(status).send(body);
      }
      
      // Cache miss: Flag the request so onSend hook can capture and save the response
      reply.header('X-Cache', 'MISS');
      req.cacheKey = key;
      req.cacheTTL = ttlInSeconds;
    } catch (err) {
      logger.error(`❌ [CacheMiddleware] Error reading cache key ${key}: ${err.message}`);
    }
  };
};

/**
 * Fastify hook to capture and write response payloads to Redis cache
 */
export const cacheOnSendHook = async (req, reply, payload) => {
  if (req.cacheKey && reply.statusCode >= 200 && reply.statusCode < 300) {
    try {
      const responseToCache = {
        status: reply.statusCode,
        headers: reply.getHeaders(),
        body: typeof payload === 'string' ? payload : JSON.stringify(payload)
      };
      
      await cache.set(req.cacheKey, JSON.stringify(responseToCache), 'EX', req.cacheTTL);
    } catch (err) {
      logger.error(`❌ [CacheMiddleware] Save cache error: ${err.message}`);
    }
  }
  return payload;
};

/**
 * Flush cache key or pattern (for invalidations on updates)
 */
export const invalidateCachePattern = async (pattern) => {
  try {
    const keys = await cache.keys(`api_cache:${pattern}`);
    if (keys.length > 0) {
      await cache.del(...keys);
      logger.debug(`🧹 [Cache] Invalidated ${keys.length} cached API routes matching ${pattern}`);
    }
  } catch (err) {
    logger.error(`❌ [CacheMiddleware] Invalidation error: ${err.message}`);
  }
};
