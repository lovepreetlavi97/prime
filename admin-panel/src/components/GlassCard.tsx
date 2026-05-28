import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  onClick?: () => void;
  hasGlow?: boolean;
  glowColor?: 'amber' | 'cyan' | 'green' | 'red';
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  title,
  className = '',
  onClick,
  hasGlow = false,
  glowColor = 'amber',
  hoverable = false,
}) => {
  const glowStyles = {
    amber: 'shadow-[0_0_20px_rgba(212,175,55,0.08)] border-[#D4AF37]/10',
    cyan: 'shadow-[0_0_20px_rgba(0,194,255,0.08)] border-[#00C2FF]/10',
    green: 'shadow-[0_0_20px_rgba(16,185,129,0.08)] border-[#10B981]/10',
    red: 'shadow-[0_0_20px_rgba(239,68,68,0.08)] border-[#EF4444]/10',
  };

  return (
    <div
      onClick={onClick}
      className={`
        glass-panel 
        rounded-[24px] 
        p-6 
        transition-all 
        duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${hasGlow ? glowStyles[glowColor] : 'border-white/[0.03]'}
        ${hoverable ? 'hover:scale-[1.01] hover:border-white/10 hover:bg-white/[0.04]' : ''}
        ${className}
      `}
    >
      {title && (
        <span className="text-[10px] font-black uppercase tracking-[2px] text-[#71717A] block mb-4">
          {title}
        </span>
      )}
      {children}
    </div>
  );
};
