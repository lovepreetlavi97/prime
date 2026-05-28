import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '../config';
import { PrimeLogo } from './PrimeLogo';
import { motion } from 'framer-motion';
import { useSignalStore } from '@/store/useSignalStore';

const MarketTick = ({ symbol, value, trend }: any) => (
  <div className="flex items-center gap-2 lg:gap-3 px-2 lg:px-6 border-r border-white/5 last:border-none">
    <span className="text-[11px] lg:text-[12px] text-[#A1A1AA] font-bold uppercase tracking-widest">{symbol}</span>
    <span className={`text-base lg:text-lg font-mono font-black transition-colors duration-500 ${
      trend === 'up' ? 'text-[#22C55E]' : trend === 'down' ? 'text-[#EF4444]' : 'text-white'
    }`}>
      {value === '--' ? '--' : value}
    </span>
  </div>
);


export const MarketOverviewBar = () => {
  const marketPrices = useSignalStore(state => state.marketPrices);
  const isConnected = useSignalStore(state => state.isConnected);
  const lastHeartbeat = useSignalStore(state => state.lastHeartbeat);
  const [isMarketOpen, setIsMarketOpen] = useState(true);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const checkStaleness = () => {
      if (!lastHeartbeat) return;
      setIsStale(Date.now() - lastHeartbeat > 15000);
    };
    const interval = setInterval(checkStaleness, 5000);
    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  useEffect(() => {
    const checkMarket = () => {
      const now = new Date();
      const totalMin = now.getHours() * 60 + now.getMinutes();
      const isOpen = now.getDay() >= 1 && now.getDay() <= 5 && totalMin >= 555 && totalMin <= 930;
      setIsMarketOpen(isOpen);
    };
    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => price ? price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '--';

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-[#060606]/90 backdrop-blur-xl border-b border-white/5 z-[100] flex items-center justify-between px-3 lg:px-8 transition-all duration-300">
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/" className="active:scale-95 transition-all duration-300 group flex items-center gap-3">
          <PrimeLogo size={44} className="rounded-xl" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-[2px] text-[#D4AF37] uppercase">PRIMETRADE <span className="text-white">AI</span></span>
            </div>
            <span className="text-[7px] font-black text-[#A1A1AA] uppercase tracking-[3px] leading-none opacity-80">Institutional Signals Engine</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex items-center overflow-x-auto no-scrollbar h-full relative mx-1 lg:mx-10 select-none">
        <div className="flex items-center gap-0 w-full lg:justify-center whitespace-nowrap">
          <MarketTick symbol="NIFTY 50" value={formatPrice(marketPrices['NIFTY 50']?.val)} trend={marketPrices['NIFTY 50']?.trend} />
          <MarketTick symbol="BANKNIFTY" value={formatPrice(marketPrices['BANKNIFTY']?.val)} trend={marketPrices['BANKNIFTY']?.trend} />
          <MarketTick symbol="INDIA VIX" value={formatPrice(marketPrices['INDIA VIX']?.val)} trend={marketPrices['INDIA VIX']?.trend} />
        </div>
        
        {/* WORLD LEVEL: Subtle animated gradient overlay */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0B0B0F] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0B0B0F] to-transparent pointer-events-none" />
      </div>

      <div className="flex items-center gap-3 lg:gap-6 shrink-0">
        <div 
          onClick={() => {
            import('@/utils/feedback').then(m => m.playTechClick(0));
          }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#141414] border border-white/5 cursor-pointer hover:bg-white/5 active:scale-95 transition-all"
        >
          <div className={`w-2 h-2 rounded-full ${!isConnected ? 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]' : (isStale ? 'bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]' : 'bg-[#22C55E] animate-pulse shadow-[0_0_8px_#22C55E]')}`} />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest whitespace-nowrap">LIVE DATA</span>
        </div>
      </div>
    </div>

  );
};
