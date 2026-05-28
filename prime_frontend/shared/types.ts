export interface Signal {
  _id: string;
  symbol: string;
  market: string;
  type: 'BUY' | 'SELL';
  entry: number;
  sl: number;
  targets: number[];
  currentPrice?: number;
  timeframe?: string;
  aiScore?: number;
  aiSentiment?: string;
  aiRationale?: string;
  optionType?: 'CE' | 'PE' | 'NONE';
  strike?: number;
  expiryDate?: string;
  percentageChange?: string;
  status: 'ACTIVE' | 'TARGET_HIT' | 'SL_HIT' | 'CANCELLED' | 'CLOSED' | 'PROFIT' | 'CLOSED_PROFIT' | 'CLOSED_LOSS';
  updates?: number[];
  source: string;
  telegramMessageId?: string;
  rawText?: string;
  imageUrl?: string;
  accuracy?: number;
  createdAt: string;
  updatedAt: string;
}
