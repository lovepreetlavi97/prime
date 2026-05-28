'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Signal as SignalIcon, Zap, Bell, Volume2 } from 'lucide-react';
import { useSignalStore } from '@/store/useSignalStore';
import { playTechClick, triggerHaptic } from '@/utils/feedback';

export const TelegramEffect = () => {
  const { socket } = useSignalStore();
  const [activeSignal, setActiveSignal] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewSignal = (signal: any) => {
      const state = useSignalStore.getState();
      const settings = state.settings;
      
      setActiveSignal(signal);
      setIsVisible(true);
      
      // World-level feedback (Safe access)
      if (settings?.sound) playTechClick(0.4);
      if (settings?.haptics) triggerHaptic(50);


      // Auto-hide after 12 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 12000);
    };

    socket.on('new_signal', handleNewSignal);
    return () => {
      socket.off('new_signal', handleNewSignal);
    };
  }, [socket]);

  return (
    <AnimatePresence>
      {isVisible && activeSignal && (
        <motion.div
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="fixed top-20 right-4 z-[200] w-full max-w-[320px] pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-[24px] bg-[#1a1c23]/90 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center shadow-[0_0_15px_rgba(0,136,204,0.3)]">
                  <Send size={14} className="text-white ml-[-1px]" fill="white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-white uppercase tracking-wider">Telegram Intelligence</span>
                  <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-widest">Priority Channel</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-[9px] font-black text-[#22C55E] uppercase tracking-widest">Live</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/10">
                  <Zap size={20} className="text-[#D4AF37]" fill="#D4AF37" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-black text-white tracking-tight uppercase italic">{activeSignal.symbol}</h3>
                  <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[2px]">{activeSignal.strike} {activeSignal.optionType}</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 border border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider">Entry Level</span>
                  <span className="text-lg font-black text-white italic">₹{activeSignal.entry}</span>
                </div>
                <div className="h-8 w-px bg-white/5" />
                <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-wider">Stop Loss</span>
                  <span className="text-lg font-black text-red-500 italic">₹{activeSignal.sl}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setIsVisible(false)}
                  className="flex-1 h-10 bg-[#D4AF37] text-black font-black text-[10px] uppercase tracking-[2px] rounded-xl active:scale-95 transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
                >
                  View Details
                </button>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 text-[#A1A1AA] rounded-xl border border-white/10 hover:text-white"
                >
                  <Check size={18} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-[2px] bg-[#D4AF37]/50"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
