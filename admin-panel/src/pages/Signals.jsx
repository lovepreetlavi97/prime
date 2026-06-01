import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Radio, Trash2, ShieldAlert, Sparkles, CheckCircle2, 
  XCircle, Ban, TrendingUp, AlertTriangle, Cpu, Target, ShieldX, Eye
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { 
  fetchSignals, createSignalThunk, closeSignalThunk, 
  deleteSignalThunk, setActiveTab 
} from '../store/slices/adminSlice';

export default function Signals() {
  const dispatch = useDispatch();
  const signals = useSelector((state) => state.admin.signals);

  const [activeFilter, setActiveFilter] = useState('ACTIVE');
  
  // Signal form fields state
  const [symbol, setSymbol] = useState('NIFTY');
  const [optionType, setOptionType] = useState('CE');
  const [strike, setStrike] = useState('');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [targets, setTargets] = useState('');
  const [aiRationale, setAiRationale] = useState('');
  const [confidence, setConfidence] = useState('85');
  const [rating, setRating] = useState('STRONG');
  const [trend, setTrend] = useState('BULLISH');

  useEffect(() => {
    dispatch(setActiveTab('signals'));
    dispatch(fetchSignals());
    const interval = setInterval(() => {
      dispatch(fetchSignals());
    }, 5000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleSubmitSignal = async (e) => {
    e.preventDefault();
    if (!strike || !entry || !sl || !targets) {
      alert('Please fill in entry price, strike, stop loss, and targets');
      return;
    }

    const targetList = targets.split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));

    const signalData = {
      symbol,
      market: 'NSE',
      type: 'BUY',
      entry: parseFloat(entry),
      sl: parseFloat(sl),
      targets: targetList,
      optionType,
      strike: parseFloat(strike),
      aiRationale: aiRationale || 'AI volume support at support cluster',
      confidenceScore: parseInt(confidence) || 85,
      rating,
      trend,
      source: 'ADMIN-MANUAL',
      status: 'ACTIVE',
      updates: [parseFloat(entry)],
      currentPrice: parseFloat(entry),
    };

    dispatch(createSignalThunk(signalData));
    
    // Reset Form
    setStrike('');
    setEntry('');
    setSl('');
    setTargets('');
    setAiRationale('');
  };

  const filteredSignals = signals.filter(s => {
    if (activeFilter === 'ACTIVE') {
      return s.status === 'ACTIVE';
    }
    if (activeFilter === 'TARGET_HIT') {
      return s.status === 'TARGET_HIT';
    }
    if (activeFilter === 'SL_HIT') {
      return s.status === 'SL_HIT';
    }
    if (activeFilter === 'CANCELLED') {
      return s.status === 'CANCELLED';
    }
    return s.status !== 'ACTIVE';
  });

  return (
    <div className="space-y-8 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[3px]">REALTIME BROADCAST CONSOLE</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">
            OPTION <span className="text-[#D4AF37]">SIGNALS</span>
          </h2>
          <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[4px]">
            Live Options Trading Signals Generation & Settlement Terminal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Signals Monitor */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Signal Filters */}
          <div className="flex flex-wrap gap-2">
            {['ACTIVE', 'TARGET_HIT', 'SL_HIT', 'CANCELLED', 'HISTORY'].map(filter => {
              const count = signals.filter(s => {
                if (filter === 'ACTIVE') return s.status === 'ACTIVE';
                if (filter === 'TARGET_HIT') return s.status === 'TARGET_HIT';
                if (filter === 'SL_HIT') return s.status === 'SL_HIT';
                if (filter === 'CANCELLED') return s.status === 'CANCELLED';
                return s.status !== 'ACTIVE';
              }).length;

              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    activeFilter === filter 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                      : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  <span>{filter.replace('_', ' ')}</span>
                  <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${activeFilter === filter ? 'bg-black/20 text-black' : 'bg-white/5 text-[#A1A1AA]'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* List display */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredSignals.length > 0 ? (
                filteredSignals.map((sig) => {
                  const isCE = sig.optionType === 'CE';
                  const isActive = sig.status === 'ACTIVE';
                  
                  return (
                    <motion.div
                      key={sig._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    >
                      <GlassCard hasGlow={isActive} glowColor={isCE ? 'green' : 'amber'}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-3.5 flex-wrap">
                              <span className="text-base font-black text-white italic tracking-wide">{sig.symbol}</span>
                              <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-xl border ${
                                isCE 
                                  ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/25 shadow-[0_0_10px_rgba(16,185,129,0.08)]' 
                                  : 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25 shadow-[0_0_10px_rgba(239,68,68,0.08)]'
                              }`}>
                                {sig.strike} {sig.optionType}
                              </span>
                              
                              <span className="text-[8px] font-black text-[#5A5E70] uppercase tracking-wider bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-lg">
                                {sig.trend || 'NEUTRAL'}
                              </span>

                              <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-wider bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <Cpu size={8} /> Confidence: {sig.confidenceScore || 85}%
                              </span>
                            </div>

                            <p className="text-[10px] text-[#71717A] leading-relaxed max-w-xl">
                              <span className="font-black text-[#D4AF37] uppercase tracking-wider mr-1">AI Diagnostics:</span>
                              {sig.aiRationale}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-5 text-left shrink-0">
                            <PriceBlock label="ENTRY" value={`₹${sig.entry}`} />
                            <PriceBlock label="STOP LOSS" value={`₹${sig.sl}`} color="text-red-400" />
                            <PriceBlock label="CURRENT" value={`₹${sig.currentPrice || sig.entry}`} color={isActive ? 'text-green-400' : 'text-[#71717A]'} />
                            <PriceBlock label="TARGETS" value={sig.targets ? sig.targets.map(t => `₹${t}`).join(' → ') : '-'} color="text-cyan-400" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-white/[0.03] mt-5 pt-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              sig.status === 'ACTIVE' 
                                ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_#F59E0B]' 
                                : sig.status === 'TARGET_HIT' 
                                  ? 'bg-green-500 shadow-[0_0_8px_#10B981]' 
                                  : 'bg-red-500 shadow-[0_0_8px_#EF4444]'
                            }`} />
                            <span className="text-[9px] font-black tracking-widest text-[#A1A1AA] uppercase">
                              STATUS: {sig.status}
                            </span>
                          </div>

                          {isActive ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => dispatch(closeSignalThunk({ id: sig._id, status: 'TARGET_HIT' }))}
                                className="h-8 px-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:border-green-500/50 hover:bg-[#10B981] hover:text-black font-black text-[9px] tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-green-500"
                              >
                                <Target size={10} />
                                TARGET HIT
                              </button>
                              <button
                                onClick={() => dispatch(closeSignalThunk({ id: sig._id, status: 'SL_HIT' }))}
                                className="h-8 px-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/50 hover:bg-[#EF4444] hover:text-white font-black text-[9px] tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 text-red-400"
                              >
                                <ShieldX size={10} />
                                SL HIT
                              </button>
                              <button
                                onClick={() => dispatch(closeSignalThunk({ id: sig._id, status: 'CANCELLED' }))}
                                className="h-8 px-4 rounded-xl bg-zinc-500/10 border border-zinc-500/20 hover:border-zinc-500/50 text-[#71717A] font-black text-[9px] tracking-wider uppercase transition-all duration-300 cursor-pointer"
                              >
                                CANCEL
                              </button>
                              <button
                                onClick={() => dispatch(deleteSignalThunk(sig._id))}
                                className="p-2 rounded-xl bg-white/5 border border-white/5 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300 cursor-pointer flex items-center justify-center"
                                title="Delete Signal"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => dispatch(deleteSignalThunk(sig._id))}
                              className="h-8 px-3 rounded-xl bg-white/5 border border-white/5 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 text-[#5A5E70] text-[9px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer"
                            >
                              DELETE ARCHIVE
                            </button>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center text-[#5A5E70] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]"
                >
                  No Option Signals Found In This Cluster
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Signal Dispatch Form */}
        <div className="lg:col-span-4">
          <GlassCard title="Signal Dispatch Engine" hasGlow={true}>
            <form onSubmit={handleSubmitSignal} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">SYMBOL</label>
                  <select 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                  >
                    <option value="NIFTY">Nifty 50</option>
                    <option value="BANKNIFTY">BankNifty</option>
                    <option value="FINNIFTY">Finnifty</option>
                    <option value="SENSEX">Sensex</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">OPTION TYPE</label>
                  <select 
                    value={optionType} 
                    onChange={(e) => setOptionType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                  >
                    <option value="CE">CE (Call Option)</option>
                    <option value="PE">PE (Put Option)</option>
                    <option value="NONE">NONE (Futures)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">STRIKE</label>
                  <input
                    type="number"
                    placeholder="23500"
                    value={strike}
                    onChange={(e) => setStrike(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">ENTRY</label>
                  <input
                    type="number"
                    placeholder="240"
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">STOP LOSS</label>
                  <input
                    type="number"
                    placeholder="195"
                    value={sl}
                    onChange={(e) => setSl(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1 flex justify-between">
                  <span>TARGETS (COMMA SEPARATED)</span>
                </label>
                <input
                  type="text"
                  placeholder="280,310,350"
                  value={targets}
                  onChange={(e) => setTargets(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">CONFIDENCE (%)</label>
                  <input
                    type="number"
                    placeholder="89"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">TREND BIAS</label>
                  <select 
                    value={trend} 
                    onChange={(e) => setTrend(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                  >
                    <option value="BULLISH">Bullish Bias</option>
                    <option value="BEARISH">Bearish Bias</option>
                    <option value="SIDEWAYS">Sideways Neutral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">RATING TIER</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                  >
                    <option value="WEAK">Weak Strength</option>
                    <option value="MEDIUM">Medium Strength</option>
                    <option value="STRONG">Strong Setup</option>
                    <option value="PREMIUM">Premium Elite</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">AI Setup Rationale</label>
                <textarea
                  placeholder="Order book imbalance buying detected at support cluster..."
                  value={aiRationale}
                  onChange={(e) => setAiRationale(e.target.value)}
                  className="w-full h-20 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] hover:scale-[1.01] hover:bg-[#cfa52f] cursor-pointer"
              >
                BROADCAST SIGNAL TO CLUSTER
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

const PriceBlock = ({ label, value, color = 'text-white' }) => (
  <div className="space-y-1 text-xs">
    <span className="text-[8px] font-black text-[#5A5E70] tracking-[1px] uppercase block">
      {label}
    </span>
    <span className={`text-xs font-black tracking-tight ${color}`}>
      {value}
    </span>
  </div>
);
