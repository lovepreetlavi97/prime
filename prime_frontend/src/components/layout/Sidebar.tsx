"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSignalStore } from "@/store/useSignalStore";
import { Logo } from "../Logo";
import {
  LayoutDashboard,
  Zap,
  BarChart2,
  History,
  Crown,
  User,
  Bell,
  LogOut,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useSignalStore((state) => state.logout);
  const user = useSignalStore((state) => state.user);

  const menuItems = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Live Feed", path: "/signals", icon: <Zap size={18} /> },
    { name: "Intelligence", path: "/market", icon: <BarChart2 size={18} /> },
    { name: "Ledger History", path: "/history", icon: <History size={18} /> },
    { name: "VIP Plans", path: "/plans", icon: <Crown size={18} /> },
    { name: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
    { name: "Profile", path: "/profile", icon: <User size={18} /> },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isPro = user?.role === "ADMIN" || (
    user?.subscription?.isActive &&
    user?.subscription?.plan !== "free" &&
    (!user?.subscription?.endDate || new Date(user.subscription.endDate) > new Date())
  );

  return (
    <aside className="w-64 bg-[#08080C] border-r border-white/[0.04] flex flex-col justify-between h-screen sticky top-0 left-0 p-6 z-40 shrink-0">
      <div className="flex flex-col gap-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <Logo />
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 font-bold shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Box */}
      <div className="flex flex-col gap-4 border-t border-white/[0.04] pt-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F6D365] flex items-center justify-center text-black font-black text-xs">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {user.name || "Trader"}
              </span>
              <span className="text-[9px] font-mono text-[#D4AF37] tracking-wider uppercase mt-0.5">
                {isPro ? "VIP Pro MEMBER" : "FREE MEMBER"}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
