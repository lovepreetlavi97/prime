"use client";

import React, { useEffect, useState } from "react";
import { useSignalStore } from "@/store/useSignalStore";
import { API_URL } from "@/config";

interface TickerItem {
  symbol: string;
  name: string;
  value: number | string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export function LiveTickerStrip() {
  const storePrices = useSignalStore((state) => state.marketPrices);
  const isConnected = useSignalStore((state) => state.isConnected);
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({});

  // Fetch initial prices if socket not connected
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(`${API_URL}/market/prices`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.prices) {
            setLocalPrices(json.data.prices);
          }
        }
      } catch (err) {
        console.error("Error fetching ticker prices:", err);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatVal = (symbol: string, defaultVal: number) => {
    // If store has it, use it
    if (storePrices[symbol]?.val) return storePrices[symbol].val;
    // Else check localPrices
    if (localPrices[symbol]) return localPrices[symbol];
    return defaultVal;
  };

  const getTrend = (symbol: string): "up" | "down" | "neutral" => {
    if (storePrices[symbol]?.trend) return storePrices[symbol].trend;
    return "neutral";
  };

  const items: TickerItem[] = [
    { name: "NIFTY 50", symbol: "NIFTY 50", value: formatVal("NIFTY 50", 22453.8), trend: getTrend("NIFTY 50") },
    { name: "NIFTY BANK", symbol: "BANKNIFTY", value: formatVal("BANKNIFTY", 48115.5), trend: getTrend("BANKNIFTY") },
    { name: "INDIA VIX", symbol: "INDIA VIX", value: formatVal("INDIA VIX", 12.85), trend: getTrend("INDIA VIX") },
    { name: "SENSEX", symbol: "SENSEX", value: formatVal("SENSEX", 73895.5), trend: getTrend("SENSEX") },
    { name: "USD-INR", symbol: "USD-INR", value: formatVal("USD-INR", 83.42), trend: getTrend("USD-INR") },
  ];

  return (
    <div className="w-full bg-[#0E0E12] border-y border-white/[0.04] py-2.5 overflow-hidden select-none">
      <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
        {/* Double items for continuous infinite scroll */}
        {[...items, ...items, ...items].map((item, idx) => {
          const valNum = typeof item.value === "number" ? item.value : parseFloat(item.value);
          const formattedValue = valNum ? valNum.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) : "--";

          return (
            <div
              key={idx}
              className="inline-flex items-center gap-2 mx-8 text-xs font-mono"
            >
              <span className="font-bold text-neutral-400 tracking-wider">
                {item.name}
              </span>
              <span
                className={`font-black tracking-tight transition-colors duration-300 ${
                  item.trend === "up"
                    ? "text-emerald-400"
                    : item.trend === "down"
                    ? "text-rose-400"
                    : "text-white"
                }`}
              >
                {formattedValue}
              </span>
              <span
                className={`text-[10px] ${
                  item.trend === "up"
                    ? "text-emerald-500"
                    : item.trend === "down"
                    ? "text-rose-500"
                    : "text-neutral-500"
                }`}
              >
                {item.trend === "up" ? "▲" : item.trend === "down" ? "▼" : "•"}
              </span>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.3333%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
export default LiveTickerStrip;
