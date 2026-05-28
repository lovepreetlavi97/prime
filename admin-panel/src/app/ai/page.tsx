'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Cpu, Sparkles, BarChart2, Activity, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { RealtimeChart } from '../../components/RealtimeChart';

export default function AiPage() {
  const { aiStats, stats, setActiveTab } = useAdminStore();
  const [sentiment, setSentiment] = useState(aiStats.sentimentSummary);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActiveTab('ai');
  }, [setActiveTab]);

  const handleSaveSentiment = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('AI system sentiment bias successfully overridden!');
    }, 1000);
  };

  const tokenUsageData = [
    { name: '09:00', value: 200000 },
    { name: '10:00', value: 450000 },
    { name: '11:00', value: 300000 },
    { name: '12:00', value: 650000 },
    { name: '13:00', value: 500000 },
    { name: '14:00', value: 800000 },
    { name: '15:00', value: 940000 },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          AI <span className="text-[#D4AF37]">TELEMETRY</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Neural Language Models, Prompt Cache Ratios & Tokens Ingestion
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard>
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">Prompt Cache Ratio</span>
              <h4 className="text-2xl font-black text-white uppercase italic">{aiStats.cacheHitRate}%</h4>
              <p className="text-[9px] text-[#10B981] font-bold">Saving 38% costs today</p>
            </div>
            <div className="p-3 bg-[#10B981]/5 border border-[#10B981]/15 text-[#10B981] rounded-xl"><Sparkles size={18} /></div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">AI Generation RTT</span>
              <h4 className="text-2xl font-black text-white uppercase italic">{aiStats.avgResponseTime}ms</h4>
              <p className="text-[9px] text-amber-500 font-bold">DeepSeek R1/GPT-4o</p>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/15 text-[#D4AF37] rounded-xl"><Activity size={18} /></div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">Total Tokens Ingested</span>
              <h4 className="text-2xl font-black text-white uppercase italic">{aiStats.totalTokensUsed.toLocaleString()}</h4>
              <p className="text-[9px] text-[#00C2FF] font-bold">Avg 3,100 tokens per setup</p>
            </div>
            <div className="p-3 bg-[#00C2FF]/5 border border-[#00C2FF]/15 text-[#00C2FF] rounded-xl"><Cpu size={18} /></div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <GlassCard title="Tokens Consumption Over Time">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase tracking-[2px] text-white">Daily Consumption Curve</span>
              <span className="text-[8px] font-black text-amber-500 tracking-[1.5px] uppercase bg-amber-500/5 border border-amber-500/15 px-2 py-0.5 rounded-lg">High-Activity</span>
            </div>
            <RealtimeChart data={tokenUsageData} color="#D4AF37" />
          </GlassCard>
        </div>

        <div className="lg:col-span-4">
          <GlassCard title="Sentiment Bias Override" hasGlow={true}>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">AI Sentiment Focus</label>
                <textarea
                  value={sentiment}
                  onChange={(e) => setSentiment(e.target.value)}
                  className="w-full h-28 p-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleSaveSentiment}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-[#00C2FF] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(0,194,255,0.15)]"
              >
                {saving ? 'OVERRIDING...' : 'OVERRIDE SYSTEM SENTIMENT'}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
