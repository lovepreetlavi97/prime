import React from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck } from 'lucide-react';
import { Signal } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface SignalCardProps {
  signal: Signal;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const isBuy = true; // Always BUY

  return (
    <div className="signal-card group relative overflow-hidden">
      {/* Type Indicator */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isBuy ? 'bg-green-500' : 'bg-red-500'}`} />

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{signal.symbol}</h3>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{signal.market}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isBuy ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          BUY
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Entry Price</p>
          <p className="text-lg font-mono font-bold text-amber-500">{signal.entry.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
          <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Stop Loss</p>
          <p className="text-lg font-mono font-bold text-red-400">{signal.sl.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] text-zinc-500 uppercase font-bold">Targets</p>
        <div className="flex flex-wrap gap-2">
          {signal.targets.map((target, idx) => (
            <div key={idx} className="bg-green-500/5 border border-green-500/20 px-3 py-1 rounded-lg text-sm font-mono text-green-400">
              T{idx + 1}: {target.toFixed(2)}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          {formatDistanceToNow(new Date(signal.createdAt))} ago
        </div>
        <div className="flex items-center gap-1 uppercase tracking-tighter">
          <ShieldCheck size={12} className="text-amber-500" />
          Verified Source: {signal.source}
        </div>
      </div>
    </div>
  );
};
