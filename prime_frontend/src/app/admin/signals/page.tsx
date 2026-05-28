'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Send, 
  Plus, 
  Trash2, 
  Edit3, 
  Target, 
  Activity,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SignalsAdminPage() {
  const [isCreating, setIsCreating] = useState(false);

  const activeSignals = [
    { symbol: 'NIFTY 22400 PE', type: 'BUY', entry: 185, sl: 160, targets: '210/240/280', time: '10:45 AM' },
    { symbol: 'BANKNIFTY 48200 CE', type: 'BUY', entry: 420, sl: 380, targets: '460/510', time: '09:30 AM' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Signal Command Center</h1>
          <p className="text-slate-500 text-sm">Broadcasting real-time market opportunities.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} /> New Signal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Signal Forms / Recent Form Activity */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Target size={16} className="text-indigo-500" /> Dispatch Quick Entry
              </h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="py-2.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs uppercase border border-emerald-100">BUY</button>
                    <button className="py-2.5 rounded-xl bg-slate-50 text-slate-400 font-bold text-xs uppercase border border-slate-100">SELL</button>
                 </div>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none" placeholder="Symbol (e.g. SENSEX 76000 PE)" />
                 <div className="grid grid-cols-2 gap-4">
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="Entry" />
                    <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="Stop Loss" />
                 </div>
                 <input className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm" placeholder="Targets (sep by /)" />
                 <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4 hover:bg-indigo-600 transition-colors">
                    SEND SIGNAL <Send size={16} />
                 </button>
              </form>
           </div>
        </div>

        {/* Active Signals List */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-2">Live Broadcasts</h3>
           {activeSignals.map((signal, i) => (
             <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Zap size={24} />
                   </div>
                   <div>
                      <div className="text-lg font-black text-slate-800 uppercase leading-tight">{signal.symbol}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 uppercase">{signal.type}</span>
                         <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{signal.time}</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6 md:gap-12">
                   <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Entry</div>
                      <div className="text-sm font-black text-slate-800">{signal.entry}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">SL</div>
                      <div className="text-sm font-black text-rose-500">{signal.sl}</div>
                   </div>
                   <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Targets</div>
                      <div className="text-sm font-black text-emerald-500">{signal.targets}</div>
                   </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                   <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                   <button className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
             </div>
           ))}

           <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <History className="text-slate-300 mb-2" size={32} />
              <p className="text-slate-400 text-sm font-medium">View signal history for older records</p>
           </div>
        </div>
      </div>
    </div>
  );
}
