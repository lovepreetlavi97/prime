"use client";

import React, { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { API_URL } from "@/config";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { StatCard } from "@/components/ui/StatCard";
import { Percent, TrendingUp, ShieldAlert, Compass } from "lucide-react";

interface SentimentData {
  sentiment: string;
  reasoning: string;
  confidence: number;
  pcrRatio: number;
  maxPain: number;
  expiryText: string;
  timestamp: string;
}

export default function MarketPage() {
  const [market, setMarket] = useState<"nifty" | "banknifty">("nifty");
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentiment = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/ai/sentiment?market=${market}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setData(json.data);
          }
        }
      } catch (err) {
        console.error("Error fetching AI sentiment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [market]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white tracking-tight uppercase">
              Market Intelligence
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-1">
              Live automated options chain statistics and market volume parameters bias.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-1 bg-[#14141a]/40 border border-white/[0.04] p-1.5 rounded-xl self-start">
            <button
              onClick={() => setMarket("nifty")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                market === "nifty"
                  ? "bg-[#D4AF37] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              NIFTY 50
            </button>
            <button
              onClick={() => setMarket("banknifty")}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                market === "banknifty"
                  ? "bg-[#D4AF37] text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              NIFTY BANK
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
            Compiling chain metrics...
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Core bias stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="AI Direction Bias"
                value={data.sentiment}
                icon={<Compass size={20} />}
                subtext="Index momentum state"
              />
              <StatCard
                title="Bias Confidence"
                value={`${data.confidence}%`}
                icon={<Percent size={20} />}
                subtext="Chain probability rating"
              />
              <StatCard
                title="PCR Ratio"
                value={data.pcrRatio}
                icon={<TrendingUp size={20} />}
                subtext={data.pcrRatio > 1 ? "Bullish trend bias" : "Bearish resistance"}
              />
              <StatCard
                title="Index Max Pain"
                value={data.maxPain}
                icon={<ShieldAlert size={20} />}
                subtext="Derivatives expiry magnet"
              />
            </div>

            {/* Analysis card */}
            <PremiumCard className="p-8 md:p-10">
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[10px] font-mono text-[#D4AF37] tracking-[2px] uppercase block mb-1">
                    MODEL RATIONALE
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold font-outfit text-white leading-snug">
                    "{data.reasoning}"
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">
                      Target Timeframe
                    </span>
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                      {data.expiryText}
                    </span>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider block">
                      Last Update
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {new Date(data.timestamp).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </PremiumCard>
          </div>
        ) : (
          <div className="p-12 text-center text-neutral-500 text-sm">
            Failed to parse market intelligence stats. Try reloading the window.
          </div>
        )}
      </div>
    </AppShell>
  );
}
