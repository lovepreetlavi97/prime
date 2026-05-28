export interface Signal {
  _id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  market: string;
  entry: number;
  sl: number;
  targets: number[];
  createdAt: string;
  source: string;
  optionType: string;
  currentPrice: number;
  status: string;
  timeframe?: string;
  updates?: number[];
  strike?: number;
  expiryDate?: string;
  guidance?: string;
  lastUpdateAt?: number;
  intent?: string;
  highPrice?: number;
  statusChangedAt?: string | number | Date;
}
