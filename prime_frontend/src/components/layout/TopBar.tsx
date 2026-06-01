"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSignalStore } from "@/store/useSignalStore";
import { PrimeLogo } from "../PrimeLogo";
import { Bell, Wifi, WifiOff } from "lucide-react";

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const marketPrices = useSignalStore((state) => state.marketPrices);
  const isConnected = useSignalStore((state) => state.isConnected);
  const lastHeartbeat = useSignalStore((state) => state.lastHeartbeat);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const checkStaleness = () => {
      if (!lastHeartbeat) return;
      setIsStale(Date.now() - lastHeartbeat > 15000);
    };
    const interval = setInterval(checkStaleness, 5000);
    return () => clearInterval(interval);
  }, [lastHeartbeat]);

  const formatPrice = (price?: number) => {
    return price
      ? price.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "--";
  };

  const getTickClass = (trend?: "up" | "down" | "neutral") => {
    if (trend === "up") return "text-emerald-400";
    if (trend === "down") return "text-rose-400";
    return "text-white";
  };

  return (
    <header className="h-16 bg-[#08080C]/90 backdrop-blur-md border-b border-white/[0.04] flex items-center justify-between px-6 sticky top-0 z-30 select-none">
      {/* Brand Identity / Left */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
          <PrimeLogo size={32} />
          <span className="text-sm font-black tracking-widest text-[#D4AF37] uppercase">
            LVX
          </span>
        </Link>

        {/* Desktop Ticker Info */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 border-r border-white/5 pr-6">
            <span className="text-neutral-500 font-bold">NIFTY 50</span>
            <span className={`font-black ${getTickClass(marketPrices["NIFTY 50"]?.trend)}`}>
              {formatPrice(marketPrices["NIFTY 50"]?.val)}
            </span>
          </div>
          <div className="flex items-center gap-2 border-r border-white/5 pr-6">
            <span className="text-neutral-500 font-bold">BANKNIFTY</span>
            <span className={`font-black ${getTickClass(marketPrices["BANKNIFTY"]?.trend)}`}>
              {formatPrice(marketPrices["BANKNIFTY"]?.val)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-bold">INDIA VIX</span>
            <span className={`font-black ${getTickClass(marketPrices["INDIA VIX"]?.trend)}`}>
              {formatPrice(marketPrices["INDIA VIX"]?.val)}
            </span>
          </div>
        </div>
      </div>

      {/* Connectivity & Actions / Right */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Mobile quick price strip (only Nifty for screen space) */}
        <div className="md:hidden flex items-center gap-1.5 text-[10px] font-mono border border-white/5 bg-white/[0.02] px-2.5 py-1 rounded-lg">
          <span className="text-neutral-500 font-bold">NIFTY</span>
          <span className={`font-black ${getTickClass(marketPrices["NIFTY 50"]?.trend)}`}>
            {formatPrice(marketPrices["NIFTY 50"]?.val)}
          </span>
        </div>

        {/* Notifications Button */}
        <button
          onClick={() => router.push("/notifications")}
          className={`relative p-2 rounded-full border border-white/5 hover:bg-white/5 transition-all text-neutral-400 hover:text-white cursor-pointer ${
            pathname === "/notifications" ? "text-[#D4AF37] border-[#D4AF37]/20" : ""
          }`}
        >
          <Bell size={16} />
        </button>

        {/* Sockets Connection Status */}
        <div
          title={
            !isConnected
              ? "Disconnected from sockets feed"
              : isStale
              ? "Data latency warning"
              : "WebSocket realtime feed active"
          }
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
            !isConnected
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : isStale
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            {isConnected && !isStale && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                !isConnected
                  ? "bg-rose-500"
                  : isStale
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="hidden sm:inline">
            {!isConnected ? "Feed Off" : isStale ? "Stale Data" : "Live Stream"}
          </span>
        </div>
      </div>
    </header>
  );
}
export default TopBar;
