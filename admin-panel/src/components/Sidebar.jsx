import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, CreditCard, Radio, Cpu, Activity, 
  Bell, TrendingUp, BookOpen, Link, HeartPulse, Settings, 
  ShieldAlert, LogOut, ShieldCheck, Mail, Ticket, ThumbsUp, Percent, UserCheck
} from 'lucide-react';
import { setActiveTab, logout } from '../store/slices/adminSlice';

export const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.admin.activeTab);
  const adminUser = useSelector((state) => state.admin.adminUser);

  const groups = [
    {
      label: 'CORE CONTROL',
      items: [
        { id: 'dashboard', label: 'Operations Overview', icon: LayoutDashboard, path: '/' },
        { id: 'signals', label: 'Live Option Signals', icon: Radio, path: '/signals' },
        { id: 'signal-analytics', label: 'Signal Analytics', icon: TrendingUp, path: '/signal-analytics' },
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'users', label: 'User Directory', icon: Users, path: '/users' },
        { id: 'subscribers', label: 'Subscribers List', icon: UserCheck, path: '/subscribers' },
        { id: 'subscriptions', label: 'Subscription Tiers', icon: CreditCard, path: '/subscriptions' },
        { id: 'transactions', label: 'Transactions', icon: BookOpen, path: '/transactions' },
      ]
    },
    {
      label: 'MARKET HUB',
      items: [
        { id: 'brokers', label: 'Broker Bridging', icon: Link, path: '/brokers' },
      ]
    },
    {
      label: 'COMMUNICATION',
      items: [
        { id: 'notifications', label: 'Alert Center', icon: Bell, path: '/notifications' },
        { id: 'contacts', label: 'Support submissions', icon: Mail, path: '/contacts' },
        { id: 'reviews', label: 'Testimonials / Reviews', icon: ThumbsUp, path: '/reviews' },
        { id: 'coupons', label: 'Coupons / Discounts', icon: Percent, path: '/coupons' },
      ]
    },
    {
      label: 'SYSTEM SECURE',
      items: [
        { id: 'health', label: 'System Health', icon: HeartPulse, path: '/health' },
        { id: 'admins', label: 'Admin Management', icon: ShieldCheck, path: '/admins' },
        { id: 'audit-logs', label: 'Admin Audit Logs', icon: ShieldAlert, path: '/audit-logs' },
        { id: 'settings', label: 'System Settings', icon: Settings, path: '/settings' },
      ]
    }
  ];

  return (
    <aside className="w-80 h-screen bg-[#060812]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col justify-between shrink-0 select-none relative z-40 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
      {/* Top Branding Section */}
      <div className="p-6 border-b border-white/5 relative">
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[#D4AF37]/35 transform hover:rotate-6 transition-all duration-300">
            <span className="font-black text-black text-xl italic tracking-tighter">LV</span>
          </div>
          <div>
            <h1 className="font-black tracking-widest text-white leading-none text-lg italic">
              LV<span className="text-[#D4AF37]">X</span>
            </h1>
            <span className="text-[7.5px] font-black text-[#D4AF37] uppercase tracking-[4px] block mt-1">
              OPERATIONS HUB
            </span>
          </div>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <span className="px-3 text-[8px] font-black tracking-[3px] text-[#4B4B52] uppercase block mb-2.5">
              {group.label}
            </span>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      dispatch(setActiveTab(item.id));
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 relative group cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#D4AF37]/15 to-transparent border-l-2 border-[#D4AF37] text-white shadow-[0_0_25px_rgba(212,175,55,0.05)]' 
                        : 'text-[#5A5E70] hover:bg-white/[0.02] hover:text-white/90 hover:border-l hover:border-white/20'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D4AF37] blur-[2px]" />
                    )}
                    <Icon 
                      size={14} 
                      className={`transition-all duration-300 group-hover:scale-110 ${
                        isActive ? 'text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'text-[#5A5E70] group-hover:text-white'
                      }`} 
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Profile / Logout Footer */}
      <div className="p-5 border-t border-white/5 bg-[#04060E]/50">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.1)]">
              <ShieldCheck size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white leading-tight tracking-wider">
                {adminUser?.name || 'Lovepreet Singh'}
              </span>
              <span className="text-[7.5px] font-black text-[#D4AF37] uppercase tracking-widest leading-none mt-1">
                {adminUser?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              dispatch(logout());
              navigate('/login');
            }}
            className="p-2.5 rounded-xl text-[#5A5E70] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 transition-all duration-300 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};
