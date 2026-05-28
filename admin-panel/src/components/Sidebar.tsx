import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, CreditCard, Radio, Cpu, Activity, 
  Bell, TrendingUp, BookOpen, Link, HeartPulse, Settings, 
  ShieldAlert, LogOut, ShieldCheck
} from 'lucide-react';
import { useAdminStore } from '../store/useAdminStore';

export const Sidebar = () => {
  const router = useRouter();
  const { activeTab, setActiveTab, adminUser, logout } = useAdminStore();

  const menuItems = [
    { id: 'dashboard', label: 'Operations Overview', icon: LayoutDashboard, path: '/' },
    { id: 'users', label: 'User Directory', icon: Users, path: '/users' },
    { id: 'subscriptions', label: 'Subscription Tiers', icon: CreditCard, path: '/subscriptions' },
    { id: 'signals', label: 'Live Option Signals', icon: Radio, path: '/signals' },
    { id: 'ai', label: 'AI Market Telemetry', icon: Cpu, path: '/ai' },
    { id: 'websocket', label: 'WebSocket Clusters', icon: Activity, path: '/websocket' },
    { id: 'notifications', label: 'Alert Center', icon: Bell, path: '/notifications' },
    { id: 'market', label: 'Index Analytics', icon: TrendingUp, path: '/market' },
    { id: 'journal', label: 'Trader Psychology', icon: BookOpen, path: '/journal' },
    { id: 'brokers', label: 'Broker Bridging', icon: Link, path: '/brokers' },
    { id: 'health', label: 'System Health', icon: HeartPulse, path: '/health' },
    { id: 'audit-logs', label: 'Admin Audit Logs', icon: ShieldAlert, path: '/audit-logs' },
    { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-80 h-screen glass-panel border-r border-white/5 flex flex-col justify-between shrink-0 select-none">
      {/* Top Branding Section */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.25)] border border-[#D4AF37]/20">
            <span className="font-black text-black text-lg">LV</span>
          </div>
          <div>
            <h1 className="font-black tracking-tight text-white leading-none text-base">LVPrimeX</h1>
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-[3px]">OPERATIONS HUB</span>
          </div>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-1.5">
        <span className="px-3 text-[8px] font-black tracking-[2.5px] text-[#4B4B52] uppercase block mb-3">
          CONTROL CONSOLE
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                router.push(item.path);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] text-white shadow-[0_0_15px_rgba(212,175,55,0.02)]' 
                  : 'text-[#71717A] hover:bg-white/[0.02] hover:text-white/80'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#D4AF37]' : 'text-[#71717A]'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white leading-tight">
                {adminUser?.name || 'Lovepreet Singh'}
              </span>
              <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">
                {adminUser?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 transition-all duration-300"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
