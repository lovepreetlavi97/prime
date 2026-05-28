import { pack } from "msgpackr";
import { pub } from "../../loaders/redis.js";
import logger from "../../utils/logger.js";

class DhanRedisPublisher {
  /**
   * Publish a custom realtime event to Redis Pub/Sub channel
   * @param {string} event - Event name (e.g. 'price_update', 'new_signal')
   * @param {Object} data - Message payload
   * @param {string|null} room - Target client room (optional)
   */
  async publishEvent(event, data, room = null) {
    try {
      const payload = pack({ event, data, room });
      await pub.publish('GLOBAL_REALTIME_EVENTS', payload);
    } catch (err) {
      logger.error(`❌ [RedisPublisher] Failed to publish event ${event}: ${err.message}`);
    }
  }
}

const redisPublisher = new DhanRedisPublisher();
export default redisPublisher;
