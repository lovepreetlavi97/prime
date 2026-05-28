import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  glowColor?: 'amber' | 'cyan' | 'green' | 'red';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  glowColor = 'amber',
  loading = false,
}) => {
  const iconColors = {
    amber: 'text-[#D4AF37] bg-[#D4AF37]/5 border-[#D4AF37]/10',
    cyan: 'text-[#00C2FF] bg-[#00C2FF]/5 border-[#00C2FF]/10',
    green: 'text-[#10B981] bg-[#10B981]/5 border-[#10B981]/10',
    red: 'text-[#EF4444] bg-[#EF4444]/5 border-[#EF4444]/10',
  };

  return (
    <GlassCard hasGlow={true} glowColor={glowColor} hoverable={true}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[2px] text-[#71717A]">
            {title}
          </span>
          {loading ? (
            <div className="h-8 w-24 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <h3 className="text-3xl font-black tracking-tight text-white uppercase italic">
              {value}
            </h3>
          )}
          {change && (
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black tracking-wider ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {change}
              </span>
              <span className="text-[9px] font-bold text-[#4B4B52] uppercase tracking-[1px]">vs yesterday</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl border flex items-center justify-center ${iconColors[glowColor]}`}>
          <Icon size={20} />
        </div>
      </div>
    </GlassCard>
  );
};
