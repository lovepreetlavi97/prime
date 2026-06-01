"use client";

import React from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { Zap, Shield, Bell, BarChart2 } from "lucide-react";

export function WhyPrimeTrade() {
  const features = [
    {
      icon: <Zap className="text-[#D4AF37]" size={24} />,
      title: "Realtime WebSocket Engine",
      description: "No delay. No lagging. Sockets update price feeds and targets inside your terminal at millisecond speeds.",
    },
    {
      icon: <BarChart2 className="text-[#D4AF37]" size={24} />,
      title: "Option Chain Intelligence",
      description: "Our models parse active option volume spikes and open interest changes to deliver clear, actionable biases.",
    },
    {
      icon: <Shield className="text-[#D4AF37]" size={24} />,
      title: "Risk-First Architecture",
      description: "Every setup includes an mathematically sound stop loss. Protect your trading capital with structured exits.",
    },
    {
      icon: <Bell className="text-[#D4AF37]" size={24} />,
      title: "Telegram & Webhook Push",
      description: "Receive instant notifications on your device the moment a signal is triggered or target level is reached.",
    },
  ];

  return (
    <section className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Platform Advantages
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Engineered For Serious Traders
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Ditch the emotional guesswork. Leverage institutional-grade tools built on advanced technology and logic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feat, idx) => (
          <PremiumCard key={idx} className="p-8 flex flex-col justify-between" hoverGlow={true}>
            <div>
              <div className="p-3 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 w-fit mb-6 text-[#D4AF37]">
                {feat.icon}
              </div>
              <h4 className="text-lg font-bold font-outfit text-white mb-3">
                {feat.title}
              </h4>
              <p className="text-sm text-neutral-400 font-medium leading-relaxed">
                {feat.description}
              </p>
            </div>
          </PremiumCard>
        ))}
      </div>
    </section>
  );
}
export default WhyPrimeTrade;
