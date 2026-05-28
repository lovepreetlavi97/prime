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
  optionType: 'CE' | 'PE' | 'NONE';
  currentPrice: number;
  status: 'ACTIVE' | 'TARGET_HIT' | 'SL_HIT' | 'CANCELLED' | 'CLOSED' | 'PROFIT' | 'CLOSED_PROFIT' | 'CLOSED_LOSS' | 'EXIT_ALERT';
  timeframe?: string;
  updates?: number[];
  strike?: number;
  expiryDate?: string;
  guidance?: string;
  lastUpdateAt?: number;
  intent?: string;
  highPrice?: number;
  statusChangedAt?: string | number | Date;
  aiRationale?: string;
  aiScore?: number;
  aiSentiment?: string;
  confidenceScore?: number;
  rating?: string;
  trend?: string;
  rsi?: number;
  momentum?: string;
  volatility?: string;
}

export interface User {
  _id: string;
  phone: string;
  name?: string;
  role: 'ADMIN' | 'USER' | 'SUPER_ADMIN' | 'ANALYST' | 'SUPPORT';
  isVerified: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'elite';
    startDate?: string;
    endDate?: string;
    isActive: boolean;
  };
  telegramId?: string;
  isBanned: boolean;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemHealth {
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
  dbStatus: 'CONNECTED' | 'DISCONNECTED' | 'DEGRADED';
  redisStatus: 'CONNECTED' | 'DISCONNECTED';
  websocketLatency: number;
  uptime: number;
}
