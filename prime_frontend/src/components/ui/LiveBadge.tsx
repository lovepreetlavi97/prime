import React from "react";

interface LiveBadgeProps {
  label?: string;
  variant?: "success" | "danger" | "warning" | "gold";
}

export function LiveBadge({ label = "LIVE", variant = "gold" }: LiveBadgeProps) {
  const colorMap = {
    success: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      ping: "bg-emerald-500",
    },
    danger: {
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      border: "border-rose-500/20",
      ping: "bg-rose-500",
    },
    warning: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      ping: "bg-amber-500",
    },
    gold: {
      bg: "bg-[#D4AF37]/10",
      text: "text-[#D4AF37]",
      border: "border-[#D4AF37]/20",
      ping: "bg-[#D4AF37]",
    },
  };

  const current = colorMap[variant] || colorMap.gold;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.ping}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.ping}`} />
      </span>
      {label}
    </span>
  );
}
