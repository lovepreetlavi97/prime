'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { GlassCard } from '../../components/GlassCard';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

export default function MarketPage() {
  const { marketPrices, setActiveTab } = useAdminStore();

  useEffect(() => {
    setActiveTab('market');
  }, [setActiveTab]);

  const sectors = [
    { name: 'BANKING & FIN', flow: 'Bullish Expansion', value: '+3.4%', isBullish: true },
    { name: 'ENERGY & INFRA', flow: 'Moderate Accumulation', value: '+1.2%', isBullish: true },
    { name: 'IT / TECH', flow: 'Distribution Phase', value: '-1.8%', isBullish: false },
    { name: 'AUTO / MOTORS', flow: 'Bullish Breakout', value: '+2.1%', isBullish: true },
    { name: 'PHARMA / HC', flow: 'Bearish Correction', value: '-0.7%', isBullish: false },
    { name: 'METAL & COMM', flow: 'Neutral Consolidation', value: '+0.1%', isBullish: true },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          INDEX <span className="text-[#D4AF37]">ANALYTICS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          High-Frequency Indices Feeds & Sector Capital Rotation Mapping
        </p>
      </div>

      {/* Grid of indices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(marketPrices).map(([sym, item]) => {
          const Icon = item.isUp ? ArrowUpRight : ArrowDownRight;
          return (
            <GlassCard key={sym} hasGlow={true} glowColor={item.isUp ? 'green' : 'red'} hoverable={true}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase text-[#71717A]">
                    Live Futures Index
                  </span>
                  <h3 className="text-lg font-black text-white uppercase">{sym}</h3>
                  <h2 className="text-3xl font-black italic tracking-tight text-white">
                    {typeof item.price === 'number' ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : item.price}
                  </h2>
                  <div className="flex items-center gap-1">
                    <Icon size={12} className={item.isUp ? 'text-[#10B981]' : 'text-[#EF4444]'} />
                    <span className={`text-[10px] font-black ${item.isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-center ${
                  item.isUp 
                    ? 'text-[#10B981] bg-[#10B981]/5 border-[#10B981]/15' 
                    : 'text-[#EF4444] bg-[#EF4444]/5 border-[#EF4444]/15'
                }`}>
                  <TrendingUp size={18} />
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sector rotation maps */}
        <div className="lg:col-span-8 space-y-4">
          <span className="text-[9px] font-black text-[#71717A] tracking-[2.5px] uppercase block">
            SECTOR ROTATION MAP (VOLUME CHANGES DELTAS)
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sec, idx) => (
              <GlassCard key={idx} hoverable={true}>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-white uppercase tracking-tight truncate max-w-[120px]">
                    {sec.name}
                  </span>
                  <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md ${
                    sec.isBullish 
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' 
                      : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20'
                  }`}>
                    {sec.value}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">Capital Flow</span>
                  <p className={`text-xs font-black uppercase ${sec.isBullish ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {sec.flow}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Column: Institutional block flows */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Institutional Block Net Flows">
            <div className="space-y-5 text-xs font-bold">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">FII NET FLOWS (TODAY)</span>
                <span className="font-black text-[#10B981] text-lg uppercase tracking-wide">+₹2,480.12 Crores</span>
                <p className="text-[9px] text-[#71717A] font-medium">Accumulating Index futures & call options</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">DII NET FLOWS (TODAY)</span>
                <span className="font-black text-[#EF4444] text-lg uppercase tracking-wide">-₹410.50 Crores</span>
                <p className="text-[9px] text-[#71717A] font-medium">Marginal profit booking in IT/Tech contracts</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
