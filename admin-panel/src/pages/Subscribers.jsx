import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, UserCheck, Calendar, ShieldCheck, Mail } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { fetchUsers, setActiveTab } from '../store/slices/adminSlice';

export default function Subscribers() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);

  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');

  useEffect(() => {
    dispatch(setActiveTab('subscribers'));
    dispatch(fetchUsers());
  }, [dispatch]);

  const subscribers = users.filter(u => {
    const hasSub = u.subscription && u.subscription.plan && u.subscription.plan !== 'free';
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      u.phone.includes(search);
    const matchesPlan = planFilter === 'ALL' || (u.subscription && u.subscription.plan === planFilter);
    return hasSub && matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          SUBSCRIBER <span className="text-[#D4AF37]">MANAGEMENT</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Monitor Active Premium Subscriptions, Renewals, & Tiers
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:max-w-md flex items-center gap-3 px-4 h-12 rounded-2xl bg-[#0A0D18]/65 border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
          <Search size={16} className="text-[#4B4B52]" />
          <input
            type="text"
            placeholder="Search subscribers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 tracking-wider font-bold"
          />
        </div>

        {/* Plan Filter */}
        <div className="flex gap-2.5">
          {['ALL', 'pro', 'elite'].map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`px-5 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 ${
                planFilter === p 
                  ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                  : 'bg-[#0A0D18] border-white/5 text-[#71717A] hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#71717A] font-black uppercase tracking-wider bg-white/[0.01]">
                <th className="p-4 pl-6">Subscriber</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Plan Tier</th>
                <th className="p-4">Subscription Status</th>
                <th className="p-4">Start Date</th>
                <th className="p-4 pr-6">Expiry Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {subscribers.length > 0 ? (
                subscribers.map((sub) => {
                  const isElite = sub.subscription.plan === 'elite';
                  const endDate = sub.subscription.endDate ? new Date(sub.subscription.endDate) : null;
                  const isExpired = endDate ? endDate.getTime() < Date.now() : false;
                  
                  return (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 font-black text-white">{sub.name || 'Anonymous Trader'}</td>
                      <td className="p-4 font-bold text-[#A1A1AA]">{sub.phone}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${
                          isElite
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                            : 'bg-green-500/10 border-green-500/20 text-[#10B981]'
                        }`}>
                          {sub.subscription.plan.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} />
                          <span className="text-[10px] font-bold uppercase tracking-wide">
                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-[#71717A] font-bold">
                        {sub.subscription.startDate ? new Date(sub.subscription.startDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 pr-6 text-[#71717A] font-bold">
                        {endDate ? endDate.toLocaleDateString() : 'Lifetime'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#71717A] uppercase font-black tracking-[4px]">
                    No Premium Subscribers Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
