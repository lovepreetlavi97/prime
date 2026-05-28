'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  History,
  Users,
  CreditCard,
  Banknote,
  Repeat,
  Send,
  BarChart3,
  Bell,
  FileCode,
  Settings,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/utils/cn';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Live Signals', icon: Zap, href: '/admin/signals' },
  { name: 'Signal History', icon: History, href: '/admin/signals/history' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Subscriptions', icon: CreditCard, href: '/admin/subscriptions' },
  { name: 'Payments', icon: Banknote, href: '/admin/payments' },
  { name: 'Transactions', icon: Repeat, href: '/admin/transactions' },
  { name: 'Telegram Feed', icon: Send, href: '/admin/telegram' },
  { name: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { name: 'Notifications', icon: Bell, href: '/admin/notifications' },
  { name: 'CMS', icon: FileCode, href: '/admin/cms' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-full overflow-y-auto no-scrollbar">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
            P
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">Prime<span className="text-indigo-600">Admin</span></span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button 
          onClick={() => {/* logout logic */}}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          Logout
        </button>
      </div>
    </aside>
  );
}
