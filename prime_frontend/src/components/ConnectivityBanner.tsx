'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { useSignalStore } from '@/store/useSignalStore';

export const ConnectivityBanner = () => {
  const { isConnected, socket } = useSignalStore();
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    let timer: any;
    if (!isConnected) {
      timer = setTimeout(() => setShowRetry(true), 5000);
    } else {
      setShowRetry(false);
    }
    return () => clearTimeout(timer);
  }, [isConnected]);

  const handleManualReconnect = () => {
    if (socket) {
      socket.connect();
    } else {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-20 left-4 right-4 z-[500] flex flex-col items-center gap-4"
        >
          <div className="w-full max-w-md bg-[#0D0D12]/90 backdrop-blur-3xl border border-red-500/20 rounded-[24px] p-5 shadow-[0_20px_50px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <WifiOff className="text-red-500 animate-pulse" size={20} />
              </div>
              <div className="flex-1 space-y-0.5">
                <h3 className="text-[12px] font-black text-white uppercase tracking-[2px] italic">NEURAL SYNC LOST</h3>
                <p className="text-[8px] font-black text-red-500/60 uppercase tracking-[1.5px]">RE-ESTABLISHING HFT GATEWAY...</p>
              </div>
              {showRetry && (
                <button
                  onClick={handleManualReconnect}
                  className="px-4 py-2 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-[2px] active:scale-95 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={10} className="animate-spin-slow" />
                  RETRY
                </button>
              )}
            </div>
            
            <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-xl border border-white/5">
              <AlertCircle size={10} className="text-[#4B4B52]" />
              <p className="text-[7px] font-black text-[#4B4B52] uppercase tracking-[1.5px]">
                CHECK SYSTEM TELEMETRY OR API INFRASTRUCTURE
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
