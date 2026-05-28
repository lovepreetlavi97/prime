import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true }, // NIFTY, BANKNIFTY, etc.
  market: { type: String, required: true, index: true }, // NSE, CRYPTO, etc.
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  entry: { type: Number, required: true },
  sl: { type: Number, required: true },
  targets: [{ type: Number, required: true }],
  currentPrice: { type: Number },
  highPrice: { type: Number, default: 0 },
  timeframe: { type: String, default: '5m' },
  aiScore: { type: Number, default: 0 },
  aiSentiment: { type: String, default: 'Neutral' },
  aiRationale: { type: String, default: 'Analyzing Market Dynamics...' },
  confidenceScore: { type: Number, default: 0 },
  rating: { type: String, default: 'WEAK' }, // WEAK, MEDIUM, STRONG, PREMIUM
  trend: { type: String, default: 'NEUTRAL' }, // UP, DOWN, NEUTRAL
  rsi: { type: Number, default: 0 },
  momentum: { type: String, default: 'LOW' }, // LOW, MEDIUM, HIGH
  volatility: { type: String, default: 'LOW' }, // LOW, MEDIUM, HIGH
  approved: { type: Boolean, default: false },
  optionType: { type: String, enum: ['CE', 'PE', 'NONE'], default: 'NONE' },
  strike: { type: Number },
  expiryDate: { type: String },
  percentageChange: { type: String },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'TARGET_HIT', 'SL_HIT', 'CANCELLED', 'CLOSED', 'PROFIT', 'CLOSED_PROFIT', 'CLOSED_LOSS', 'EXIT_ALERT'], 
    default: 'ACTIVE',
    index: true 
  },
  statusChangedAt: { type: Date },
  updates: [{ type: Number }],
  source: { type: String, required: true }, // Telegram Channel Name
  telegramMessageId: { type: String },
  rawText: { type: String },
  imageUrl: { type: String },
  thumbnail: { type: String }, // Base64 micro-preview for instant loading
  accuracy: { type: Number }, // P/L estimate
  guidance: { type: String, default: '' }, // e.g. "Buy Low Quantity"
  intent: { 
    type: String, 
    enum: ['NONE', 'FAST_BUY', 'BOOK_PROFIT', 'EXIT', 'HOLD', 'SCALPING'], 
    default: 'NONE' 
  },
}, { timestamps: true });


// 🔥 PRODUCTION INDEXING: Optimize for dashboard filtering
signalSchema.index({ status: 1, createdAt: -1 });
signalSchema.index({ telegramMessageId: 1 }); // Fast lookup for threaded updates
signalSchema.index({ symbol: 1, strike: 1, optionType: 1, status: 1 }); // Duplicate check index

const Signal = mongoose.model('Signal', signalSchema);
export default Signal;
