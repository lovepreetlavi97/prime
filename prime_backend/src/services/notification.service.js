import socketService from '../loaders/socket.js';
import { pub } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * NOTIFICATION SERVICE
 * Handles high-scale, ultra-low latency event delivery to users.
 */
class NotificationService {
  /**
   * Send a global signal update
   */
  async broadcastSignal(signal) {
    try {
      // 1. Publish to Redis Pub/Sub for cross-server broadcast
      const payload = JSON.stringify({ type: 'NEW_SIGNAL', signal });
      await pub.publish('SIGNAL_EVENTS', payload);
      
      logger.info(`📡 [Notification] Broadcasted signal ${signal.symbol} via Pub/Sub`);
    } catch (err) {
      logger.error(`[Notification] Broadcast failed: ${err.message}`);
    }
  }

  /**
   * Send private notification to specific user (Multi-device)
   */
  async sendToUser(userId, event, data) {
    try {
      // Socket.io Redis adapter handles cross-server room emission automatically
      const io = socketService.getIO();
      io.to(`user:${userId}`).emit(event, data);
    } catch (err) {
      logger.error(`[Notification] Private send failed: ${err.message}`);
    }
  }
}

export default new NotificationService();
