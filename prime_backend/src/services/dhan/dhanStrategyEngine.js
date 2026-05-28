import indicatorEngine from "./dhanIndicatorEngine.js";
import logger from "../../utils/logger.js";

class DhanStrategyEngine {
  /**
   * Determine the market bias for a given token
   * @param {string} token - Dhan Security ID
   * @returns {string} - 'BULLISH' | 'BEARISH' | 'NEUTRAL'
   */
  getMarketBias(token) {
    const indicators = indicatorEngine.getIndicators(token);
    if (!indicators) return 'NEUTRAL';

    const { trend, rsi, isBreakout, volumeSpike } = indicators;

    // CE Scalping Check (Bullish Setup)
    const isCeSetup = trend === 'UP' && rsi >= 55 && rsi <= 75 && (isBreakout || volumeSpike);

    // PE Scalping Check (Bearish Setup)
    const isPeSetup = trend === 'DOWN' && rsi <= 45 && rsi >= 25 && (isBreakout || volumeSpike);

    if (isCeSetup) {
      logger.info(`🔥 [StrategyEngine] CE Scalp Triggered for ${token} (RSI: ${rsi}, Trend: ${trend})`);
      return 'BULLISH';
    }

    if (isPeSetup) {
      logger.info(`🔥 [StrategyEngine] PE Scalp Triggered for ${token} (RSI: ${rsi}, Trend: ${trend})`);
      return 'BEARISH';
    }

    // Default basic trend matching if no strict scalp triggers
    if (trend === 'UP' && rsi > 50) return 'BULLISH';
    if (trend === 'DOWN' && rsi < 50) return 'BEARISH';

    return 'NEUTRAL';
  }

  /**
   * Validate if a signal aligns with current indicator configurations
   * @param {string} underlyingSymbol - NIFTY, BANKNIFTY
   * @param {string} optionType - CE, PE
   * @returns {boolean} - True if it aligns, False otherwise
   */
  validateSignal(underlyingSymbol, optionType) {
    // Map underlying standard name to Dhan Spot Token ID
    // 13 = NIFTY 50 Index Spot, 25 = BANKNIFTY Index Spot
    const token = (underlyingSymbol.toUpperCase() === 'BANKNIFTY') ? '25' : '13';
    const bias = this.getMarketBias(token);

    if (optionType === 'CE' && bias === 'BULLISH') return true;
    if (optionType === 'PE' && bias === 'BEARISH') return true;

    return false;
  }
}

const strategyEngine = new DhanStrategyEngine();
export default strategyEngine;
