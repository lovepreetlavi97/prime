import React from "react";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  hoverGlow?: boolean;
  borderGold?: boolean;
}

export function PremiumCard({
  children,
  glow = false,
  hoverGlow = true,
  borderGold = false,
  className = "",
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-b from-[#14141a]/60 to-[#0e0e12]/60
        backdrop-blur-xl
        border ${borderGold ? "border-[#D4AF37]/35" : "border-white/[0.04]"}
        transition-all duration-500 ease-out
        ${glow ? "shadow-[0_0_35px_rgba(212,175,55,0.08)]" : ""}
        ${hoverGlow ? "hover:border-[#D4AF37]/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.12)] hover:bg-[#14141a]/85" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Absolute Ambient Glow Spot */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
