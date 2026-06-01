"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { API_URL } from "@/config";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Search, Calendar, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/signals?all=true`);
        if (res.ok) {
          const data = await res.json();
          // Filter closed signals
          const closed = (data || []).filter((s: any) =>
            ["CLOSED_PROFIT", "CLOSED_LOSS", "SL_HIT", "EXIT_ALERT", "TARGET_HIT", "PROFIT", "PROFIT_BOOKED"].includes(
              s.status
            )
          );
          setHistory(closed);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getGainPercentage = (item: any) => {
    if (item.profitPct) return parseFloat(item.profitPct);
    const entry = item.entry || 0;
    const high = item.highPrice || entry;
    if (entry === 0) return 0;
    return ((high - entry) / entry) * 100;
  };

  const filteredHistory = history.filter((item) => {
    const symbolMatches = item.symbol.toLowerCase().includes(search.toLowerCase());
    const pct = getGainPercentage(item);
    const isWin = pct >= 0;

    if (resultFilter === "WIN") return symbolMatches && isWin;
    if (resultFilter === "LOSS") return symbolMatches && !isWin;
    return symbolMatches;
  });

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black font-outfit text-white tracking-tight uppercase">
            Audit Ledger
          </h1>
          <p className="text-sm text-neutral-400 font-medium mt-1">
            Verified historical index options signals and cumulative performance reports.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-500 pointer-events-none">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search contract symbol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]/50 focus:bg-[#14141a]/70 transition-all font-semibold"
            />
          </div>

          {/* Selector */}
          <div className="flex items-center gap-1 bg-[#14141a]/40 border border-white/[0.04] p-1.5 rounded-2xl">
            {(["ALL", "WIN", "LOSS"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setResultFilter(opt)}
                className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  resultFilter === opt
                    ? "bg-[#D4AF37] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger List */}
        {loading ? (
          <div className="py-24 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
            Compiling audit history...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#14141a]/40 border border-white/[0.04] text-center text-neutral-500 font-medium text-sm">
            No historical signals found matching the search conditions.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => {
              const pct = getGainPercentage(item);
              const isWin = pct >= 0;

              return (
                <PremiumCard key={item._id} className="p-6 relative group" hoverGlow={true}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Symbol identity */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-xs border shrink-0 ${
                          isWin
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/25 text-rose-400"
                        }`}
                      >
                        {isWin ? "WIN" : "SL"}
                      </div>
                      <div>
                        <h4 className="text-base font-black font-outfit text-white uppercase italic">
                          {item.symbol}
                        </h4>
                        <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block mt-0.5">
                          {item.market || "NSE"} • {item.source || "SYSTEM"}
                        </span>
                      </div>
                    </div>

                    {/* Pricing Ledger */}
                    <div className="flex flex-wrap items-center gap-6 md:gap-12">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          Entry Price
                        </span>
                        <span className="text-sm font-bold text-neutral-300 font-mono mt-1">
                          ₹{item.entry?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          Exit Price
                        </span>
                        <span className="text-sm font-bold text-white font-mono mt-1">
                          ₹{item.highPrice?.toFixed(2) || item.entry?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-[70px]">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                          Outcome Yield
                        </span>
                        <span
                          className={`text-lg font-black font-outfit italic tracking-tight mt-0.5 ${
                            isWin ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isWin ? "+" : ""}
                          {pct.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center justify-end gap-1">
                          <Calendar size={10} />
                          Date
                        </span>
                        <span className="text-xs font-semibold text-neutral-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
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
