import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  BarChart2, 
  Users, 
  CreditCard, 
  Settings, 
  Bell,
  MessageSquare,
  LogOut
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Signals', href: '/admin/signals', icon: BarChart2 },
  { name: 'Telegram', href: '/admin/telegram', icon: MessageSquare },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#0a0c10] text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f1218] border-r border-white/5 flex flex-col pt-8">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/20">S</div>
            <h1 className="text-xl font-black tracking-tight text-white uppercase">Signal Panel</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto h-full">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#0a0c10]/80 backdrop-blur-md z-10">
          <div>
            <h2 className="text-sm text-slate-500 uppercase tracking-widest font-bold">Trading Center</h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0c10]" />
            </button>
            <div className="h-8 w-[1px] bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-bold text-white">Admin Zero</span>
                <span className="block text-[10px] text-blue-500 font-bold uppercase tracking-wider">Super Admin</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full border border-white/10" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
};
