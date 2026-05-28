'use client';

import React from 'react';
import { Search, Bell, User, Menu, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function AdminHeader() {
  const pathname = usePathname();
  
  // Basic breadcrumb logic
  const paths = pathname.split('/').filter(p => p);
  const greeting = "Welcome back, Admin";

  return (
    <header className="sticky top-0 z-40 flex w-full bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
      <div className="flex flex-1 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
            <Menu size={20} />
          </button>
          
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500">
            {paths.map((path, idx) => (
              <React.Fragment key={path}>
                <span className="capitalize">{path}</span>
                {idx < paths.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none outline-none text-xs w-48 text-slate-600 placeholder:text-slate-400"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800">Lavi Singh</div>
              <div className="text-[10px] font-medium text-slate-400">Super Admin</div>
            </div>
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-200 cursor-pointer hover:bg-indigo-200 transition-colors">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
