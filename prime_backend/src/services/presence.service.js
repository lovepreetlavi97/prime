import { cache } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * PRESENCE SERVICE
 * Tracks online users across multiple backend instances using Redis.
 */
class PresenceService {
  constructor() {
    this.USER_KEY = 'presence:users'; // HSET: userId -> lastSeen
    this.SOCKETS_KEY = 'presence:active_sockets'; // HSET: socketId -> metadata JSON
    this.HEARTBEAT_TTL = 60; // 60 seconds
  }

  /**
   * Mark user as online with full device and tier metadata
   */
  async setUserOnline(userId, socketId, device = 'unknown', tier = 'free') {
    try {
      const now = Date.now();
      const metadata = {
        userId,
        socketId,
        device,
        lastActive: now,
        subscriptionType: tier
      };

      // Store in Redis HSET and keys
      await cache.hset(this.SOCKETS_KEY, socketId, JSON.stringify(metadata));
      if (userId) {
        await cache.hset(this.USER_KEY, userId, now);
        await cache.set(`socket:${socketId}:user`, userId, 'EX', this.HEARTBEAT_TTL);
      }
    } catch (err) {
      logger.error(`[Presence] Error setting online: ${err.message}`);
    }
  }

  /**
   * Mark user/socket as offline
   */
  async setUserOffline(userId, socketId) {
    try {
      await cache.hdel(this.SOCKETS_KEY, socketId);
      if (userId) {
        await cache.hdel(this.USER_KEY, userId);
        await cache.del(`socket:${socketId}:user`);
      }
    } catch (err) {
      logger.error(`[Presence] Error setting offline: ${err.message}`);
    }
  }

  /**
   * Update activity timestamp to prevent heartbeat timeouts
   */
  async updateSocketActivity(socketId) {
    try {
      const metaStr = await cache.hget(this.SOCKETS_KEY, socketId);
      if (metaStr) {
        const metadata = JSON.parse(metaStr);
        metadata.lastActive = Date.now();
        await cache.hset(this.SOCKETS_KEY, socketId, JSON.stringify(metadata));
        if (metadata.userId) {
          await cache.hset(this.USER_KEY, metadata.userId, Date.now());
        }
      }
    } catch (err) {}
  }

  /**
   * Prune dead or unclosed socket connections across node clusters
   */
  async cleanupStaleSockets() {
    try {
      const allSockets = await cache.hgetall(this.SOCKETS_KEY);
      const now = Date.now();
      const pipeline = cache.pipeline();
      
      for (const [socketId, dataStr] of Object.entries(allSockets)) {
        try {
          const data = JSON.parse(dataStr);
          if (now - data.lastActive > this.HEARTBEAT_TTL * 1000) {
            pipeline.hdel(this.SOCKETS_KEY, socketId);
            if (data.userId) {
              pipeline.hdel(this.USER_KEY, data.userId);
            }
          }
        } catch (e) {
          pipeline.hdel(this.SOCKETS_KEY, socketId);
        }
      }
      await pipeline.exec();
    } catch (err) {
      logger.error(`[Presence] Cleanup stale sockets failed: ${err.message}`);
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
