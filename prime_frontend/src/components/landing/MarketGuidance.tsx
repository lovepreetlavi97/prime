"use client";

import React from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { ShieldCheck, Compass, CheckCircle2 } from "lucide-react";

interface MarketGuidanceProps {
  guidance?: string[];
  trustText?: string;
}

export function MarketGuidance({ guidance, trustText }: MarketGuidanceProps) {
  const defaultGuidance = [
    "Wait for the entry zone",
    "Do not chase price after breakout",
    "Always respect stop loss",
    "Book profits step by step",
    "Skip trades that don’t meet conditions",
  ];

  const defaultTrust =
    "Not every trade wins.\n\nBut a structured approach wins over time.\n\nNo random calls. No guesswork. Only disciplined setups.";

  const items = guidance && guidance.length > 0 ? guidance : defaultGuidance;
  const trust = trustText || defaultTrust;

  return (
    <section id="guidance" className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      <div className="absolute bottom-12 left-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Our Methodology
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Rule-Based Execution
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Professional trading is not about predicting the future. It is about executing high-probability setups consistently.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        {/* Left Column: Guidance list */}
        <PremiumCard className="p-8 md:p-10 flex flex-col justify-between" borderGold={true}>
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37]">
                <Compass size={20} />
              </div>
              <h4 className="text-xl font-bold font-outfit text-white">
                Execution Guidelines
              </h4>
            </div>

            <ul className="space-y-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                  <span className="text-sm font-semibold text-neutral-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.04] text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
            LVX / Operational Standards
          </div>
        </PremiumCard>

        {/* Right Column: Trust Statement */}
        <PremiumCard className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <h4 className="text-xl font-bold font-outfit text-white">
                The Trust Mandate
              </h4>
            </div>

            <p className="text-sm md:text-base text-neutral-300 font-medium leading-relaxed whitespace-pre-line">
              {trust}
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <p className="text-[11px] font-semibold text-neutral-400 leading-normal">
              💡 <strong className="text-white">Risk Advisory:</strong> Derivative options trading involves substantial risk of capital loss. Never trade with money you cannot afford to lose.
            </p>
          </div>
        </PremiumCard>
      </div>
    </section>
  );
}
export default MarketGuidance;
