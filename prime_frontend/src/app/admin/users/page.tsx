'use client';

import React from 'react';
import { Users, Search, Filter, Shield, MoreHorizontal, UserCheck, UserX, Mail } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function UsersPage() {
  const users = [
    { name: 'Arjun Mehta', email: 'arjun@invest.com', plan: 'VIP', status: 'Active', joined: '2024-01-12' },
    { name: 'Sara Khan', email: 'sara.k@gmail.com', plan: 'Free', status: 'Banned', joined: '2023-11-20' },
    { name: 'Vikram Singh', email: 'vikram@trading.in', plan: 'Institutional', status: 'Active', joined: '2024-03-05' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Control access, tiers, and user permissions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-12 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
               <Filter size={16} /> Filters
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Suscriber</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registry Date</th>
                <th className="px-6 py-4 text-center">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border",
                      user.plan === 'Institutional' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                      user.plan === 'VIP' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className={cn("w-1.5 h-1.5 rounded-full", user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500')} />
                       <span className="text-xs font-bold text-slate-600">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{user.joined}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Message">
                         <Mail size={16} />
                       </button>
                       <button className={cn(
                         "p-2 rounded-lg transition-colors",
                         user.status === 'Active' ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                       )} title={user.status === 'Active' ? 'Ban' : 'Unban'}>
                         {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                       </button>
                       <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                         <MoreHorizontal size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
