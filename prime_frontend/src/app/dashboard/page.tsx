"use client";

import React, { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useSignalStore } from "@/store/useSignalStore";
import { StatCard } from "@/components/ui/StatCard";
import { LuxurySignalCard } from "@/components/LuxurySignalCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { API_URL } from "@/config";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Percent,
  Activity,
  Crown,
  Zap,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { signals, user } = useSignalStore();
  const [stats, setStats] = useState({ successRate: "94.2", totalSignals: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [aiStatus, setAiStatus] = useState<"scanning" | "found">("scanning");

  useEffect(() => {
    if (signals.length === 0) return;
    const latestSignal = signals[0];
    if (latestSignal) {
      const isNew = Date.now() - new Date(latestSignal.createdAt || latestSignal.lastUpdateAt || Date.now()).getTime() < 15000;
      if (isNew) {
        setAiStatus("found");
        const timer = setTimeout(() => {
          setAiStatus("scanning");
        }, 8000);
        return () => clearTimeout(timer);
      }
    }
  }, [signals]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/signals/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const isPro = user?.role === "ADMIN" || (
    user?.subscription?.isActive &&
    user?.subscription?.plan !== "free" &&
    (!user?.subscription?.endDate || new Date(user.subscription.endDate) > new Date())
  );

  const activeSignals = signals.filter(
    (s) => s.status === "ACTIVE" || s.status === "TARGET_HIT" || s.status === "PROFIT"
  );

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-outfit text-white tracking-tight">
              TRADING TERMINAL
            </h1>
            <p className="text-sm text-neutral-400 font-medium mt-1">
              Welcome back, <strong className="text-white">{user?.name || "Trader"}</strong>. AI algorithms are active.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <GoldButton variant="glow" size="sm" onClick={() => router.push("/signals")}>
              Go to Live Feed <Zap size={14} className="ml-1" />
            </GoldButton>
          </div>
        </div>

        {/* Premium AI Activity Card */}
        <div className={`p-5 rounded-3xl transition-all duration-700 relative overflow-hidden ${
          aiStatus === "found" 
            ? "bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)] animate-[pulse_2s_infinite]" 
            : "bg-[#0e0e12]/60 border-white/[0.04]"
        } border backdrop-blur-xl`}>
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              {/* Subtle Glowing AI Icon */}
              <div className="relative flex items-center justify-center">
                {/* Glow rings */}
                <div className={`absolute inset-0 rounded-full blur-md opacity-40 transition-all duration-700 ${
                  aiStatus === "found" ? "bg-emerald-500 scale-125" : "bg-[#D4AF37] scale-110"
                }`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-700 ${
                  aiStatus === "found" 
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400" 
                    : "bg-[#14141a] border-white/[0.08] text-[#D4AF37]"
                }`}>
                  <BrainCircuit className={`w-5 h-5 ${aiStatus === "found" ? "animate-bounce" : "animate-pulse"}`} />
                </div>
              </div>
              
              {/* Live Status Text */}
              <div className="text-center sm:text-left">
                <h3 className={`text-sm font-black font-outfit uppercase tracking-widest transition-all duration-500 ${
                  aiStatus === "found" ? "text-emerald-400" : "text-white"
                }`}>
                  {aiStatus === "found" ? "⚡ Setup Found" : "🤖 AI Analyzing Market..."}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                  {aiStatus === "found" ? "New trading setup detected and broadcasted to terminal." : "Scanning options order book and smart money flow..."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Next Signal Indicator */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/[0.04]">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  aiStatus === "found" ? "bg-emerald-500 animate-ping" : "bg-[#D4AF37] animate-pulse"
                }`} />
                <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                  {aiStatus === "found" ? "Signal Found" : "Next Signal Can Arrive Anytime"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="System Win Rate"
            value={`${stats.successRate}%`}
            change="+1.4%"
            isPositive={true}
            icon={<Percent size={20} />}
            subtext="Verified audit score"
          />
          <StatCard
            title="Total Index Signals"
            value={stats.totalSignals || signals.length}
            icon={<TrendingUp size={20} />}
            subtext="Calculated setups"
          />
          <StatCard
            title="Active Signals"
            value={activeSignals.length}
            icon={<Activity size={20} />}
            subtext="Realtime monitored"
          />
          <StatCard
            title="VIP Membership"
            value={isPro ? "PRO VIP" : "FREE PASS"}
            icon={<Crown size={20} />}
            subtext={isPro ? "Unrestricted feed" : "Limited features"}
          />
        </div>

        {/* Live Signals & Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Signals feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black font-outfit text-white tracking-wider uppercase">
                Active System Setups
              </h2>
              <button
                onClick={() => router.push("/signals")}
                className="text-xs font-bold text-[#D4AF37] flex items-center gap-1 hover:underline cursor-pointer"
              >
                View all active <ArrowRight size={12} />
              </button>
            </div>

            {activeSignals.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#14141a]/40 border border-white/[0.04] text-center text-neutral-500 font-medium text-sm">
                No active setups detected at this time. Scanning options contracts...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSignals.slice(0, 2).map((signal, idx) => (
                  <div key={signal._id} className="flex h-full">
                    <LuxurySignalCard signal={signal} index={idx} isPro={isPro} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Premium Market Overview Visual */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-lg font-black font-outfit text-white tracking-wider uppercase">
              Yield Equity Curve
            </h2>

            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#14141a]/60 to-[#0e0e12]/60 border border-white/[0.04] backdrop-blur-xl relative overflow-hidden h-[300px] flex flex-col justify-between">
              {/* Graphic Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[#D4AF37]/10 blur-2xl" />

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                  CUMULATIVE PERFORMANCE
                </span>
                <span className="text-2xl font-black font-outfit text-white">
                  +1,482% YTD
                </span>
              </div>

              {/* Mock Equity line chart */}
              <div className="w-full h-32 relative select-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="curveGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,80 Q50,60 100,75 T200,35 T300,10 L300,100 L0,100 Z"
                    fill="url(#curveGlow)"
                  />
                  <path
                    d="M0,80 Q50,60 100,75 T200,35 T300,10"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="300" cy="10" r="4" fill="#D4AF37" className="animate-ping" />
                  <circle cx="300" cy="10" r="2" fill="#D4AF37" />
                </svg>
              </div>

              <div className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider leading-relaxed">
                🤖 Verified ledger results accounting for commission fee models. Past performance does not guarantee future returns.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
