import logger from '../utils/logger.js';

class ScoreEngineService {
  /**
   * Generate Confidence Score
   * @param {Object} indicators - Output from indicatorService.calculateIndicators
   * @param {Object} signal - The parsed signal object
   * @param {string} rawText - The raw message text to check for keywords
   */
  generateScore(indicators, signal, rawText = '') {
    // Manual keyword boost
    const text = (rawText || '').toLowerCase();
    const isUrgentBuy = [
      'buy fast', 'buy kro guyz', 'jaldi buy kro', 'buy kro'
    ].some(k => text.includes(k));

    if (isUrgentBuy) {
      return {
        confidenceScore: 95,
        rating: 'PREMIUM',
        trend: indicators.trend || 'UP',
        rsi: indicators.rsi || 60,
        momentum: 'HIGH',
        volatility: 'MEDIUM',
        approved: true
      };
    }

    let score = 0;
    const isCE = signal.optionType === 'CE';
    const isPE = signal.optionType === 'PE';
    
    const { trend, rsi, momentum, volatility, isBreakout } = indicators;

    // 1. Trend Aligned (+20)
    if (isCE && trend === 'UP') score += 20;
    else if (isPE && trend === 'DOWN') score += 20;
    else if (trend === 'NEUTRAL') score += 10;

    // 2. RSI Healthy (+15)
    // For Buying CE (Bullish): Want RSI between 40 and 65 (not overbought yet)
    // For Buying PE (Bearish): Want RSI between 35 and 60 (not oversold yet)
    if (isCE) {
       if (rsi >= 45 && rsi <= 65) score += 15;
       else if (rsi > 65) score += 8; // Maybe overextended
       else if (rsi < 45) score += 5;
    } else if (isPE) {
       if (rsi >= 35 && rsi <= 55) score += 15;
       else if (rsi < 35) score += 8; // Maybe overextended
       else if (rsi > 55) score += 5;
    } else {
       score += 10;
    }

    // 3. Volume/Breakout Active (+15)
    if (isBreakout) score += 15;
    else score += 5;

    // 4. Momentum Strong (+15)
    if (momentum === 'HIGH') score += 15;
    else if (momentum === 'MEDIUM') score += 10;
    else score += 5;

    // 5. Near Support/Resistance (+20)
    // Simplified logic: +20 if breakout, else +10
    if (isBreakout) score += 20;
    else score += 10;

    // 6. Volatility Good (+15)
    if (volatility === 'MEDIUM') score += 15;
    else if (volatility === 'HIGH') score += 10; // High can be risky
    else score += 5;

    // Map score to Rating
    let rating = 'WEAK';
    if (score >= 85) rating = 'PREMIUM';
    else if (score >= 70) rating = 'STRONG';
    else if (score >= 50) rating = 'MEDIUM';

    return {
      confidenceScore: score,
      rating,
      trend,
      rsi,
      momentum,
      volatility,
      approved: score >= 60 // Auto-approve if score is 60+
    };
  }
}

export default new ScoreEngineService();
