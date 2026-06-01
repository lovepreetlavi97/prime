"use client";

import React from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { Quote } from "lucide-react";

interface TestimonialsProps {
  testimonials?: Array<{
    name: string;
    role: string;
    text: string;
  }>;
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const fallback = [
    {
      name: "Rohan Sharma",
      role: "Full-Time Options Scalper",
      text: "LVX has completely changed my entry discipline. The Nifty option alerts are incredibly accurate. The realtime WebSocket updates saved me from late entries.",
    },
    {
      name: "Pooja Patel",
      role: "Swing Trader",
      text: "The institutional bias scoring and clear target milestones make trading so much less emotional. I know exactly where the stop loss is and when the system secures profit.",
    },
    {
      name: "Amit Verma",
      role: "Hedge Fund Analyst",
      text: "A truly premium terminal. The UI/UX is outstanding, and the raw speed of option strike alerts beats every Telegram channel or manual advisor out there.",
    },
  ];

  const list = testimonials && testimonials.length > 0 ? testimonials : fallback;

  return (
    <section className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-[#D4AF37]/5 blur-[90px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Endorsements
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Trusted By High-Yield Traders
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Read what dedicated retail and institutional index option traders say about our platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {list.map((item, idx) => (
          <PremiumCard key={idx} className="p-8 flex flex-col justify-between" hoverGlow={true}>
            <div>
              <Quote className="text-[#D4AF37]/20 mb-6" size={32} />
              <p className="text-sm text-neutral-300 font-medium leading-relaxed italic mb-8">
                "{item.text}"
              </p>
            </div>

            <div className="flex flex-col border-t border-white/[0.04] pt-4">
              <span className="text-sm font-bold text-white font-outfit">
                {item.name}
              </span>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider mt-0.5">
                {item.role}
              </span>
            </div>
          </PremiumCard>
        ))}
      </div>
    </section>
  );
}
export default Testimonials;
