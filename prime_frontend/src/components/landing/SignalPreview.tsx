"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { LuxurySignalCard } from "../LuxurySignalCard";
import { GoldButton } from "../ui/GoldButton";
import Link from "next/link";

export function SignalPreview() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch(`${API_URL}/signals`);
        if (res.ok) {
          const json = await res.json();
          // Filter only active/live ones for preview
          const activeSignals = (json || []).filter(
            (s: any) => s.status === "ACTIVE" || s.status === "LIVE"
          );
          setSignals(activeSignals.slice(0, 2));
        }
      } catch (err) {
        console.error("Error fetching preview signals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
    // Poll every 10 seconds for previews
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, []);

  // Mock signals if backend doesn't return any active signals
  const fallbackSignals = [
    {
      _id: "mock_1",
      symbol: "NIFTY 24200 CE",
      market: "NSE",
      strike: "24200",
      optionType: "CE",
      timeframe: "5M",
      confidenceScore: 92,
      entry: 145,
      currentPrice: 145,
      highPrice: 145,
      sl: 110,
      targets: [165, 185, 210],
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 mins ago
      isLocked: true,
    },
    {
      _id: "mock_2",
      symbol: "BANKNIFTY 48800 PE",
      market: "NSE",
      strike: "48800",
      optionType: "PE",
      timeframe: "15M",
      confidenceScore: 88,
      entry: 320,
      currentPrice: 320,
      highPrice: 320,
      sl: 260,
      targets: [370, 420, 480],
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
      isLocked: true,
    },
  ];

  const displaySignals = signals.length > 0 ? signals : fallbackSignals;

  return (
    <section id="live-signals" className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      {/* Background decorations */}
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-[#D4AF37]/5 blur-[90px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Institutional Option Feed
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Active Live Signals Preview
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Experience low-latency execution setups. Realtime tracking algorithms show you exact target accomplishments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
        {displaySignals.map((signal, idx) => (
          <div key={signal._id} className="flex h-full">
            <LuxurySignalCard
              signal={signal}
              index={idx}
              isPro={false}
              lockedMessage="Upgrade to Premium to unlock live tracking parameters"
            />
          </div>
        ))}
      </div>

      <div className="text-center mt-16 flex flex-col items-center">
        <p className="text-xs font-medium text-neutral-500 max-w-sm mb-6 leading-relaxed">
          Pro members gain access to the raw live websocket feed, push notifications, and detailed target levels.
        </p>
        <Link href="/login?signup=true">
          <GoldButton variant="glow" size="md">
            Unlock Full Realtime Feed
          </GoldButton>
        </Link>
      </div>
    </section>
  );
}
export default SignalPreview;
