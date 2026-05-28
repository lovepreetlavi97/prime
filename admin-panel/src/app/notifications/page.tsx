'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { Bell, Sparkles, Send, CheckCircle2, Volume2 } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

export default function NotificationsPage() {
  const { notifications, dispatchNotification, setActiveTab } = useAdminStore();
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
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          ALERT <span className="text-[#D4AF37]">CENTER</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Global System Announcements & Volatility Notifications Dispatcher
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form dispatcher */}
        <div className="lg:col-span-5">
          <GlassCard title="Broadcast Dispatcher" hasGlow={true}>
            <form onSubmit={handleSendNotification} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Alert Trigger Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                >
                  <option value="SIGNAL_ALERT">Option Signal Alert</option>
                  <option value="VOLATILITY_WARN">Volatility VIX Spike Warning</option>
                  <option value="SYSTEM_MAINTENANCE">Ecosystem Under Maintenance</option>
                  <option value="MARKET_ANNOUNCEMENT">Market Macro Breakout Update</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  Target Demographics
                </label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                >
                  <option value="ALL_USERS">All Active Users (Global)</option>
                  <option value="FREE_USERS">Free Tier Users Only</option>
                  <option value="PRO_USERS">Pro Subscription Users Only</option>
                  <option value="ELITE_USERS">Elite Subscription Users Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  NOTIFICATION HEADER / TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sharp VIX Spike Warning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  NOTIFICATION BODY / CONTENT
                </label>
                <textarea
                  placeholder="e.g. Implied volatilities surged 5% in bank nifty options. Position sizing checks advised."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
              >
                <Send size={12} />
                {sending ? 'BROADCASTING...' : 'DISPATCH REALTIME ALERT'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: History of sent notifications */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard title="Dispatched Activity Logs">
            <div className="space-y-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{notif.title}</span>
                        <span className="text-[7px] font-black tracking-widest uppercase bg-amber-500/5 px-2 py-0.5 rounded text-[#D4AF37] border border-amber-500/10">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
                        TARGET: {notif.target} — {notif.time}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-black text-[#10B981] bg-[#10B981]/5 px-2 py-0.5 border border-[#10B981]/15 rounded-lg">
                      <CheckCircle2 size={10} />
                      {notif.status}
                    </div>
                  </div>

                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {notif.body}
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
