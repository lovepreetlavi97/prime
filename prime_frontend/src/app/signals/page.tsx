"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useSignalStore } from "@/store/useSignalStore";
import { LuxurySignalCard } from "@/components/LuxurySignalCard";

export default function LiveSignalsPage() {
  const { signals, user } = useSignalStore();
  const [filter, setFilter] = useState<"ALL" | "NIFTY" | "BANKNIFTY">("ALL");

  const isPro = user?.role === "ADMIN" || (
    user?.subscription?.isActive &&
    user?.subscription?.plan !== "free" &&
    (!user?.subscription?.endDate || new Date(user.subscription.endDate) > new Date())
  );

  const activeSignals = signals.filter(
    (s) => s.status === "ACTIVE" || s.status === "TARGET_HIT" || s.status === "PROFIT"
  );

  const filteredSignals = activeSignals.filter((signal) => {
    if (filter === "ALL") return true;
    if (filter === "NIFTY") return signal.symbol.includes("NIFTY") && !signal.symbol.includes("BANKNIFTY");
    if (filter === "BANKNIFTY") return signal.symbol.includes("BANKNIFTY");
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white tracking-tight uppercase">
              Live Options Feed
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-1">
              Low-latency WebSocket signal transmission feed. Actionable target levels.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 bg-[#14141a]/40 border border-white/[0.04] p-1.5 rounded-xl self-start">
            {(["ALL", "NIFTY", "BANKNIFTY"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  filter === opt
                    ? "bg-[#D4AF37] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {filteredSignals.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#14141a]/40 border border-white/[0.04] text-center text-neutral-500 font-medium text-sm">
            No active signals match the selected filter. Scanning option strikes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredSignals.map((signal, idx) => (
              <div key={signal._id} className="flex h-full">
                <LuxurySignalCard signal={signal} index={idx} isPro={isPro} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
