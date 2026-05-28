'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Target, ShieldAlert, Zap, Clock, Crown, TrendingUp, CheckCircle2, AlertCircle, XCircle, ArrowUpRight, Image as ImageIcon, Eye, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useSignalStore } from '@/store/useSignalStore';


interface CountUpProps {
  value: number;
  prefix?: string;
  className?: string;
}

const CountUp: React.FC<CountUpProps> = React.memo(({ value, prefix = '₹', className }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 1000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = start + (end - start) * progress;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { 
      if (frameRef.current) cancelAnimationFrame(frameRef.current); 
    };
  }, [value]);

  return <span className={className}>{prefix}{displayValue.toFixed(2)}</span>;
});

export const LuxurySignalCard = React.memo(({ signal, index, isPro, lockedMessage }: { signal: any; index: number; isPro: boolean; lockedMessage?: string }) => {
  const prevPriceRef = useRef(signal.currentPrice || signal.entry);
  const tradingAlerts = useSignalStore(state => state.tradingAlerts);
  const activeAlert = tradingAlerts[signal._id];
  const [showPulse, setShowPulse] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showHistory, setShowHistory] = useState(false);


  // 🔥 ARCHITECTURE OPTIMIZATION: Animation Throttling
  // Only pulse on critical status changes, NOT on every price tick.
  useEffect(() => {
    if (['TARGET_HIT', 'SL_HIT', 'EXIT_ALERT', 'PROFIT_BOOKED'].includes(signal.status)) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [signal.status]);

  const { isProfit, isLoss, isClosed, isTerminal, entry, target, current, hitPrice, hitTargetsCount, progress, profitAmt, profitPct, allTargetsHit, milestones, isValid } = React.useMemo(() => {
    const isProfit = ['PROFIT', 'CLOSED_PROFIT', 'TARGET_HIT', 'PROFIT_BOOKED'].includes(signal.status);
    const isLoss = ['CLOSED_LOSS', 'SL_HIT'].includes(signal.status);
    
    // 🔥 INSTITUTIONAL LIFECYCLE ARCHITECTURE
    // 'isTerminal' means the trade has physically ended (Exit, SL, or Profit Secured). 
    // 'TARGET_HIT' is NOT terminal; it enters 'AI Runner Mode'.
    const isTerminal = signal.status.startsWith('CLOSED') || ['SL_HIT', 'EXIT_ALERT', 'EXIT', 'PROFIT_BOOKED'].includes(signal.status);
    const isClosed = isTerminal; 

    const entry = signal.entry || 0;
    const isValid = !!signal.symbol && (entry > 0 || signal.isLocked);
    const targets = signal.targets || [];
    const target = targets.length > 0 ? targets[targets.length - 1] : 0;
    const current = signal.currentPrice || entry || 0;
    
    // 🔥 PEAK CONSISTENCY: Derived ONLY from backend authoritative highPrice
    const hitPrice = signal.highPrice || current;

    const hitTargetsCount = isValid && targets.length > 0 ? targets.filter((t: number) => hitPrice >= t && t !== 0).length : 0;
    const allTargetsHit = isValid && targets.length > 0 && targets.every((t: number) => hitPrice >= t);

    const progress = (isValid && (target - entry) !== 0)
      ? Math.min(Math.max(((hitPrice - entry) / (target - entry)) * 100, 0), 100)
      : 0;

    const profitAmt = isValid ? hitPrice - entry : 0;
    const profitPct = (isValid && entry !== 0) ? ((profitAmt / entry) * 100).toFixed(2) : '0.00';

    const milestones = isValid ? Array.from(new Set([entry, ...(signal.updates || []), current]))
      .filter(p => p >= entry)
      .sort((a, b) => a - b)
      .slice(-5) : [];

    return { isProfit, isLoss, isClosed, isTerminal, entry, target, current, hitPrice, hitTargetsCount, progress, profitAmt, profitPct, allTargetsHit, milestones, isValid };
  }, [signal.status, signal.currentPrice, signal.highPrice, signal.entry, signal.targets, signal.updates]);



  const intentConfig = React.useMemo(() => {
    const targetIntent = activeAlert?.intent || signal.intent;
    switch (targetIntent) {
      case 'FAST_BUY': return { label: 'RAPID MOMENTUM ENTRY', color: '#D4AF37', icon: <Zap size={12} fill="#D4AF37" />, pulse: true, glow: true };
      case 'BOOK_PROFIT': return { label: 'AI PROFIT LOCK ACTIVE', color: '#22C55E', icon: <TrendingUp size={12} />, pulse: true, glow: false };
      case 'EXIT': return { label: 'SMART EXIT EXECUTED', color: '#F43F5E', icon: <AlertCircle size={12} />, pulse: true, glow: false };
      case 'SCALPING': return { label: 'QUICK MOMENTUM SCALP', color: '#A855F7', icon: <Zap size={12} />, pulse: false, glow: true };
      default: return null;
    }
  }, [signal.intent, activeAlert]);

  const statusMessage = React.useMemo(() => {
    if (intentConfig) return ""; 
    if (!isValid) return "INITIALIZING AI DATA...";
    
    // 🔥 INSTITUTIONAL STATE MESSAGING
    if (isTerminal) {
      if (signal.status === 'SL_HIT' || signal.status === 'CLOSED_LOSS') return "STOP LOSS HIT: TRADE COMPLETED";
      if (signal.status === 'EXIT_ALERT' || signal.status === 'EXIT') return "MOMENTUM EXHAUSTED: TRADE COMPLETED";
      return "TRADE FINALIZED: ARCHIVING DATA...";
    }

    if (allTargetsHit) return "MOMENTUM PEAK: AI RUNNER MODE ACTIVE";
    if (hitTargetsCount > 0) return `TARGET ${hitTargetsCount} ACHIEVED: PROFIT PROTECTION ACTIVE`;
    if (hitPrice >= entry) return "ENTRY CONFIRMED: MOMENTUM STRENGTH INCREASING";
    
    return `WAITING FOR BEST ENTRY ABOVE ₹${entry}`;
  }, [signal.status, isTerminal, hitPrice, entry, isValid, intentConfig, allTargetsHit, hitTargetsCount]);

  const config = React.useMemo(() => {
    switch (signal.status) {
      case 'CLOSED_PROFIT':
      case 'PROFIT_BOOKED':
      case 'PROFIT': return { label: 'PROFIT SECURED ✅', color: '#22C55E', badge: 'PROFIT', icon: <CheckCircle2 size={12} /> };
      case 'TARGET_HIT': return { label: 'AI RUNNER MODE', color: '#D4AF37', badge: 'RUNNER', icon: <TrendingUp size={12} /> };
      case 'EXIT_ALERT': return { label: 'SMART EXIT EXECUTED', color: '#F43F5E', badge: 'EXIT', icon: <AlertCircle size={12} /> };
      case 'SL_HIT':
      case 'CLOSED_LOSS': return { label: 'STOP LOSS HIT', color: '#EF4444', badge: 'LOSS', icon: <XCircle size={12} /> };
      case 'CLOSED': return { label: 'TRADE ARCHIVED', color: '#A1A1AA', badge: 'ENDED', icon: <Clock size={12} /> };
      default: return { label: 'LIVE AI ANALYSIS', color: '#3B82F6', badge: 'LIVE', icon: <Zap size={12} fill="#3B82F6" /> };
    }
  }, [signal.status]);

  if (!isValid) {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-[#1a1c23]/40 border border-white/5 p-8 animate-pulse">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-white/5 rounded-lg" />
            <div className="h-4 w-32 bg-white/5 rounded-lg" />
          </div>
          <div className="h-12 w-32 bg-white/5 rounded-xl" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5" />
          ))}
        </div>
        <div className="absolute top-0 right-0 p-4">
           <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-widest animate-pulse">Connecting...</span>
        </div>
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.5 } }}
      className="relative w-full px-2 md:px-0 group perspective-1000"
    >
      <div
        className={`relative bg-[#0D0D12] rounded-[24px] border border-white/[0.03] overflow-hidden shadow-2xl transition-all duration-500 hover:border-[#D4AF37]/20 ${isClosed && isProfit ? 'animate-pulse-success' : (signal.status === 'EXIT_ALERT' || signal.status === 'SL_HIT') ? 'animate-pulse-exit' : ''} ${showPulse ? 'ring-1 ring-[#D4AF37]/30' : ''} ${intentConfig?.glow ? 'shadow-[0_0_30px_rgba(212,175,55,0.05)]' : ''}`}
      >
        {/* PREMIUM INTENT BANNER */}
        <AnimatePresence>
          {intentConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full py-2 flex items-center justify-center gap-2 overflow-hidden border-b border-white/5"
              style={{ backgroundColor: `${intentConfig.color}15` }}
            >
              <div className={intentConfig.pulse ? 'animate-pulse' : ''} style={{ color: intentConfig.color }}>
                {intentConfig.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[4px]" style={{ color: intentConfig.color }}>
                {intentConfig.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP STATUS BAR & BADGE */}
        <div className="relative">
          <AnimatePresence>
            {isClosed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 bg-[#0B0B0F]/60 backdrop-blur-[2px] flex items-center justify-center border-b border-white/5"
              >
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-black/40 border border-white/10">
                   <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                   <span className="text-[9px] font-black text-white/40 uppercase tracking-[3px]">Trade Cycle Finalized</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="px-5 py-2.5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white/90 uppercase tracking-[2px]">{signal.market || 'NSE'} INDEX</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-black text-white/90 uppercase tracking-[2px]">{signal.timeframe || '5M'} SCALE</span>
            </div>

            <div
              className="px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border"
              style={{
                backgroundColor: `${config.color}15`,
                borderColor: `${config.color}30`,
                color: config.color
              }}
            >
              {config.icon}
              <span className="text-[9px] font-black uppercase tracking-widest">{config.badge}</span>
            </div>
          </div>
        </div>

        {/* CHART SECTION (COLLAPSIBLE) */}
        <AnimatePresence>
          {showChart && signal.imageUrl && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-black/40 border-b border-white/5"
            >
              <div className="p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group/img">
                  <img 
                    src={signal.imageUrl} 
                    alt="Technical Analysis" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#D4AF37]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Chart Analysis</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN DATA SECTION - COMPRESSED */}
        <div className="p-4 md:p-5 space-y-4 md:space-y-5">
          {/* 📊 INSTITUTIONAL HEADER GRID - ULTRA STABILIZED */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 md:gap-4 w-full">
            
            {/* LEFT SECTION: ASSET IDENTITY */}
            <div className="flex flex-col min-w-0 justify-self-start overflow-hidden">
              <h2 className="text-[clamp(16px,4.5vw,28px)] font-black text-white tracking-tighter uppercase italic truncate leading-none">
                {signal.symbol}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex items-center gap-1 px-1 py-0.5 bg-[#D4AF37]/10 rounded border border-[#D4AF37]/20 shrink-0">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <span className="text-[6px] md:text-[8px] font-black text-[#D4AF37] tracking-widest uppercase">
                    {signal.confidenceScore || 98}% AI
                  </span>
                </div>
                <span className="text-[7px] md:text-[11px] font-bold text-white/30 italic truncate">
                  {signal.strike} {signal.optionType}
                </span>
              </div>
            </div>

            {/* CENTER SECTION: STABLE PRICE HUB */}
            <div className="flex flex-col items-center justify-center min-w-0 px-1 md:px-4">
              <span className="text-[6px] md:text-[9px] font-black text-[#A1A1AA] uppercase tracking-[0.2em] mb-1 opacity-40">
                {isClosed ? 'FINALIZE' : 'LIVE FEED'}
              </span>
              <motion.div
                key={hitPrice}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[clamp(16px,6vw,36px)] font-black text-white italic tracking-tighter leading-none tabular-nums flex items-baseline gap-0.5"
              >
                {!isPro && !isClosed ? (
                  <span className="opacity-40">₹****</span>
                ) : (
                  <CountUp value={hitPrice} />
                )}
              </motion.div>
              <p className="text-[6px] md:text-[9px] font-bold text-white/20 uppercase tracking-[0.05em] mt-1.5 italic truncate max-w-full">
                {isClosed ? `E ${entry} → X ${hitPrice.toFixed(1)}` : `E ${entry} | F ${current.toFixed(1)}`}
              </p>
            </div>

            {/* RIGHT SECTION: PERFORMANCE METRICS */}
            <div className="flex flex-col items-end justify-self-end min-w-0">
              <div className={`flex flex-col items-center justify-center px-1.5 md:px-4 py-1 md:py-2 rounded-lg border ${parseFloat(profitPct) >= 0 ? 'bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E]' : 'bg-red-500/10 border-red-500/20 text-red-500'} shrink-0`}>
                <span className="text-[clamp(11px,3.5vw,22px)] font-black italic leading-none tracking-tighter">
                  {parseFloat(profitPct) >= 0 ? '+' : ''}{profitPct}%
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 opacity-10">
                <div className="w-0.5 h-0.5 rounded-full bg-current" />
                <span className="text-[5px] font-black uppercase tracking-widest">REALTIME</span>
              </div>
            </div>
          </div>

          {/* PRICE JOURNEY TIMELINE */}
          <AnimatePresence>
            {showHistory && milestones.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden bg-white/[0.02] rounded-2xl border border-white/5 p-4"
              >
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                  {milestones.map((price, i) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center min-w-[60px]">
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${i === 0 ? 'text-[#A1A1AA]' : 'text-[#22C55E]'}`}>
                          {i === 0 ? 'Entry' : `Lvl ${i}`}
                        </span>
                        <span className="text-sm font-black text-white italic">₹{price.toFixed(1)}</span>
                      </div>
                      {i < milestones.length - 1 && (
                        <div className="h-px w-8 bg-white/10 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GRID DATA */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 py-4 md:py-6 border-y border-white/5 bg-white/[0.01]">
            <div className="flex flex-col items-center gap-1.5 border-r border-white/5">
              <div className="flex items-center gap-1 opacity-60">
                <ArrowUpRight size={10} className="text-white" />
                <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-white">Entry</span>
              </div>
              <span className="text-lg md:text-xl font-black text-white italic tracking-tight">₹{signal.entry}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 border-r border-white/5">
              <div className="flex items-center gap-1 opacity-60">
                <TrendingUp size={10} className="text-[#D4AF37]" />
                <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#D4AF37]">Best Price</span>
              </div>
              <span className="text-lg md:text-xl font-black text-[#D4AF37] italic tracking-tight">₹{signal.highPrice || signal.entry}</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-1 opacity-60">
                <ShieldAlert size={10} className="text-red-500" />
                <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-red-500">Stop Loss</span>
              </div>
              <span className="text-lg md:text-xl font-black text-red-500 italic tracking-tight">₹{signal.sl}</span>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {signal.targets?.map((t: number, i: number) => {
                const isHit = hitPrice >= t;
                return (
                  <div key={i} className="flex-1 min-w-[65px] md:min-w-[80px] shrink-0 text-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                    <div className="flex items-center justify-center gap-1 mb-1">
                       <span className={`text-[7px] font-black uppercase tracking-widest ${isHit ? 'text-[#22C55E]' : 'text-white/40'}`}>Goal {i + 1}</span>
                       {isHit && <CheckCircle2 size={8} className="text-[#22C55E]" />}
                    </div>
                    <p className={`text-sm font-black italic transition-all duration-700 ${isHit ? 'text-white' : 'text-white/20'}`}>₹{t}</p>
                  </div>
                );
              })}
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 opacity-40">
            <Clock size={10} />
            <span className="text-[9px] font-black uppercase tracking-[1px]">{formatDistanceToNow(new Date(signal.createdAt))} ago</span>
          </div>
          <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[1px]">PRIMETRADE INTEL</span>
        </div>

        {/* PREMIUM LOCK OVERLAY */}
        {!isPro && !isClosed && (
          <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-[#0B0B0F]/60 backdrop-blur-md p-10 text-center">
            <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-4 border border-[#D4AF37]/20">
              <Crown size={24} className="text-[#D4AF37]" />
            </div>
            <h4 className="text-xl font-black italic tracking-tighter uppercase text-white mb-2">Live Price Locked</h4>
            <p className="text-[8px] font-black text-[#A1A1AA] uppercase tracking-[3px] mb-6">Upgrade to Premium to view live prices</p>
            <button
              onClick={() => window.location.href = '/plans'}
              className="px-6 py-3 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-[3px] rounded-lg shadow-lg active:scale-95 transition-all"
            >
              Unlock Now 🔥
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});