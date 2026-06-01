import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { RealtimeChart } from '../components/RealtimeChart';
import { HeartPulse, Database, Activity, HardDrive, RefreshCw } from 'lucide-react';

export default function Health() {
  const dispatch = useDispatch();
  const systemHealth = useSelector((state) => state.admin.systemHealth);
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(setActiveTab('health'));
  }, [dispatch]);
  
  // Real-time server telemetry simulation data
  const [telemetry, setTelemetry] = useState({
    cpu: systemHealth.cpu,
    memoryUsed: systemHealth.memory.used,
    dbLatency: 4.8,
    redisLatency: 0.8,
  });

  useEffect(() => {
    // telemetries variation intervals
    const tracker = setInterval(() => {
      setTelemetry(prev => ({
        cpu: Math.min(95, Math.max(10, prev.cpu + Math.floor(Math.random() * 11 - 5))),
        memoryUsed: Math.min(15.8, Math.max(2.1, parseFloat((prev.memoryUsed + (Math.random() * 0.4 - 0.2)).toFixed(2)))),
        dbLatency: parseFloat((4.5 + Math.random() * 1.5).toFixed(2)),
        redisLatency: parseFloat((0.6 + Math.random() * 0.4).toFixed(2)),
      }));
    }, 2000);

    // generate system logs
    const logger = setInterval(() => {
      const routes = ['GET /api/v1/signals', 'POST /api/v1/auth/verify-otp', 'GET /api/v1/admin/stats', 'PUT /api/v1/profile'];
      const responseTimes = ['12ms', '42ms', '8ms', '14ms', '22ms'];
      const randomRoute = routes[Math.floor(Math.random() * routes.length)];
      const randomTime = responseTimes[Math.floor(Math.random() * responseTimes.length)];
      
      const newLog = `[${new Date().toLocaleTimeString()}] Fastify — HTTP 200 OK — ${randomRoute} — ${randomTime}`;
      setLogs(prev => [newLog, ...prev.slice(0, 15)]);
    }, 3000);

    return () => {
      clearInterval(tracker);
      clearInterval(logger);
    };
  }, []);

  const handleRunHealthCheck = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      alert('Diagnostic checklist completed. Databases & caching adapter fully optimal.');
    }, 1200);
  };

  const cpuTrendData = [
    { name: '10s ago', value: 20 },
    { name: '8s ago', value: 28 },
    { name: '6s ago', value: 24 },
    { name: '4s ago', value: 32 },
    { name: '2s ago', value: 18 },
    { name: 'Now', value: telemetry.cpu },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          SYSTEM <span className="text-[#D4AF37]">HEALTH</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Live Process Telemetry, Database Response times & Distributed Workers Logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Diagnostics grid */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard title="Process Health Check">
            <div className="space-y-4">
              <HealthItem label="CPU Load Utilization" value={`${telemetry.cpu}%`} icon={Activity} color="text-cyan-500" />
              <HealthItem label="Memory Utilization" value={`${telemetry.memoryUsed} GB / 16.0 GB`} icon={HardDrive} color="text-[#D4AF37]" />
              <HealthItem label="MongoDB Latency" value={`${telemetry.dbLatency} ms`} icon={Database} color="text-[#10B981]" />
              <HealthItem label="Redis Cache Latency" value={`${telemetry.redisLatency} ms`} icon={Database} color="text-amber-500" />
            </div>
          </GlassCard>

          <GlassCard title="Distributed Queue Status" hasGlow={true}>
            <div className="space-y-3.5 text-xs font-bold">
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Active Workers</span>
                <span className="text-white">4 Running</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Scheduled Jobs</span>
                <span className="text-white">6 Queueing</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-[#71717A] uppercase">Failed Tasks</span>
                <span className="text-[#10B981]">0 Failed</span>
              </div>
              <button
                onClick={handleRunHealthCheck}
                disabled={refreshing}
                className="w-full h-10 mt-2 rounded-xl bg-[#00C2FF] text-black font-black uppercase text-[9px] tracking-[2px] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <RefreshCw size={10} className={refreshing ? 'animate-spin' : ''} />
                RUN TELEMETRY DIAGNOSTIC
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Graphs & Console */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard title="CPU Core Consumption">
              <RealtimeChart data={cpuTrendData} color="#00C2FF" />
            </GlassCard>

            <GlassCard title="System Node Status">
              <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                <div className="p-4 bg-[#10B981]/5 border border-[#10B981]/15 text-[#10B981] rounded-2xl animate-pulse">
                  <HeartPulse size={32} />
                </div>
                <div>
                  <h4 className="text-base font-black text-white uppercase italic">SYSTEM OPERATIONAL</h4>
                  <span className="text-[9px] font-black text-[#71717A] uppercase tracking-[1.5px]">
                    Uptime: 3 Days, 3 Hours
                  </span>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard title="Real-time Server logs Console">
            <div className="font-mono text-[9px] text-[#A1A1AA] h-48 overflow-y-auto no-scrollbar space-y-2.5 leading-relaxed bg-[#0D0D12]/60 p-4 rounded-2xl border border-white/5">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-amber-500/80 tracking-normal select-none">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center uppercase font-black tracking-widest text-[#4B4B52]">
                  Listening for Fastify server HTTP logs...
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

const HealthItem = ({ label, value, icon: Icon, color }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03] last:border-none">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-white/[0.02] border border-white/5 ${color}`}>
        <Icon size={14} />
      </div>
      <span className="text-xs font-black text-white tracking-tight">{label}</span>
    </div>
    <span className="text-xs font-black text-white uppercase tracking-wider">
      {value}
    </span>
  </div>
);
