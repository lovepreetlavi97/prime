'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Plus, Radio, Trash2, ShieldAlert, Sparkles, CheckCircle2, 
  XCircle, Ban, TrendingUp, AlertTriangle
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export default function SignalsPage() {
  const { 
    signals, fetchSignals, createSignal, closeSignal, deleteSignal, setActiveTab
  } = useAdminStore();

  const [activeTab, setActiveTabLocal] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  
  // Signal form fields state
  const [symbol, setSymbol] = useState('NIFTY');
  const [optionType, setOptionType] = useState<'CE' | 'PE' | 'NONE'>('CE');
  const [strike, setStrike] = useState('');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [targets, setTargets] = useState('');
  const [aiRationale, setAiRationale] = useState('');
  const [confidence, setConfidence] = useState('85');
  const [rating, setRating] = useState('STRONG');

  useEffect(() => {
    setActiveTab('signals');
  }, [setActiveTab]);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000); // Poll signals updates
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const handleSubmitSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strike || !entry || !sl || !targets) {
      alert('Please fill in entry price, strike, stop loss, and targets');
      return;
    }

    const targetList = targets.split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));

    const signalData = {
      symbol,
      market: 'NSE',
      type: 'BUY' as const,
      entry: parseFloat(entry),
      sl: parseFloat(sl),
      targets: targetList,
      optionType,
      strike: parseFloat(strike),
      aiRationale: aiRationale || 'AI volume support at support cluster',
      confidenceScore: parseInt(confidence) || 85,
      rating,
      source: 'ADMIN-MANUAL',
      status: 'ACTIVE' as const,
      updates: [parseFloat(entry)],
      currentPrice: parseFloat(entry),
    };

    await createSignal(signalData);
    
    // Reset Form
    setStrike('');
    setEntry('');
    setSl('');
    setTargets('');
    setAiRationale('');
  };

  const filteredSignals = signals.filter(s => {
    const isClosed = s.status.startsWith('CLOSED') || ['SL_HIT', 'EXIT_ALERT', 'TARGET_HIT', 'PROFIT'].includes(s.status);
    return activeTab === 'ACTIVE' ? !isClosed : isClosed;
  });

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          OPTION <span className="text-[#D4AF37]">SIGNALS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Live Options Signals Generation & Settlement Terminal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Signals Monitor */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            {/* Active vs Past tabs */}
            <div className="flex gap-2.5">
              {(['ACTIVE', 'HISTORY'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTabLocal(tab)}
                  className={`px-5 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                      : 'bg-[#0A0D18] border-white/5 text-[#71717A] hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  {tab === 'ACTIVE' ? 'Live Alert Feeds' : 'Settled Archive'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredSignals.length > 0 ? (
              filteredSignals.map((sig) => {
                const isNifty = sig.symbol === 'NIFTY';
                const isClosed = sig.status.startsWith('CLOSED') || ['SL_HIT', 'EXIT_ALERT', 'TARGET_HIT', 'PROFIT'].includes(sig.status);

                return (
                  <GlassCard key={sig._id} hasGlow={!isClosed} glowColor={isNifty ? 'amber' : 'cyan'}>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      {/* Signal header details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-white">{sig.symbol}</span>
                          <span className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                            sig.optionType === 'CE' 
                              ? 'bg-green-500/10 text-[#10B981] border border-[#10B981]/20' 
                              : 'bg-red-500/10 text-[#EF4444] border border-[#EF4444]/20'
                          }`}>
                            {sig.strike} {sig.optionType}
                          </span>
                          <span className="text-[8px] font-bold text-[#71717A] uppercase tracking-wider">
                            Source: {sig.source}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#A1A1AA] max-w-lg leading-relaxed">
                          <span className="font-bold text-[#D4AF37] uppercase tracking-wider">AI Logic: </span>
                          {sig.aiRationale}
                        </p>
                      </div>

                      {/* Pricing block */}
                      <div className="flex gap-6 text-left shrink-0">
                        <PriceBlock label="ENTRY" value={`₹${sig.entry}`} />
                        <PriceBlock label="STOP LOSS" value={`₹${sig.sl}`} color="text-[#EF4444]" />
                        <PriceBlock label="CURRENT" value={`₹${sig.currentPrice || sig.entry}`} color={isClosed ? 'text-[#71717A]' : 'text-[#10B981]'} />
                        <PriceBlock label="TARGET 1" value={`₹${sig.targets[0]}`} color="text-[#00C2FF]" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/[0.03] mt-4 pt-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isClosed ? 'bg-[#71717A]' : 'bg-[#10B981] animate-pulse'}`} />
                        <span className="text-[9px] font-black tracking-wider text-[#A1A1AA] uppercase">
                          STATUS: {sig.status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      {!isClosed ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => closeSignal(sig._id, 'CLOSED_PROFIT')}
                            className="h-8 px-4 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 hover:border-[#10B981]/50 text-[#10B981] font-black text-[9px] tracking-wider uppercase transition-colors"
                          >
                            SETTLE PROFIT
                          </button>
                          <button
                            onClick={() => closeSignal(sig._id, 'CLOSED_LOSS')}
                            className="h-8 px-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 hover:border-[#EF4444]/50 text-[#EF4444] font-black text-[9px] tracking-wider uppercase transition-colors"
                          >
                            SETTLE SL
                          </button>
                          <button
                            onClick={() => deleteSignal(sig._id)}
                            className="p-2 rounded-lg bg-white/5 border border-white/5 hover:text-[#EF4444] transition-all"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => deleteSignal(sig._id)}
                          className="h-8 px-3 rounded-lg bg-white/5 border border-white/5 hover:text-[#EF4444] text-[#71717A] text-[9px] font-black uppercase tracking-wider transition-colors"
                        >
                          DELETE ARCHIVE
                        </button>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <GlassCard className="p-12 text-center text-[#71717A] uppercase font-black tracking-[4px]">
                No Options setups found in this view
              </GlassCard>
            )}
          </div>
        </div>

        {/* Right Column: Signal Dispatch Form */}
        <div className="lg:col-span-4">
          <GlassCard title="Signal Dispatch Engine" hasGlow={true}>
            <form onSubmit={handleSubmitSignal} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">SYMBOL</label>
                  <select 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                  >
                    <option value="NIFTY">Nifty 50</option>
                    <option value="BANKNIFTY">BankNifty</option>
                    <option value="FINNIFTY">Finnifty</option>
                    <option value="SENSEX">Sensex</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">OPTION TYPE</label>
                  <select 
                    value={optionType} 
                    onChange={(e) => setOptionType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                  >
                    <option value="CE">CE (Call Option)</option>
                    <option value="PE">PE (Put Option)</option>
                    <option value="NONE">NONE (Futures)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
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

                <div className="space-y-1">
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

                <div className="space-y-1">
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

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1 flex justify-between">
                  <span>TARGETS (COMMA SEPARATED)</span>
                  <span className="text-[7px] text-[#4B4B52]">e.g. 280,310,350</span>
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

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">AI Setup Rationale</label>
                <textarea
                  placeholder="Order book imbalance buying detected at 23450 support cluster..."
                  value={aiRationale}
                  onChange={(e) => setAiRationale(e.target.value)}
                  className="w-full h-20 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">CONFIDENCE (%)</label>
                  <input
                    type="number"
                    placeholder="89"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">RATING</label>
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                  >
                    <option value="WEAK">Weak Option</option>
                    <option value="MEDIUM">Medium Strength</option>
                    <option value="STRONG">Strong Setup</option>
                    <option value="PREMIUM">Premium Elite</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
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

// Sub component inside signals page
const PriceBlock = ({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) => (
  <div className="space-y-1">
    <span className="text-[8px] font-black text-[#71717A] tracking-[1px] uppercase block">
      {label}
    </span>
    <span className={`text-sm font-black tracking-tight ${color}`}>
      {value}
    </span>
  </div>
);
