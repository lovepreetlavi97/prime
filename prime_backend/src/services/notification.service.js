import socketService from '../loaders/socket.js';
import { pub } from '../loaders/redis.js';
import logger from '../utils/logger.js';

/**
 * NOTIFICATION SERVICE
 * Handles high-scale, ultra-low latency event delivery to users.
 */
class NotificationService {
  async broadcastSignal(signal) {
    try {
      // Unified global emission mapping to the dedicated Redis channels
      await socketService.emitGlobal('new_signal', signal);
      logger.info(`📡 [Notification] Broadcasted signal ${signal.symbol} via socketService.emitGlobal`);
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
