import mongoose from 'mongoose';
import 'dotenv/config';
import Signal from '../src/models/Signal.js';
import Package from '../src/models/Package.js';

async function seedSignals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing subscription packages.');

    // Clear existing signals to guarantee a clean state
    await Signal.deleteMany({});
    console.log('Cleared existing signals.');

    // Seed Pro Subscription Package
    const packageData = {
      name: 'Pro Tier',
      price: 4999,
      durationInDays: 30,
      features: [
        'Real-time signals (instant)',
        'Full entry, SL & target levels',
        'Unlimited signal history',
        'AI guidance & reasoning',
        'Instant push alerts',
        'VIP Telegram access',
        'Advanced market analytics',
        'Priority support'
      ],
      badge: 'POPULAR',
      isActive: true
    };

    await Package.create(packageData);
    console.log('Successfully seeded Pro subscription package!');

    const signals = [
      {
        symbol: 'NIFTY',
        market: 'NSE',
        type: 'BUY',
        entry: 120.0,
        sl: 95.0,
        targets: [160.0, 180.0, 200.0],
        currentPrice: 120.0,
        highPrice: 120.0,
        timeframe: '5m',
        aiScore: 92,
        aiSentiment: 'Bullish',
        aiRationale: 'Strong option chain support observed at 24200 strike. FII net flow confirms Smart Money accumulation.',
        confidenceScore: 92,
        rating: 'PREMIUM',
        trend: 'UP',
        rsi: 62.4,
        momentum: 'HIGH',
        volatility: 'MEDIUM',
        approved: true,
        optionType: 'CE',
        strike: 24200,
        status: 'ACTIVE',
        source: 'LVX Terminal Alpha',
        telegramMessageId: '12345',
        rawText: 'NIFTY 24200 CE BUY ABOVE 120 TGT 160/180/200 SL 95',
        guidance: 'Enter in 118-122 range. Keep target orders set.'
      },
      {
        symbol: 'BANKNIFTY',
        market: 'NSE',
        type: 'BUY',
        entry: 340.0,
        sl: 280.0,
        targets: [420.0, 480.0, 520.0],
        currentPrice: 340.0,
        highPrice: 340.0,
        timeframe: '5m',
        aiScore: 88,
        aiSentiment: 'Bullish',
        aiRationale: 'Reversal pattern confirmed on 15m time frame. Open Interest buildup shows fresh long positions.',
        confidenceScore: 88,
        rating: 'STRONG',
        trend: 'UP',
        rsi: 58.1,
        momentum: 'HIGH',
        volatility: 'HIGH',
        approved: true,
        optionType: 'PE',
        strike: 51300,
        status: 'ACTIVE',
        source: 'LVX Terminal Alpha',
        telegramMessageId: '12346',
        rawText: 'BANKNIFTY 51300 PE BUY ABOVE 340 TGT 420/480 SL 280',
        guidance: 'Enter with moderate size. Volatility is high.'
      },
      {
        symbol: 'NIFTY',
        market: 'NSE',
        type: 'BUY',
        entry: 85.0,
        sl: 60.0,
        targets: [110.0, 130.0, 150.0],
        currentPrice: 152.0,
        highPrice: 155.0,
        timeframe: '5m',
        aiScore: 94,
        aiSentiment: 'Bullish',
        aiRationale: 'Volume expansion at breakout level. Target 1 achieved rapidly.',
        confidenceScore: 94,
        rating: 'PREMIUM',
        trend: 'UP',
        rsi: 74.5,
        momentum: 'HIGH',
        volatility: 'LOW',
        approved: true,
        optionType: 'CE',
        strike: 24300,
        status: 'CLOSED_PROFIT',
        source: 'LVX Terminal Alpha',
        telegramMessageId: '12347',
        rawText: 'NIFTY 24300 CE BUY ABOVE 85 TGT 110/130 SL 60',
        guidance: 'Target 2 hit. Exit all positions.',
        exitPrice: 152.0
      }
    ];

    await Signal.insertMany(signals);
    console.log('Successfully seeded 3 live-trade mock signals!');
  } catch (error) {
    console.error('❌ Failed to seed signals:', error);
  } finally {
    process.exit(0);
  }
}

seedSignals();
