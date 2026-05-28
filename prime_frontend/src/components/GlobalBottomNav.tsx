'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Crown, History, User } from 'lucide-react';
import { useSignalStore } from '@/store/useSignalStore';
import { useShallow } from 'zustand/react/shallow';

export const GlobalBottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useSignalStore(
    useShallow((state) => ({
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab
    }))
  );

  const navItems = [
    { id: 'home', label: 'TERMINAL', icon: Home, path: '/' },
    { id: 'history', label: 'ARCHIVE', icon: History, path: '/' }, // Both are on root
    { id: 'plans', label: 'ELITE', icon: Crown, path: '/plans', isCenter: true },
    { id: 'profile', label: 'IDENTITY', icon: User, path: '/profile' },
  ];

  /* 
    // Old bottom nav layout preserved for rollback safety
    <nav className="fixed bottom-0 left-0 right-0 z-[400] bg-[#0B0B0F]/90 backdrop-blur-2xl border-t border-white/[0.03] pb-[env(safe-area-inset-bottom)] px-6">
      <div className="h-16 flex items-center justify-between max-w-lg mx-auto relative">
        {navItems.map((item) => { ... })}
      </div>
    </nav>
  */

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[400] bg-[#0B0B0F]/95 backdrop-blur-3xl border-t border-white/[0.03] pb-[env(safe-area-inset-bottom)]">
      <div className="h-16 max-w-lg mx-auto flex items-center">
        {navItems.map((item) => {
          const isRootPath = pathname === '/';
          const isActive = isRootPath && (item.id === 'home' || item.id === 'history')
            ? activeTab === item.id 
            : pathname === item.path;

          const Icon = item.icon;

          const handleNav = () => {
            if (item.id === 'home' || item.id === 'history') {
              setActiveTab(item.id as any);
              if (pathname !== '/') router.push('/');
            } else {
              router.push(item.path);
            }
          };

          return (
            <button
              key={item.id}
              onClick={handleNav}
              className="flex-1 relative flex flex-col items-center justify-center gap-1 h-full group"
            >
              {/* Active Indicator (Top Glow) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active-glow"
                    className="absolute top-0 w-8 h-[2px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <div className={`relative transition-all duration-500 flex flex-col items-center gap-1.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#4B4B52] group-hover:text-white/60'}`}>
                <div className={`p-1.5 rounded-xl transition-all duration-500 ${item.isCenter && isActive ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                <span className={`text-[7px] font-black uppercase tracking-[2px] transition-all duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-[#4B4B52]'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
