import logger from '../utils/logger.js';

class IndicatorService {
  /**
   * Calculate Indicators from candles
   * @param {Array} candles - Array of [timestamp, open, high, low, close, volume]
   */
  calculateIndicators(candles) {
    if (!candles || candles.length < 20) {
      return {
        trend: 'NEUTRAL',
        rsi: 50,
        momentum: 'MEDIUM',
        volatility: 'MEDIUM',
        strength: 'NORMAL'
      };
    }

    const closes = candles.map(c => c[4]);
    const highs = candles.map(c => c[2]);
    const lows = candles.map(c => c[3]);
    const currentPrice = closes[closes.length - 1];

    // 1. RSI (14)
    const rsi = this.calculateRSI(closes, 14);

    // 2. EMA (9 and 21)
    const ema9 = this.calculateEMA(closes, 9);
    const ema21 = this.calculateEMA(closes, 21);
    
    // 3. Trend
    let trend = 'NEUTRAL';
    if (currentPrice > ema21 && ema9 > ema21) trend = 'UP';
    if (currentPrice < ema21 && ema9 < ema21) trend = 'DOWN';

    // 4. Momentum (ROC)
    const roc = ((currentPrice - closes[closes.length - 10]) / closes[closes.length - 10]) * 100;
    let momentum = 'MEDIUM';
    if (Math.abs(roc) > 0.5) momentum = 'HIGH';
    if (Math.abs(roc) < 0.1) momentum = 'LOW';

    // 5. Volatility (Simple range based)
    const range = Math.max(...highs.slice(-10)) - Math.min(...lows.slice(-10));
    const avgPrice = closes.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const volPercent = (range / avgPrice) * 100;
    let volatility = 'MEDIUM';
    if (volPercent > 0.8) volatility = 'HIGH';
    if (volPercent < 0.2) volatility = 'LOW';

    // 6. Breakout
    const recentHigh = Math.max(...highs.slice(-20, -1));
    const recentLow = Math.min(...lows.slice(-20, -1));
    const isBreakout = currentPrice > recentHigh || currentPrice < recentLow;

    return {
      trend,
      rsi: Math.round(rsi),
      momentum,
      volatility,
      ema9,
      ema21,
      isBreakout,
      currentPrice
    };
  }

  calculateRSI(closes, period) {
    if (closes.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;

    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    let ema = closes[0];
    for (let i = 1; i < closes.length; i++) {
        ema = (closes[i] * k) + (ema * (1 - k));
    }
    return ema;
  }
}

export default new IndicatorService();
