import logger from "../../utils/logger.js";

class DhanIndicatorEngine {
  constructor() {
    this.candles = {}; // token -> array of candles: { open, high, low, close, volume, timestamp }
    this.currentCandles = {}; // token -> current active candle
    this.indicators = {}; // token -> current indicator output
  }

  processTick(token, price, volume = 100) {
    const now = Date.now();
    const timeframeMs = 60 * 1000; // 1-minute candles

    if (!this.candles[token]) {
      this.candles[token] = [];
    }

    let activeCandle = this.currentCandles[token];
    const candleStart = Math.floor(now / timeframeMs) * timeframeMs;

    if (!activeCandle || activeCandle.timestamp !== candleStart) {
      // Close old active candle and add it to historical window
      if (activeCandle) {
        this.candles[token].push(activeCandle);
        // Keep last 100 candles to optimize memory
        if (this.candles[token].length > 100) {
          this.candles[token].shift();
        }
        // Recalculate indicators on completed candle close
        this.recalculate(token);
      }

      // Start new candle
      activeCandle = {
        open: price,
        high: price,
        low: price,
        close: price,
        volume: volume,
        timestamp: candleStart
      };
      this.currentCandles[token] = activeCandle;
    } else {
      // Update active candle
      activeCandle.high = Math.max(activeCandle.high, price);
      activeCandle.low = Math.min(activeCandle.low, price);
      activeCandle.close = price;
      activeCandle.volume += volume;
    }
  }

  recalculate(token) {
    const history = this.candles[token];
    if (!history || history.length < 20) {
      // Standard neutral states
      this.indicators[token] = {
        trend: 'NEUTRAL',
        rsi: 50,
        ema9: 0,
        ema20: 0,
        ema50: 0,
        isBreakout: false,
        volumeSpike: false,
        price: history.length > 0 ? history[history.length - 1].close : 0
      };
      return;
    }

    const closes = history.map(c => c.close);
    const highs = history.map(c => c.high);
    const lows = history.map(c => c.low);
    const volumes = history.map(c => c.volume);
    const currentPrice = closes[closes.length - 1];

    // 1. Calculate EMAs
    const ema9 = this.calculateEMA(closes, 9);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);

    // 2. Calculate RSI (14)
    const rsi = this.calculateRSI(closes, 14);

    // 3. Volume Spike Detection
    const avgVolume = volumes.slice(-10, -1).reduce((sum, v) => sum + v, 0) / 9;
    const currentVolume = volumes[volumes.length - 1];
    const volumeSpike = currentVolume > avgVolume * 2.5;

    // 4. Breakout Detection (breakout of 20-candle high/low channels)
    const recentHigh = Math.max(...highs.slice(-21, -1));
    const recentLow = Math.min(...lows.slice(-21, -1));
    const isBreakout = currentPrice > recentHigh || currentPrice < recentLow;

    // 5. Overall Trend
    let trend = 'NEUTRAL';
    if (currentPrice > ema20 && ema9 > ema20) trend = 'UP';
    if (currentPrice < ema20 && ema9 < ema20) trend = 'DOWN';

    this.indicators[token] = {
      trend,
      rsi: Math.round(rsi),
      ema9: parseFloat(ema9.toFixed(2)),
      ema20: parseFloat(ema20.toFixed(2)),
      ema50: parseFloat(ema50.toFixed(2)),
      isBreakout,
      volumeSpike,
      price: currentPrice
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

  getIndicators(token) {
    // Return cached indicators or calculate a quick snap if not fully cached
    if (this.indicators[token]) {
      return this.indicators[token];
    }
    
    // Quick snap calculations
    const history = this.candles[token] || [];
    const active = this.currentCandles[token];
    const price = active ? active.close : (history.length > 0 ? history[history.length - 1].close : 0);

    return {
      trend: 'NEUTRAL',
      rsi: 50,
      ema9: price,
      ema20: price,
      ema50: price,
      isBreakout: false,
      volumeSpike: false,
      price
    };
  }
}

const indicatorEngine = new DhanIndicatorEngine();
export default indicatorEngine;
