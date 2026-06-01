"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  BarChart2,
  Crown,
  User,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Live Feed", path: "/signals", icon: <Zap size={20} /> },
    { name: "Intelligence", path: "/market", icon: <BarChart2 size={20} /> },
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "VIP Plans", path: "/plans", icon: <Crown size={20} /> },
    { name: "Profile", path: "/profile", icon: <User size={20} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#060606]/95 backdrop-blur-lg border-t border-white/[0.04] py-2 px-4 z-40 flex justify-around items-center h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all duration-300 ${
              isActive ? "text-[#D4AF37] scale-105" : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-wider">
              {item.name.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
export default BottomNav;
