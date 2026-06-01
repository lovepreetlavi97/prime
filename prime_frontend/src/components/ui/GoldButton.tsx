import React from "react";

interface GoldButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "glow";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function GoldButton({
  variant = "solid",
  size = "md",
  children,
  className = "",
  ...props
}: GoldButtonProps) {
  const baseStyle =
    "relative inline-flex items-center justify-center font-semibold tracking-wide rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden cursor-pointer";
  
  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  const variantStyles = {
    solid:
      "bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#D4AF37] text-black hover:brightness-110 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.45)] border border-[#E5C158]",
    outline:
      "bg-transparent text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]",
    glow:
      "bg-[#D4AF37] text-black hover:bg-[#F6D365] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] border border-[#E5C158]",
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Golden Shine Overlay Effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shine_1.5s_ease-in-out_infinite]" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
