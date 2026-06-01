"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import { useSignalStore } from "@/store/useSignalStore";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Bell, Clock, Trash2, Zap, AlertCircle, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, addNotification } = useSignalStore();

  const handleClearAll = () => {
    useSignalStore.setState({ notifications: [] });
  };

  const getNotifStyles = (type: string) => {
    switch (type) {
      case "new_signal":
        return {
          icon: <Zap size={16} className="text-[#D4AF37]" />,
          border: "border-[#D4AF37]/20",
          bg: "bg-[#D4AF37]/5",
        };
      case "signal_closed":
        return {
          icon: <CheckCircle size={16} className="text-emerald-400" />,
          border: "border-emerald-500/20",
          bg: "bg-emerald-500/5",
        };
      default:
        return {
          icon: <AlertCircle size={16} className="text-amber-400" />,
          border: "border-amber-500/20",
          bg: "bg-amber-500/5",
        };
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white tracking-tight uppercase">
              Notifications Feed
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-1">
              Realtime log of algorithmic events, option contract alerts, and system milestones.
            </p>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={14} />
              Clear Log
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#14141a]/40 border border-white/[0.04] text-center text-neutral-500 font-medium text-sm flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-full text-neutral-600">
              <Bell size={24} />
            </div>
            <span>No notifications logged yet. Live feed is active.</span>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {notifications.map((notif) => {
              const styles = getNotifStyles(notif.type);

              return (
                <PremiumCard
                  key={notif.id}
                  className={`p-5 flex items-start gap-4 border ${styles.border} ${styles.bg}`}
                  hoverGlow={true}
                >
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 shrink-0 mt-0.5">
                    {styles.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-sm font-bold text-white tracking-wide uppercase font-outfit">
                        {notif.title}
                      </h4>
                      <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(notif.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-2 font-medium leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </PremiumCard>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
