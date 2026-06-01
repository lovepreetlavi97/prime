"use client";

import React, { useEffect, useState } from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { API_URL } from "@/config";

interface SentimentData {
  sentiment: string;
  reasoning: string;
  confidence: number;
  pcrRatio: number;
  maxPain: number;
  expiryText: string;
  timestamp: string;
}

export function IntelligenceStatus() {
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
    <section id="market-intelligence" className="py-24 px-6 relative max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          AI Intelligence
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Realtime Market Sentiment
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Our models constantly parse live option chain, volume metrics, and order flows to generate institutional-grade bias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Toggle Panel */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <button
            onClick={() => setMarket("nifty")}
            className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              market === "nifty"
                ? "bg-[#D4AF37]/5 border-[#D4AF37]/45 text-white"
                : "bg-[#14141a]/40 border-white/[0.04] text-neutral-400 hover:text-white hover:border-white/10"
            }`}
          >
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase block mb-1">
                INDEX BIAS
              </span>
              <h4 className="text-xl font-bold font-outfit">NIFTY 50</h4>
              <p className="text-xs text-neutral-400 mt-2 font-medium">
                Option chain scanner and index volume indicators.
              </p>
            </div>
            {market === "nifty" && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setMarket("banknifty")}
            className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
              market === "banknifty"
                ? "bg-[#D4AF37]/5 border-[#D4AF37]/45 text-white"
                : "bg-[#14141a]/40 border-white/[0.04] text-neutral-400 hover:text-white hover:border-white/10"
            }`}
          >
            <div className="relative z-10">
              <span className="text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase block mb-1">
                INDEX BIAS
              </span>
              <h4 className="text-xl font-bold font-outfit">NIFTY BANK</h4>
              <p className="text-xs text-neutral-400 mt-2 font-medium">
                High-beta banking component tracking models.
              </p>
            </div>
            {market === "banknifty" && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            )}
          </button>
        </div>

        {/* Intelligence Card Display */}
        <div className="lg:col-span-2">
          <PremiumCard className="p-8 md:p-10 min-h-[320px] flex flex-col justify-between">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-t-[#D4AF37] border-white/5 animate-spin" />
                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                  Parsing chain data...
                </span>
              </div>
            ) : data ? (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.04] pb-6 mb-6">
                  <div>
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                      CURRENT BIAS
                    </span>
                    <span
                      className={`text-2xl font-black font-outfit tracking-wider uppercase px-4 py-1 rounded-full border ${
                        data.sentiment === "BULLISH"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : data.sentiment === "BEARISH"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {data.sentiment}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider block mb-1 text-right">
                      CONFIDENCE SCORE
                    </span>
                    <span className="text-3xl font-black font-outfit text-white block text-right">
                      {data.confidence}%
                    </span>
                  </div>
                </div>

                <div className="mb-8">
                  <span className="text-xs font-mono text-[#D4AF37] uppercase tracking-wider block mb-2">
                    AI RATIONALE
                  </span>
                  <p className="text-base text-neutral-200 leading-relaxed font-medium">
                    "{data.reasoning}"
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                      PCR RATIO
                    </span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {data.pcrRatio}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                      MAX PAIN
                    </span>
                    <span className="text-lg font-bold text-white mt-1 block">
                      {data.maxPain}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                      TIMEFRAME
                    </span>
                    <span className="text-xs font-bold text-[#D4AF37] mt-1.5 block uppercase tracking-wider">
                      {data.expiryText}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-16 text-neutral-500 text-xs">
                No sentiment data available.
              </div>
            )}
          </PremiumCard>
        </div>
      </div>
    </section>
  );
}
export default IntelligenceStatus;
