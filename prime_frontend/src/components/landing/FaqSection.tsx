"use client";

import React, { useState } from "react";
import { PremiumCard } from "../ui/PremiumCard";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faq?: FaqItem[];
}

export function FaqSection({ faq }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fallback: FaqItem[] = [
    {
      question: "How does the LVX Signals Engine work?",
      answer: "The engine uses advanced proprietary algorithms to monitor live option chains, open interest (OI) changes, and high-frequency volume parameters. Once a specific strategy is confirmed (e.g., breakout momentum), a signal is pushed to the terminal in real time.",
    },
    {
      question: "What indices do you support?",
      answer: "We support NIFTY 50 and BANKNIFTY options contracts. These are the most liquid derivative indices in India, ensuring optimal entry fill and tight slippages.",
    },
    {
      question: "Do you offer auto-trading or copy-trading?",
      answer: "No. LVX is a pure market intelligence and signal feed terminal. We provide high-fidelity entry zones, stop losses, and milestones. Users must execute trades manually inside their respective brokerage terminals.",
    },
    {
      question: "Is there any trial period?",
      answer: "We offer a Free tier that lets you view all closed signals for historical validation, and see live active signals with locked (blurred) pricing parameters. Upgrading to VIP unlocks live price feeds and active tracking.",
    },
  ];

  const list = faq && faq.length > 0 ? faq : fallback;

  return (
    <section id="faq" className="py-24 px-6 relative max-w-4xl mx-auto border-t border-white/[0.04]">
      <div className="absolute bottom-12 right-12 w-48 h-48 rounded-full bg-[#D4AF37]/5 blur-[70px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          FAQ
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Frequently Answered Questions
        </h3>
      </div>

      <div className="space-y-4">
        {list.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <PremiumCard
              key={idx}
              className="p-6 transition-all duration-300 relative cursor-pointer"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              hoverGlow={true}
            >
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-base font-bold font-outfit text-white leading-relaxed">
                  {item.question}
                </h4>
                <div className="text-[#D4AF37] shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-white/[0.03] text-sm text-neutral-400 font-medium leading-relaxed">
                  {item.answer}
                </div>
              )}
            </PremiumCard>
          );
        })}
      </div>
    </section>
  );
}
export default FaqSection;
