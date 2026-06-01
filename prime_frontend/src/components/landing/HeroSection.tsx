"use client";

import React from "react";
import { motion } from "framer-motion";
import { GoldButton } from "../ui/GoldButton";
import { useRouter } from "next/navigation";

interface HeroSectionProps {
  heroData?: {
    headline: string;
    subtext: string;
    cta: string;
  };
  anticipation?: string;
  lastSignal?: string;
}

export function HeroSection({ heroData, anticipation, lastSignal }: HeroSectionProps) {
  const router = useRouter();

  const headline = heroData?.headline || "You’ve seen trades work… just not when you took them.";
  const subtext = heroData?.subtext || "Entered late. Exited early. Or skipped the right one.\n\nThis removes that confusion.\n\nClear signals. Clear entry. Clear exit.";
  const cta = heroData?.cta || "Unlock Live Options Feed";

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
      {/* Premium Ambient Background Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Animated Badge */}
        {anticipation && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-8 shadow-[0_0_15px_rgba(212,175,55,0.05)] animate-pulse">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]" />
            </span>
            {anticipation}
          </div>
        )}

        {/* Golden Headline */}
        <h1 className="text-4xl md:text-6xl font-black font-outfit leading-tight tracking-tight text-white mb-6">
          <span className="gold-gradient-text block">
            {headline.split("…")[0]}
          </span>
          {headline.split("…")[1] && (
            <span className="text-white text-3xl md:text-5xl font-light block mt-2 opacity-90">
              {headline.split("…")[1]}
            </span>
          )}
        </h1>

        {/* Subtext with line breaks preserved */}
        <p className="text-sm md:text-lg text-neutral-400 max-w-2xl whitespace-pre-line leading-relaxed mb-10 font-medium font-inter">
          {subtext}
        </p>

        {/* CTA Button and secondary links */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <GoldButton variant="solid" size="lg" onClick={() => router.push("/login?signup=true")}>
            {cta}
          </GoldButton>
          <button
            onClick={() => {
              const el = document.getElementById("live-signals");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-full text-sm font-semibold tracking-wider text-neutral-400 hover:text-white border border-white/5 hover:border-white/20 transition-all hover:bg-white/[0.02] cursor-pointer"
          >
            Explore Live Signals
          </button>
        </div>

        {/* Last Signal stats info */}
        {lastSignal && (
          <div className="mt-12 p-4 rounded-2xl bg-[#14141a]/40 border border-white/[0.04] backdrop-blur-md max-w-md">
            <span className="text-xs font-mono text-[#D4AF37] tracking-wider block mb-1">
              REALTIME ENGINE METRICS
            </span>
            <p className="text-xs font-bold text-white tracking-wide">
              {lastSignal}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
export default HeroSection;
