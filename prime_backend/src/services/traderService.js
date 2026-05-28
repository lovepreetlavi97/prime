export class TraderService {
  constructor({ startingBalance }) {
    this.balance = startingBalance;
    this.position = null;
  }

  buy(price) {
    if (this.position) return;

    this.position = { entry: price };
    console.log(`🟢 BUY at ₹${price}`);
  }

  sell(price) {
    if (!this.position) return;

    const pnl = price - this.position.entry;
    this.balance += pnl;

    console.log(`🔴 SELL at ₹${price} | PnL: ₹${pnl.toFixed(2)}`);
    console.log(`💰 Balance: ₹${this.balance.toFixed(2)}`);

    this.position = null;
  }
}