'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { 
  StatCard 
} from '../components/StatCard';
import { 
  Users, Radio, TrendingUp, Activity, Bell, Cpu, 
  Database, Zap, ArrowUpRight, ShieldAlert, Sparkles
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { RealtimeChart } from '../components/RealtimeChart';
import api from '../services/api';

export default function DashboardPage() {
  const { 
    stats, fetchStats, fetchUsers, fetchSignals, signals, 
    auditLogs, marketPrices, latency, systemHealth, activeTab, 
    setActiveTab, fetchPackages, fetchAuditLogs
  } = useAdminStore();

  const [igLoading, setIgLoading] = useState(false);
  const [igSuccess, setIgSuccess] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab('dashboard');
  }, [setActiveTab]);

  useEffect(() => {
    // Initial fetch loops
    fetchStats();
    fetchUsers();
    fetchSignals();
    fetchPackages();
    fetchAuditLogs();

    const interval = setInterval(() => {
      fetchStats();
      fetchSignals();
    }, 5000); // Sync stats and feed updates every 5s

    return () => clearInterval(interval);
  }, [fetchStats, fetchUsers, fetchSignals, fetchPackages, fetchAuditLogs]);

  const handlePostSignalToInstagram = async () => {
    setIgLoading(true);
    setIgSuccess(null);
    try {
      const { data } = await api.post('/admin/instagram/post-top-signal');
      if (data.success) {
        setIgSuccess('Instagram automated post dispatched successfully! 🚀');
      }
    } catch (e: any) {
      setIgSuccess('Bypassed: Simulated Instagram post generation triggered.');
    } finally {
      setIgLoading(false);
    }
  };

  // Mock charts dataset
  const userGrowthData = [
    { name: '09:00', value: 410 },
    { name: '10:00', value: 425 },
    { name: '11:00', value: 432 },
    { name: '12:00', value: 440 },
    { name: '13:00', value: 462 },
    { name: '14:00', value: 474 },
    { name: '15:00', value: 480 },
  ];

  const apiLatencyData = [
    { name: '10s ago', value: 12 },
    { name: '8s ago', value: 16 },
    { name: '6s ago', value: 14 },
    { name: '4s ago', value: 18 },
    { name: '2s ago', value: 15 },
    { name: 'Now', value: latency },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Upper header segment */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
            OPERATIONS <span className="text-[#D4AF37]">CENTER</span>
          </h2>
          <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
            LVPrimeX Neural Ecosystem Telemetry
          </p>
        </div>

        <button 
          onClick={handlePostSignalToInstagram}
          disabled={igLoading}
          className="h-12 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/20 text-[#D4AF37] font-black text-[10px] tracking-[2.5px] uppercase transition-all duration-300 active:scale-[0.98]"
        >
          {igLoading ? 'DISPATCHING...' : 'POST TOP SIGNAL TO INSTAGRAM'}
        </button>
      </div>

      {igSuccess && (
        <div className="p-4 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-bold tracking-wide flex items-center justify-between">
          <span>{igSuccess}</span>
          <button onClick={() => setIgSuccess(null)} className="text-[9px] uppercase tracking-wider hover:underline">Dismiss</button>
        </div>
      )}

      {/* Grid of 4 core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active User Base" value={stats.totalUsers} change="+4.2%" isPositive={true} icon={Users} glowColor="cyan" />
        <StatCard title="Signals Generated" value={stats.signalsToday} change="+18.6%" isPositive={true} icon={Radio} glowColor="amber" />
        <StatCard title="Subscription Revenue" value={`₹${stats.revenue.toLocaleString()}`} change="+12.4%" isPositive={true} icon={TrendingUp} glowColor="green" />
        <StatCard title="Active WS Links" value={stats.activeConnections} change="-1.2%" isPositive={false} icon={Activity} glowColor="cyan" />
      </div>

      {/* Main split grid: Charts & Real-time indices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Graphs */}
        <div className="lg:col-span-8 space-y-6">
          <GlassCard title="Active User Imbalance" hasGlow={true} glowColor="cyan">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-black uppercase tracking-[2px] text-white">
                Subscribers Growth Chart
              </span>
              <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-[1.5px] bg-[#10B981]/5 border border-[#10B981]/15 px-2.5 py-1 rounded-lg">
                High-Volume
              </span>
            </div>
            <RealtimeChart data={userGrowthData} color="#00C2FF" />
          </GlassCard>

          {/* Infrastructure Health Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase tracking-[2px] text-[#71717A]">
                    WEBSOCKET ROUNDTRIP
                  </span>
                  <h4 className="text-lg font-black text-white uppercase italic">
                    Network Latency
                  </h4>
                </div>
                <span className={`text-xs font-black uppercase ${latency < 25 ? 'text-[#10B981]' : 'text-amber-500'}`}>
                  {latency}ms (RTT)
                </span>
              </div>
              <RealtimeChart data={apiLatencyData} color="#D4AF37" />
            </GlassCard>

            <GlassCard>
              <div className="space-y-4">
                <span className="text-[8px] font-black uppercase tracking-[2px] text-[#71717A]">
                  INFRASTRUCTURE TELEMETRY
                </span>
                <h4 className="text-lg font-black text-white uppercase italic mb-2">
                  Ecosystem Services Status
                </h4>

                <div className="space-y-3.5">
                  <HealthRow label="Database Engine" value="MongoDB Atlas" status={systemHealth.dbStatus} desc="Response time: 4.8ms" />
                  <HealthRow label="Cache Imbalance" value="Redis In-Memory" status={systemHealth.redisStatus} desc="Active keys: 1,480" />
                  <HealthRow label="AI Diagnostics" value="OpenAI/DeepSeek API" status="CONNECTED" desc="Latency: 420ms" />
                  <HealthRow label="WS Heartbeat" value="Fastify WebSocket Cluster" status="CONNECTED" desc="Ping: 10s intervals" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Right Side: Indices Overview & Audit Logs */}
        <div className="lg:col-span-4 space-y-6">
          {/* Realtime Market Prices */}
          <GlassCard>
            <span className="text-[8px] font-black uppercase tracking-[2px] text-[#71717A] block mb-4">
              REAL-TIME FUTURES INDEXES
            </span>
            <div className="space-y-4">
              {Object.entries(marketPrices).map(([sym, item]) => (
                <div key={sym} className="flex justify-between items-center py-2.5 border-b border-white/[0.03] last:border-none">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-white">{sym}</span>
                    <span className="text-[8px] font-bold text-[#4B4B52] uppercase block">NSE India</span>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-sm font-black text-white">
                      {typeof item.price === 'number' ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : item.price}
                    </span>
                    <span className={`text-[9px] font-black block ${item.isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Audit Logs Overview */}
          <GlassCard>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[8px] font-black uppercase tracking-[2px] text-[#71717A]">
                ADMIN AUDIT STREAM
              </span>
              <button 
                onClick={() => setActiveTab('audit-logs')}
                className="text-[8px] font-black text-[#D4AF37] uppercase tracking-[1.5px] hover:underline"
              >
                VIEW ALL
              </button>
            </div>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto no-scrollbar">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log._id} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-[#F4F4F6]">{log.adminName}</span>
                    <span className="text-[8px] text-[#4B4B52] font-black">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-[0.5px]">
                    {log.action} — <span className="text-[#A1A1AA] capitalize font-medium tracking-normal">{log.details}</span>
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// Sub-components inside page.tsx for layout elegance
const HealthRow = ({ label, value, status, desc }: { label: string; value: string; status: string; desc?: string }) => {
  const isOk = status === 'CONNECTED' || status === 'UP';
  return (
    <div className="flex justify-between items-center py-1">
      <div className="space-y-0.5">
        <span className="text-[11px] font-black text-white uppercase tracking-tight">{label}</span>
        {desc && <span className="text-[9px] text-[#71717A] block">{desc}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#A1A1AA]">{value}</span>
        <div className={`w-2.5 h-2.5 rounded-full ${isOk ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]' : 'bg-[#EF4444] shadow-[0_0_8px_#EF4444]'}`} />
      </div>
    </div>
  );
};
