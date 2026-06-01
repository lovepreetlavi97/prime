import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { dispatchNotificationThunk, setActiveTab } from '../store/slices/adminSlice';

export default function Notifications() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.admin.notifications);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('All Users');
  const [type, setType] = useState('SIGNAL_ALERT');

  useEffect(() => {
    dispatch(setActiveTab('notifications'));
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !body) {
      alert('Notification title and body are required.');
      return;
    }

    dispatch(dispatchNotificationThunk({ type, title, body, target }));

    // Reset Form
    setTitle('');
    setBody('');
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          ALERT <span className="text-[#D4AF37]">CENTER</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Broadcast Push Notifications & System Alerts to Target Groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* History of sent alerts */}
        <div className="lg:col-span-8 space-y-4">
          <span className="text-[8px] font-black text-[#71717A] tracking-[2px] uppercase block mb-1">
            ALERT DISPATCH HISTORY
          </span>

          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <GlassCard key={notif.id} hoverable={true}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3">
                      <span className={`text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded border ${
                        notif.type === 'SIGNAL_ALERT' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]' 
                          : 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                      }`}>
                        {notif.type}
                      </span>
                      <span className="text-[9px] font-black text-[#71717A] uppercase">
                        TARGET: {notif.target.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white uppercase italic">{notif.title}</h4>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed font-bold">{notif.body}</p>
                  </div>

                  <div className="text-right space-y-1 shrink-0">
                    <span className="text-[8px] font-black text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/15 px-2.5 py-1 rounded-lg uppercase tracking-wide block">
                      {notif.status}
                    </span>
                    <span className="text-[8px] font-black text-[#4B4B52] block uppercase mt-1">
                      {notif.time}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="p-12 text-center text-[#5A5E70] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]">
              No Alerts Logged in History
            </div>
          )}
        </div>

        {/* Create Broadcast form */}
        <div className="lg:col-span-4">
          <GlassCard title="Alert Dispatch Console" hasGlow={true}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">ALERT TYPE</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                >
                  <option value="SIGNAL_ALERT">Signal Broadcast</option>
                  <option value="MARKET_WARN">Volatility Warning</option>
                  <option value="SYSTEM_MAINT">System Maintenance</option>
                  <option value="PROMO_ALERT">Marketing Promotion</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">TARGET GROUP</label>
                <select 
                  value={target} 
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                >
                  <option value="All Users">All Terminal Users</option>
                  <option value="Free Tier">Free Tier Accounts</option>
                  <option value="Pro Tier">Pro Subscribers</option>
                  <option value="Elite Tier">Elite Subscription Base</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">ALERT TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. NIFTY Breakdown Setup"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] pl-1">ALERT BODY</label>
                <textarea
                  placeholder="Immediate target triggers on PE options..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] hover:scale-[1.01] hover:bg-[#cfa52f] cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={12} />
                DISPATCH ALERTS
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
