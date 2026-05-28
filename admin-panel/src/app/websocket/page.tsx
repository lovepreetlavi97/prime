'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Activity, ShieldAlert, Cpu, Layers, HardDrive } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { RealtimeChart } from '../../components/RealtimeChart';

export default function WebsocketPage() {
  const { websocketRooms, latency, stats, setActiveTab } = useAdminStore();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setActiveTab('websocket');
  }, [setActiveTab]);

  useEffect(() => {
    // Generate real-time logs to simulate a high-frequency socket connection
    const timer = setInterval(() => {
      const symbols = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];
      const actions = ['joined room', 'left room', 'subscribed market', 'pinged heartbeat'];
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const id = Math.floor(Math.random() * 9000 + 1000);
      
      const newLog = `[${new Date().toLocaleTimeString()}] Client 987654${id} ${randomAction} (${randomSymbol})`;
      setLogs(prev => [newLog, ...prev.slice(0, 15)]);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const eventStatsData = [
    { name: '10s ago', value: 88 },
    { name: '8s ago', value: 94 },
    { name: '6s ago', value: 110 },
    { name: '4s ago', value: 105 },
    { name: '2s ago', value: 115 },
    { name: 'Now', value: stats.activeConnections },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          WEBSOCKET <span className="text-[#D4AF37]">CLUSTERS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          High-Frequency Channel Subscriptions & Client Occupancies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Room occupancies */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Active Room Subscription">
            <div className="space-y-4">
              {Object.entries(websocketRooms).map(([room, count]) => (
                <div key={room} className="flex justify-between items-center py-3 border-b border-white/[0.03] last:border-none">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C2FF] shadow-[0_0_8px_#00C2FF]" />
                    <span className="text-xs font-black text-white">{room}</span>
                  </div>
                  <span className="text-xs font-black text-[#D4AF37] tracking-wider bg-amber-500/5 px-2.5 py-0.5 rounded-lg border border-amber-500/10">
                    {count} Connections
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Gateway Controls" hasGlow={true}>
            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Shadow Mode (Gateway)</span>
                <span className="text-[#10B981] font-black">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Pub/Sub Adapter</span>
                <span className="text-white">Redis Cluster</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Broadcaster Protocol</span>
                <span className="text-[#00C2FF] font-black">uWebSockets (uws)</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right column: Charts & Logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard title="Client Connection Load">
              <RealtimeChart data={eventStatsData} color="#00C2FF" />
            </GlassCard>

            <GlassCard title="Heartbeat RTT Diagnostics">
              <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#D4AF37]/20 animate-spin" />
                  <span className="absolute text-xl font-black italic uppercase text-white">{latency}ms</span>
                </div>
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[2px]">
                  Connection health optimal
                </span>
              </div>
            </GlassCard>
          </div>

          <GlassCard title="Live Server Socket Event Logs">
            <div className="font-mono text-[10px] text-[#A1A1AA] h-48 overflow-y-auto no-scrollbar space-y-2 leading-relaxed bg-[#0D0D12]/60 p-4 rounded-2xl border border-white/5">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-500/80 tracking-normal select-none">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center uppercase font-black tracking-widest text-[#4B4B52]">
                  Listening for WebSocket streams...
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
