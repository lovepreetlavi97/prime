import { pub } from '../loaders/redis.js';
import { pack } from 'msgpackr';

class MockPriceService {
  constructor() {
    this.io = null;
    this.prices = {
      "NIFTY 50": 24230.85,
      "BANKNIFTY": 51275.05,
      "FINNIFTY": 24120.30,
      "SENSEX": 79040.36,
      "INDIA VIX": 18.60,
      "USD-INR": 84.58
    };
    this.tokenMap = {
      "NIFTY 50": "13",
      "BANKNIFTY": "25",
      "FINNIFTY": "26037",
      "SENSEX": "99926000",
      "INDIA VIX": "260105",
      "USD-INR": "999999"
    };
    this.openPrices = {};
    this.interval = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  start() {
    console.log("🔄 Starting mock price service for testing...");
    this.openPrices = { ...this.prices };
    
    // Send initial prices
    this.sendInitialPrices();
    
    // Update prices every 2 seconds
    this.interval = setInterval(() => {
      this.updatePrices();
    }, 2000);
  }

  sendInitialPrices() {
    Object.keys(this.prices).forEach(instrument => {
      const openPrice = this.openPrices[instrument] || this.prices[instrument];
      const changePercent = parseFloat((((this.prices[instrument] - openPrice) / openPrice) * 100).toFixed(2));
      const priceData = {
        instrument,
        token: this.tokenMap[instrument] || "0",
        price: this.prices[instrument],
        changePercent: changePercent,
        timestamp: new Date().toISOString()
      };
      
      if (this.io) {
        this.io.emit('price_update', priceData);
        this.io.emit('market_feed', priceData);
      }
      
      const payload = pack({
        event: 'price_update',
        data: priceData,
        room: null
      });
      pub.publish('GLOBAL_REALTIME_EVENTS', payload);
      
      console.log(`📡 Initial broadcast: ${instrument} | ₹${this.prices[instrument].toFixed(2)} (${changePercent >= 0 ? '+' : ''}${changePercent}%)`);
    });
  }

  updatePrices() {
    Object.keys(this.prices).forEach(instrument => {
      // Generate random price movement
      const basePrice = this.prices[instrument];
      const openPrice = this.openPrices[instrument] || basePrice;
      const changePercent = (Math.random() - 0.5) * 0.05; // -0.025% to +0.025% per tick
      const newPrice = basePrice * (1 + changePercent / 100);
      
      this.prices[instrument] = parseFloat(newPrice.toFixed(2));
      
      const dailyChangePercent = parseFloat((((newPrice - openPrice) / openPrice) * 100).toFixed(2));
      
      const priceData = {
        instrument,
        token: this.tokenMap[instrument] || "0",
        price: this.prices[instrument],
        changePercent: dailyChangePercent,
        timestamp: new Date().toISOString()
      };
      
      if (this.io) {
        this.io.emit('price_update', priceData);
        this.io.emit('market_feed', priceData);
      }
      
      const payload = pack({
        event: 'price_update',
        data: priceData,
        room: null
      });
      pub.publish('GLOBAL_REALTIME_EVENTS', payload);
    });
  }

  getAllPrices() {
    const result = {};
    Object.keys(this.prices).forEach(instrument => {
      const openPrice = this.openPrices[instrument] || this.prices[instrument];
      const changePercent = parseFloat((((this.prices[instrument] - openPrice) / openPrice) * 100).toFixed(2));
      result[instrument] = {
        price: this.prices[instrument],
        changePercent,
        timestamp: new Date().toISOString()
      };
    });
    return result;
  }

  getConnectionStatus() {
    return {
      isConnected: true,
      timestamp: new Date().toISOString(),
      mode: 'mock'
    };
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    console.log('🔌 Mock price service stopped');
  }
}

export default new MockPriceService();

