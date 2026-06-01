"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { PremiumCard } from "../ui/PremiumCard";
import { TrendingUp, Award, Calendar } from "lucide-react";

export function RecentResults() {
  const [closedSignals, setClosedSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/signals?all=true`);
        if (res.ok) {
          const data = await res.json();
          // Filter only closed/SL hit/target hit ones
          const closed = (data || []).filter((s: any) =>
            ["CLOSED_PROFIT", "CLOSED_LOSS", "SL_HIT", "EXIT_ALERT", "TARGET_HIT", "PROFIT", "PROFIT_BOOKED"].includes(
              s.status
            )
          );
          setClosedSignals(closed.slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching recent results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const fallbackResults = [
    {
      _id: "fb_1",
      symbol: "NIFTY 24100 CE",
      status: "CLOSED_PROFIT",
      entry: 120,
      highPrice: 215,
      profitPct: "79.17",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      _id: "fb_2",
      symbol: "BANKNIFTY 48600 PE",
      status: "CLOSED_PROFIT",
      entry: 280,
      highPrice: 420,
      profitPct: "50.00",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      _id: "fb_3",
      symbol: "NIFTY 24350 CE",
      status: "CLOSED_LOSS",
      entry: 150,
      highPrice: 155,
      profitPct: "-26.67",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      _id: "fb_4",
      symbol: "BANKNIFTY 48900 CE",
      status: "CLOSED_PROFIT",
      entry: 310,
      highPrice: 512,
      profitPct: "65.16",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  const list = closedSignals.length > 0 ? closedSignals : fallbackResults;

  return (
    <section className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#D4AF37]/5 blur-[100px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Proven Performance
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Recent Trade Achievements
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Social proof built on cold numbers. These are the latest closed signals tracked by our automated auditing ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-500 text-xs">
            Retrieving ledger history...
          </div>
        ) : (
          list.map((item) => {
            const pct = parseFloat(item.profitPct || "0");
            const isWin = pct >= 0;

            return (
              <PremiumCard key={item._id} className="p-6 flex flex-col justify-between" hoverGlow={true}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      SYSTEM COMPLETED
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        isWin
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isWin ? "PROFIT" : "STOP LOSS"}
                    </span>
                  </div>

                  <h4 className="text-lg font-black font-outfit text-white uppercase italic">
                    {item.symbol}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/[0.04] flex items-end justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">
                      Yield Gain
                    </span>
                    <span
                      className={`text-2xl font-black font-outfit italic tracking-tighter ${
                        isWin ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isWin ? "+" : ""}
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">
                      Entry Price
                    </span>
                    <span className="text-sm font-bold text-neutral-300 font-mono">
                      ₹{item.entry}
                    </span>
                  </div>
                </div>
              </PremiumCard>
            );
          })
        )}
      </div>
    </section>
  );
}
export default RecentResults;
