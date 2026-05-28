import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Users, Wallet, Zap } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
  trend?: string;
  icon: any;
  color: string;
}

export const StatsGrid: React.FC<{ stats: any }> = ({ stats }) => {
  const items: Stat[] = [
    { label: 'Active Signals', value: stats?.activeSignals || '0', trend: '+12%', icon: Zap, color: 'text-blue-500' },
    { label: 'Signals Today', value: stats?.signalsToday || '0', trend: '+5', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Users', value: stats?.totalUsers || '0', trend: '+142', icon: Users, color: 'text-purple-500' },
    { label: 'Revenue (INR)', value: `₹${stats?.revenue?.toLocaleString() || '0'}`, trend: '+₹12,400', icon: Wallet, color: 'text-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {items.map((stat, i) => (
        <Card key={i} variant="glass" className="hover:border-white/10 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">{stat.label}</span>
              <span className="text-3xl font-black text-white">{stat.value}</span>
              {stat.trend && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px] font-bold text-green-500 bg-green-500/5 px-2 py-0.5 rounded-full border border-green-500/10">
                    {stat.trend}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium">vs last month</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
