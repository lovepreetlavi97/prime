import React from "react";
import { PremiumCard } from "./PremiumCard";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  subtext?: string;
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtext,
}: StatCardProps) {
  return (
    <PremiumCard className="p-6 relative group overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
            {title}
          </p>
          <h4 className="text-3xl font-bold font-outfit mt-2 tracking-tight">
            {value}
          </h4>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[#D4AF37]/80 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/35 transition-all duration-300">
            {icon}
          </div>
        )}
      </div>

      {(change || subtext) && (
        <div className="flex items-center gap-2 mt-4 text-xs">
          {change && (
            <span
              className={`font-semibold ${
                isPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isPositive ? "▲" : "▼"} {change}
            </span>
          )}
          {subtext && <span className="text-neutral-500">{subtext}</span>}
        </div>
      )}
    </PremiumCard>
  );
}
