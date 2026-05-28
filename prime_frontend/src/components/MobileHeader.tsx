'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSignalStore } from '@/store/useSignalStore';
import { useShallow } from 'zustand/react/shallow';
import { usePathname, useRouter } from 'next/navigation';
import { User, ShieldCheck, Zap } from 'lucide-react';
import { Logo } from './Logo';

export const MobileHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, user } = useSignalStore(
    useShallow((state) => ({
      isConnected: state.isConnected,
      user: state.user
    }))
  );

  /*
    // Old header layout preserved for rollback safety
    <header className="fixed top-0 left-0 right-0 z-[250] bg-[#0B0B0F]/90 backdrop-blur-2xl border-b border-white/[0.03] px-5 py-2.5">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        ...
      </div>
    </header>
  */

  return (
    <header className="fixed top-0 left-0 right-0 z-[250] bg-[#0B0B0F]/95 backdrop-blur-3xl border-b border-white/[0.03] px-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

        {/* 🆔 LEFT: LOGO (Using logo.png) */}
        <div 
          onClick={() => router.push('/')}
          className="flex items-center cursor-pointer shrink-0"
        >
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
        </div>

        {/* 🧠 CENTER: NEURAL STATUS (Commented out as requested) */}
        {/* 
        <div className="flex flex-col items-center flex-1">
           ...
        </div> 
        */}

        {/* 📡 RIGHT: ACCOUNT / LOGIN (Static) */}
        <div className="flex items-center justify-end shrink-0 ml-4">
          <div
            onClick={() => router.push(user ? '/profile' : '/login')}
            className="flex items-center gap-2 cursor-pointer bg-white/[0.03] border border-white/5 px-4 py-2 rounded-xl hover:bg-white/[0.08] transition-all duration-300 whitespace-nowrap"
          >
            <User size={14} className={user ? 'text-[#D4AF37]' : 'text-[#4B4B52]'} />
            <span className={`text-[10px] font-black uppercase tracking-[2px] ${user ? 'text-white' : 'text-[#4B4B52]'}`}>
              {user ? 'Account' : 'Login'}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
