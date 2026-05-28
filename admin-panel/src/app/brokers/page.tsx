'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { GlassCard } from '../../components/GlassCard';
import { Link, RefreshCw, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export default function BrokersPage() {
  const { brokerConnections, setActiveTab } = useAdminStore();
  const [logs, setLogs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setActiveTab('brokers');
  }, [setActiveTab]);

  useEffect(() => {
    // Generate real-time API logs
    const timer = setInterval(() => {
      const brokers = ['Zerodha (Kite)', 'Groww', 'Upstox', 'AngelOne'];
      const actions = ['verified TOTP token', 'fetched holdings margin', 'placed CE buy block order', 'heartbeat refresh completed'];
      const randomBroker = brokers[Math.floor(Math.random() * brokers.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      
      const newLog = `[${new Date().toLocaleTimeString()}] ${randomBroker} API bridge — ${randomAction}`;
      setLogs(prev => [newLog, ...prev.slice(0, 12)]);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert('All broker connection tokens successfully refreshed!');
    }, 1500);
  };

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          BROKER <span className="text-[#D4AF37]">BRIDGING</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Zerodha Kite, Groww & AngelOne Secure Bridge Status Monitor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Brokers sync grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black text-[#71717A] tracking-[2.5px] uppercase">
              ACTIVE TRADING CREDENTIAL BRIDGES
            </span>

            <button
              onClick={handleSyncAll}
              disabled={syncing}
              className="h-9 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-[#D4AF37] font-black text-[9px] tracking-[2px] uppercase flex items-center gap-1.5 transition-all duration-300"
            >
              <RefreshCw size={10} className={syncing ? 'animate-spin' : ''} />
              SYNC ALL BRIDGES
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brokerConnections.map((b, idx) => {
              const isCritical = b.tokenStatus === 'CRITICAL';
              return (
                <GlassCard key={idx} hasGlow={isCritical} glowColor="red" hoverable={true}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-base font-black text-white uppercase italic">{b.name}</h4>
                      <p className="text-[9px] text-[#00C2FF] font-bold tracking-wider">
                        {b.activeCount} Connected Accounts
                      </p>
                    </div>

                    <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded border ${
                      isCritical
                        ? 'bg-red-500/10 border-red-500/20 text-[#EF4444]'
                        : 'bg-green-500/10 border-green-500/20 text-[#10B981]'
                    }`}>
                      {b.tokenStatus}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide border-t border-white/[0.03] pt-4">
                    <span className="text-[#71717A]">Sync Health</span>
                    <span className={isCritical ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                      {b.health}% Optimal
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Right Column: Broker Logs console */}
        <div className="lg:col-span-4">
          <GlassCard title="Live API Broker Logs">
            <div className="font-mono text-[9px] text-[#A1A1AA] h-[340px] overflow-y-auto no-scrollbar space-y-2.5 leading-relaxed bg-[#0D0D12]/60 p-4 rounded-2xl border border-white/5">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-500/80 tracking-normal select-none">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center uppercase font-black tracking-widest text-[#4B4B52]">
                  Listening for API bridge requests...
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
