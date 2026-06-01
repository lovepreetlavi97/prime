import React from "react";

export function LoadingOrb({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-t border-b border-[#D4AF37] animate-spin" />
        {/* Inner reverse-spinning ring */}
        <div className="absolute w-12 h-12 rounded-full border-l border-r border-[#D4AF37]/40 animate-[spin_1.5s_linear_infinite_reverse]" />
        {/* Center glowing orb */}
        <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F6D365] blur-[2px] animate-pulse" />
      </div>
      <p className="text-[11px] font-bold tracking-[0.2em] text-[#D4AF37]/70 uppercase animate-pulse">
        Securing connection...
      </p>
    </div>
  );
}
