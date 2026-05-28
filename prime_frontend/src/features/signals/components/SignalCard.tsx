import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Target, Shield, Clock, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

interface SignalProps {
  symbol: string;
  type: 'BUY' | 'SELL';
  optionType?: 'CE' | 'PE' | 'NONE';
  entry: number;
  sl: number;
  targets: number[];
  currentPrice?: number;
  percentageChange?: string;
  expiryDate?: string;
  aiScore?: number;
  status: string;
  createdAt: string;
}

export const SignalCard = React.memo(({
  symbol,
  type,
  optionType,
  entry,
  sl,
  targets,
  currentPrice,
  percentageChange,
  expiryDate,
  aiScore = 0,
  status,
  createdAt
}: SignalProps) => {
  const isBuy = type === 'BUY';
  const isCE = optionType === 'CE';
  
  return (
    <Card 
      className="relative overflow-hidden group hover:border-blue-500/50 transition-all duration-500"
      variant="glass"
    >
      {/* AI Score Badge */}
      <div className="absolute top-0 right-0 p-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">AI Score</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400" 
                style={{ width: `${aiScore}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-400">{aiScore}%</span>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight">{symbol}</h2>
            <span className={clsx(
              "px-2 py-0.5 rounded text-[10px] font-bold border",
              isCE ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {optionType !== 'NONE' ? optionType : type}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            {new Date(createdAt).toLocaleTimeString()}
            {expiryDate && <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-[10px]">{expiryDate} EXP</span>}
          </div>
        </div>
        
        <div className={clsx(
          "p-3 rounded-xl shadow-lg",
          isBuy ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"
        )}>
          {isBuy ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Entry Above</span>
          <span className="text-xl font-bold text-white">₹{entry}</span>
        </div>
        <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/10">
          <span className="block text-[10px] text-red-400 uppercase font-bold mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Stop Loss
          </span>
          <span className="text-xl font-bold text-white">₹{sl}</span>
        </div>
      </div>

      {currentPrice && (
        <div className="flex items-center justify-between p-3 mb-6 bg-blue-600/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Live Price</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">₹{currentPrice}</div>
            <div className={clsx(
              "text-[10px] font-bold",
              percentageChange?.startsWith('+') ? "text-green-400" : "text-red-400"
            )}>
              {percentageChange}
            </div>
          </div>
        </div>
      )}

      <div>
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3 flex items-center gap-1">
          <Target className="w-3 h-3" /> Profit Targets
        </span>
        <div className="grid grid-cols-3 gap-2">
          {targets.map((target, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-2 text-center border border-white/5">
             <span className="block text-[8px] text-slate-500 mb-0.5">T{idx + 1}</span>
             <span className="text-xs font-bold text-slate-200">₹{target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Gradient Glow */}
      <div className={clsx(
        "absolute -bottom-10 -right-10 w-32 h-32 blur-[60px] rounded-full",
        isBuy ? "bg-green-500/20" : "bg-red-500/20"
      )} />
    </Card>
  );
});
