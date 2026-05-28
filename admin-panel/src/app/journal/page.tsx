'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { GlassCard } from '../../components/GlassCard';
import { RealtimeChart } from '../../components/RealtimeChart';
import { Heart, Brain, TrendingUp, AlertTriangle } from 'lucide-react';

export default function JournalPage() {
  const { setActiveTab } = useAdminStore();

  useEffect(() => {
    setActiveTab('journal');
  }, [setActiveTab]);
  // Mock emotional metrics
  const emotions = [
    { name: 'Discipline Level', score: '82%', desc: 'Holding to Stop Losses', isGood: true },
    { name: 'Greed Bias', score: '38%', desc: 'Averaging winning targets', isGood: true },
    { name: 'Fear Imbalance', score: '24%', desc: 'Early exits near setups', isGood: false },
    { name: 'Fomo Ratio', score: '15%', desc: 'Late entries on breakout', isGood: true },
  ];

  // Strategy performance data
  const strategyData = [
    { name: 'Option Scalping', value: 89 },
    { name: 'Index Breakout', value: 76 },
    { name: 'Target Extension', value: 65 },
    { name: 'Mean Reversion', value: 50 },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          TRADER <span className="text-[#D4AF37]">PSYCHOLOGY</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Journal Insights, Emotional Behavioral Statistics & Discipline Ratings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Aggregated trader emotions */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard title="Emotional Risk Breakdown" hasGlow={true} glowColor="cyan">
            <div className="space-y-4">
              {emotions.map((emo, idx) => (
                <div key={idx} className="flex justify-between items-center py-3.5 border-b border-white/[0.03] last:border-none">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white uppercase tracking-tight">{emo.name}</span>
                    <span className="text-[9px] text-[#71717A] block">{emo.desc}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-black ${emo.isGood ? 'text-[#10B981]' : 'text-amber-500'}`}>
                      {emo.score}
                    </span>
                    <div className={`w-2.5 h-2.5 rounded-full ${emo.isGood ? 'bg-[#10B981]' : 'bg-amber-500'}`} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-center gap-3 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-[#D4AF37] rounded-xl">
                <Brain size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">
                  AI BEHAVIORAL DIAGNOSTIC
                </span>
                <p className="text-white font-bold leading-relaxed">
                  Overall discipline holds at 82%. Traders show slight early exits near PE options entry points.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Strategy win rates */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard title="Strategic Performance Win Rates">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase tracking-[2px] text-white">Win Probability Splits</span>
              <span className="text-[8px] font-black text-[#00C2FF] tracking-[1.5px] uppercase bg-cyan-500/5 border border-cyan-500/15 px-2 py-0.5 rounded-lg">Realtime</span>
            </div>
            <RealtimeChart data={strategyData} color="#00C2FF" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
