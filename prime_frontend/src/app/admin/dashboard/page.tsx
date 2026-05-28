'use client';

import React from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Users,
  Crown,
  IndianRupee,
  Calendar,
  Clock,
  ArrowRightLeft,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { StatCard, StatCardProps } from '@/components/admin/StatCard';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function DashboardPage() {
  const stats: StatCardProps[] = [
    { title: 'Active Signals', value: 12, icon: Zap, color: 'amber', trend: { value: 8, isUp: true } },
    { title: 'Closed Profit Today', value: '₹4,250', icon: CheckCircle2, color: 'emerald', trend: { value: 12, isUp: true } },
    { title: 'Exit/SL Today', value: 2, icon: XCircle, color: 'rose', trend: { value: 5, isUp: false } },
    { title: 'Total Users', value: '1,280', icon: Users, color: 'indigo', trend: { value: 3, isUp: true } },
    { title: 'Premium Users', value: 450, icon: Crown, color: 'blue', trend: { value: 15, isUp: true } },
    { title: 'Revenue Today', value: '₹22,400', icon: IndianRupee, color: 'emerald', trend: { value: 24, isUp: true } },
    { title: 'Revenue This Month', value: '₹6,84,000', icon: Calendar, color: 'indigo', trend: { value: 18, isUp: true } },
    { title: 'Pending Payments', value: 14, icon: Clock, color: 'amber', trend: { value: 2, isUp: false } },
    { title: 'Successful Txns', value: 182, icon: ArrowRightLeft, color: 'blue', trend: { value: 7, isUp: true } },
  ];

  return (
    <div className="space-y-8 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight italic">Operational <span className="text-[#D4AF37]">Overview</span></h1>
          <p className="text-[#A1A1AA] text-sm">Real-time performance and system health telemetry.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white/5 px-4 py-2 border border-white/5 rounded-xl text-xs font-black uppercase tracking-wider text-[#A1A1AA] hover:bg-white/10 hover:text-white transition-all">
            Download Report
          </button>
          <button className="bg-[#D4AF37] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-2xl bg-[#14141A] border border-white/5 hover:border-[#D4AF37]/35 transition-all shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">{stat.title}</span>
              <stat.icon size={20} className={cn(
                stat.color === 'emerald' ? 'text-emerald-500' :
                stat.color === 'rose' ? 'text-rose-500' :
                stat.color === 'indigo' ? 'text-indigo-400' :
                stat.color === 'blue' ? 'text-blue-400' : 'text-amber-500'
              )} />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black">{stat.value}</span>
              {stat.trend && (
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-md",
                  stat.trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {stat.trend.isUp ? '+' : '-'}{stat.trend.value}%
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Revenue Chart */}
        <div className="bg-[#14141A] p-6 rounded-2xl border border-white/5 shadow-xl min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Revenue Analytics</h3>
            <select className="bg-[#0B0B0F] border border-white/5 text-xs font-bold text-amber-500 rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
            <div className="text-center">
              <TrendingUp className="mx-auto text-white/10 mb-2" size={48} />
              <p className="text-[#A1A1AA] text-sm font-medium">Graph visualization placeholder</p>
            </div>
          </div>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="bg-[#14141A] p-6 rounded-2xl border border-white/5 shadow-xl min-h-[400px] flex flex-col">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-6">Recent Alerts</h3>
          <div className="space-y-4">
            {[
              { type: 'failed', msg: 'Payment failed for user @lavis_trader', time: '2 mins ago' },
              { type: 'success', msg: 'New Institutional subscription: @alpha_fund', time: '15 mins ago' },
              { type: 'warning', msg: 'High value transaction detected: ₹49,999', time: '1 hour ago' },
              { type: 'info', msg: 'Signal "NIFTY 22400 CE" hit Target 3!', time: '2 hours ago' },
            ].map((alert, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                <div className={cn(
                  "w-2 h-2 mt-1.5 rounded-full",
                  alert.type === 'failed' ? 'bg-rose-500' :
                    alert.type === 'success' ? 'bg-emerald-500' :
                      alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                )} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{alert.msg}</p>
                  <p className="text-[10px] text-[#A1A1AA] font-medium">{alert.time}</p>
                </div>
                <ArrowUpRight size={14} className="text-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
