export class SwingStrategy {
  constructor({ trader }) {
    this.trader = trader;
    this.closes = [];
  }

  // 📊 Simple EMA
  calculateEMA(data, period) {
    const k = 2 / (period + 1);
    let ema = data[0];

    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }

    return ema;
  }

  onCandle(candle) {
    this.closes.push(candle.close);

    if (this.closes.length < 21) return;

    const ema9 = this.calculateEMA(this.closes.slice(-9), 9);
    const ema21 = this.calculateEMA(this.closes.slice(-21), 21);

    console.log(`📊 EMA9: ${ema9.toFixed(2)} | EMA21: ${ema21.toFixed(2)}`);

    // 🚀 SIMPLE SIGNAL
    if (ema9 > ema21) {
      console.log("🟢 BUY SIGNAL");
      this.trader.buy(candle.close);
    } else if (ema9 < ema21) {
      console.log("🔴 SELL SIGNAL");
      this.trader.sell(candle.close);
    }
  }
}
