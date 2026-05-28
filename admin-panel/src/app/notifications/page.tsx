'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '../../store/useAdminStore';
import { Bell, Sparkles, Send, CheckCircle2, Volume2, Users, AlertTriangle, ShieldCheck, Mail, Target, Percent } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export default function NotificationsPage() {
  const { notifications, dispatchNotification, setActiveTab, stats } = useAdminStore();
  const [type, setType] = useState('SIGNAL_ALERT');
  const [target, setTarget] = useState('ALL_USERS');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setActiveTab('notifications');
  }, [setActiveTab]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) {
      alert('Please enter title and content body');
      return;
    }
    setSending(true);

    const targetLabel = {
      'ALL_USERS': 'All Users',
      'FREE_USERS': 'Free Tier Only',
      'PRO_USERS': 'Pro Tier Only',
      'ELITE_USERS': 'Elite Tier Only',
    }[target] || 'All Users';

    await dispatchNotification({
      type,
      title,
      body,
      target: targetLabel,
    });

    setTitle('');
    setBody('');
    setSending(false);
    alert('Real-time system notification broadcasted successfully!');
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[3px]">COMMUNICATION STREAM ENGINE</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">
            ALERT <span className="text-[#D4AF37]">CENTER</span>
          </h2>
          <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[4px]">
            Global Volatility alerts, push alerts, promotional alerts, and system emergency messages dispatcher
          </p>
        </div>
      </div>

      {/* Analytics Mini Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard hoverable={true}>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase">Total Broadcasts</span>
              <h3 className="text-2xl font-black text-white uppercase italic">1,480 Sent</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-[#00C2FF]/10 border border-[#00C2FF]/20 text-[#00C2FF]">
              <Send size={16} />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable={true}>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase">Delivery Rate</span>
              <h3 className="text-2xl font-black text-white uppercase italic">{stats.notificationDeliveryRate || 99.4}%</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-[#10B981]">
              <CheckCircle2 size={16} />
            </div>
          </div>
        </GlassCard>

        <GlassCard hoverable={true}>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase">Avg Click-Through (CTR)</span>
              <h3 className="text-2xl font-black text-white uppercase italic">14.6% CTR</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D4AF37]">
              <Percent size={16} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form dispatcher */}
        <div className="lg:col-span-5">
          <GlassCard title="Realtime composer" hasGlow={true}>
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Alert Trigger Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                >
                  <option value="SIGNAL_ALERT">🚨 Option Signal Alert</option>
                  <option value="TARGET_HIT">🎯 Target Hit Alert</option>
                  <option value="SL_HIT">🛡️ Stop Loss Hit Alert</option>
                  <option value="VOLATILITY_WARN">⚠️ Volatility VIX Spike Warning</option>
                  <option value="SYSTEM_MAINTENANCE">⚙️ System Maintenance Update</option>
                  <option value="MARKET_ANNOUNCEMENT">🌐 Market Macro Announcement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Target Demographics
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                >
                  <option value="ALL_USERS">All Active Users (Global Broadcast)</option>
                  <option value="FREE_USERS">Free Tier Users Only</option>
                  <option value="PRO_USERS">Pro Subscription Users Only</option>
                  <option value="ELITE_USERS">Elite Subscription Users Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Alert Header Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. NIFTY Target 1 Executed Successfully"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold animate-transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Alert Message Content
                </label>
                <textarea
                  placeholder="e.g. Option price touched ₹280 from ₹240 entry. Net return is 16.6% in 45 minutes."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] hover:bg-[#cfa52f] hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={12} />
                {sending ? 'BROADCASTING...' : 'DISPATCH REALTIME ALERT'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: History of sent notifications */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard title="Broadcast Dispatch Logs">
            <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
              <AnimatePresence>
                {notifications.map((notif, index) => (
                  <motion.div 
                    key={notif.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3 hover:bg-white/[0.02] hover:border-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{notif.title}</span>
                          <span className="text-[7px] font-black tracking-widest uppercase bg-amber-500/5 px-2 py-0.5 rounded text-[#D4AF37] border border-amber-500/10">
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#5A5E70] font-black uppercase tracking-wider">
                          TARGET: <span className="text-white">{notif.target}</span> — {notif.time || 'JUST NOW'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-[8px] font-black text-[#10B981] bg-[#10B981]/5 px-2.5 py-1 border border-[#10B981]/15 rounded-lg shrink-0">
                        <CheckCircle2 size={10} />
                        {notif.status || 'SENT'}
                      </div>
                    </div>

                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {notif.body}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
