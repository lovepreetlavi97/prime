import { cache } from "../../loaders/redis.js";
import indicatorEngine from "./dhanIndicatorEngine.js";
import logger from "../../utils/logger.js";

class DhanMarketSnapshots {
  /**
   * Capture a snapshot of current indicators for a token and cache it in Redis
   * @param {string} token - Dhan Security ID
   */
  async captureSnapshot(token) {
    try {
      const indicators = indicatorEngine.getIndicators(token);
      if (!indicators) return;

      const cacheKey = `market:snapshot:${token}`;
      await cache.set(cacheKey, JSON.stringify({
        ...indicators,
        capturedAt: Date.now()
      }), 'EX', 300); // Expire after 5 minutes
    } catch (err) {
      logger.error(`❌ [MarketSnapshots] Failed to capture snapshot: ${err.message}`);
    }
  }

  /**
   * Retrieve the cached snapshot of indicators
   * @param {string} token - Dhan Security ID
   * @returns {Object|null}
   */
  async getSnapshot(token) {
    try {
      const cacheKey = `market:snapshot:${token}`;
      const snap = await cache.get(cacheKey);
      return snap ? JSON.parse(snap) : null;
    } catch (err) {
      logger.error(`❌ [MarketSnapshots] Failed to retrieve snapshot: ${err.message}`);
      return null;
    }
  }
}

const marketSnapshots = new DhanMarketSnapshots();
export default marketSnapshots;
