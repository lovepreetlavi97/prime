import { cache } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * PRESENCE SERVICE
 * Tracks online users across multiple backend instances using Redis.
 */
class PresenceService {
  constructor() {
    this.USER_KEY = 'presence:users'; // HSET: userId -> lastSeen
    this.HEARTBEAT_TTL = 60; // 60 seconds
  }

  /**
   * Mark user as online
   */
  async setUserOnline(userId, socketId) {
    try {
      const now = Date.now();
      // Store socket to user mapping for targeted disconnects
      await cache.hset(this.USER_KEY, userId, now);
      await cache.set(`socket:${socketId}:user`, userId, 'EX', this.HEARTBEAT_TTL);
    } catch (err) {
      logger.error(`[Presence] Error setting online: ${err.message}`);
    }
  }

  /**
   * Mark user as offline
   */
  async setUserOffline(userId, socketId) {
    try {
      await cache.hdel(this.USER_KEY, userId);
      await cache.del(`socket:${socketId}:user`);
    } catch (err) {
      logger.error(`[Presence] Error setting offline: ${err.message}`);
    }
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId) {
    const lastSeen = await cache.hget(this.USER_KEY, userId);
    if (!lastSeen) return false;
    
    // Check if heartbeat is stale
    return (Date.now() - parseInt(lastSeen)) < (this.HEARTBEAT_TTL * 1000);
  }

  /**
   * Get total online users count
   */
  async getOnlineCount() {
    return await cache.hlen(this.USER_KEY);
  }
}

export default new PresenceService();
