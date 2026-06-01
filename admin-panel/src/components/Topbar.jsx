import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, Radio, Network, Database, Activity, Clock, ShieldCheck 
} from 'lucide-react';
import { fetchUsers, fetchSignals } from '../store/slices/adminSlice';

export const Topbar = () => {
  const dispatch = useDispatch();
  const systemHealth = useSelector((state) => state.admin.systemHealth);
  const latency = useSelector((state) => state.admin.latency);
  const users = useSelector((state) => state.admin.users);
  const signals = useSelector((state) => state.admin.signals);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchSignals());
  }, [dispatch]);

  // Simple Indian Market hours checker: 9:15 AM to 3:30 PM IST, Monday to Friday
  const checkIndianMarketOpen = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 3600000 * 5.5);
    
    const day = ist.getDay();
    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    const timeVal = hours * 100 + minutes;

    // Weekends closed
    if (day === 0 || day === 6) return false;
    // Market hours: 9:15 to 15:30
    return timeVal >= 915 && timeVal <= 1530;
  };

  const isMarketOpen = checkIndianMarketOpen();

  return (
    <header className="h-16 w-full glass-panel border-b border-white/5 flex items-center justify-between px-8 select-none shrink-0 relative z-30">
      {/* Glow Highlight Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

      {/* Real-time Status Counters */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[9px] font-black text-white tracking-[2.5px] uppercase">
            LIVE TELEMETRY ACTIVE
          </span>
        </div>

        <div className="h-4 w-[1px] bg-white/5" />

        {/* Active Users */}
        <div className="flex items-center gap-2.5">
          <Users size={13} className="text-[#00C2FF]" />
          <div>
            <span className="text-[8px] font-black text-[#71717A] uppercase block leading-none">ACTIVE TERMINALS</span>
            <span className="text-xs font-black text-white leading-none mt-0.5 block">{users.length}</span>
          </div>
        </div>

        {/* Pro Users */}
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={13} className="text-[#D4AF37]" />
          <div>
            <span className="text-[8px] font-black text-[#71717A] uppercase block leading-none">PRO SUBSCRIBERS</span>
            <span className="text-xs font-black text-amber-500 leading-none mt-0.5 block">
              {users.filter(u => u.subscription && u.subscription.plan && u.subscription.plan !== 'free').length}
            </span>
          </div>
        </div>

        {/* Active Signals */}
        <div className="flex items-center gap-2.5">
          <Radio size={13} className="text-[#10B981]" />
          <div>
            <span className="text-[8px] font-black text-[#71717A] uppercase block leading-none">RUNNING SIGNALS</span>
            <span className="text-xs font-black text-green-500 leading-none mt-0.5 block">
              {signals.filter(s => s.status === 'ACTIVE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Service Connections Indicators */}
      <div className="flex items-center gap-5">
        {/* Dhan Broker Engine status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.01] border border-white/5">
          <Network size={11} className="text-[#00C2FF]" />
          <span className="text-[8px] font-black text-[#71717A] uppercase tracking-wider">DHAN FEED:</span>
          <span className="text-[8px] font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_#10B981]" />
            SYNCED
          </span>
        </div>

        {/* Redis Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.01] border border-white/5">
          <Database size={11} className="text-[#D4AF37]" />
          <span className="text-[8px] font-black text-[#71717A] uppercase tracking-wider">REDIS CLUSTER:</span>
          <span className="text-[8px] font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_#10B981]" />
            CONNECTED
          </span>
        </div>

        {/* Latency RTT */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.01] border border-white/5">
          <Activity size={11} className="text-[#D4AF37]" />
          <span className="text-[8px] font-black text-[#71717A] uppercase tracking-wider">SOCKET RTT:</span>
          <span className="text-[8px] font-black text-[#10B981] uppercase tracking-wider">{latency}ms</span>
        </div>

        {/* Indian Market Session State */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.01] border border-white/5">
          <Clock size={11} className="text-white/60" />
          <span className="text-[8px] font-black text-[#71717A] uppercase tracking-wider">NSE SESSION:</span>
          {isMarketOpen ? (
            <span className="text-[8px] font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_8px_#10B981] animate-pulse" />
              OPEN
            </span>
          ) : (
            <span className="text-[8px] font-black text-[#EF4444] uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block shadow-[0_0_8px_#EF4444]" />
              CLOSED
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
