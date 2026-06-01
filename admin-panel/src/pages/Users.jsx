import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, ShieldAlert, Key, UserMinus, Plus, 
  Settings, CheckCircle2, AlertOctagon, Heart, Zap
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { 
  fetchUsers, toggleBanUser, deleteUserThunk, 
  updateUserRole, updateUserSubscription, setActiveTab 
} from '../store/slices/adminSlice';

export default function Users() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  // Manual Subscription parameters State
  const [overridePlan, setOverridePlan] = useState('pro');
  const [overrideDuration, setOverrideDuration] = useState('30');
  const [overrideRole, setOverrideRole] = useState('USER');

  useEffect(() => {
    dispatch(setActiveTab('users'));
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name || '').toLowerCase().includes(search.toLowerCase()) || 
      u.phone.includes(search);
    
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'USER') return matchesSearch && u.role === 'USER';
    if (filter === 'ADMIN') return matchesSearch && (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
    if (filter === 'BANNED') return matchesSearch && u.isBanned;
    return matchesSearch;
  });

  const handleApplySubscription = async (userId) => {
    const days = parseInt(overrideDuration) || 30;
    dispatch(updateUserSubscription({ id: userId, plan: overridePlan, durationDays: days }));
    // Refresh local selections
    const updated = users.find(u => u._id === userId);
    if (updated) {
      setSelectedUser({ 
        ...updated, 
        subscription: { plan: overridePlan, isActive: true, endDate: new Date(Date.now() + 86400000 * days).toISOString() } 
      });
    }
    alert('Subscription package successfully manually assigned!');
  };

  const handleApplyRole = async (userId) => {
    dispatch(updateUserRole({ id: userId, role: overrideRole }));
    alert('User administrative permissions updated!');
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          USER <span className="text-[#D4AF37]">DIRECTORY</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Operational User Management & Subscription Control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Directory grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full md:max-w-md flex items-center gap-3 px-4 h-12 rounded-2xl bg-[#0A0D18]/65 border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
              <Search size={16} className="text-[#4B4B52]" />
              <input
                type="text"
                placeholder="Search by phone number or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-grow bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 tracking-wider font-bold"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
              {['ALL', 'USER', 'ADMIN', 'BANNED'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 ${
                    filter === f 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]' 
                      : 'bg-[#0A0D18] border-white/5 text-[#71717A] hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[#71717A] font-black uppercase tracking-wider bg-white/[0.01]">
                    <th className="p-4 pl-6">Trader ID / Demographics</th>
                    <th className="p-4">Permissions</th>
                    <th className="p-4">Billing Plan</th>
                    <th className="p-4">Security</th>
                    <th className="p-4 text-right pr-6">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user._id} 
                        onClick={() => setSelectedUser(user)}
                        className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                          selectedUser?._id === user._id ? 'bg-white/[0.03]' : ''
                        }`}
                      >
                        <td className="p-4 pl-6 space-y-1">
                          <div className="font-black text-white">{user.name || 'Anonymous Trader'}</div>
                          <div className="text-[10px] text-[#71717A] font-bold tracking-wider">{user.phone}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${
                            user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'
                              ? 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]'
                              : 'bg-white/5 border-white/5 text-[#A1A1AA]'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${
                            user.subscription?.plan === 'elite'
                              ? 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                              : user.subscription?.plan === 'pro'
                              ? 'bg-green-500/10 border-green-500/20 text-[#10B981]'
                              : 'bg-white/5 border-white/5 text-[#71717A]'
                          }`}>
                            {user.subscription?.plan?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                              {user.isBanned ? 'BANNED' : 'ACTIVE'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right pr-6 space-x-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch(toggleBanUser(user._id)); }}
                            className={`p-2 rounded-xl border transition-all duration-300 ${
                              user.isBanned
                                ? 'text-[#10B981] bg-[#10B981]/5 border-[#10B981]/15 hover:bg-[#10B981]/20'
                                : 'text-[#EF4444] bg-[#EF4444]/5 border-[#EF4444]/15 hover:bg-[#EF4444]/20'
                            }`}
                            title={user.isBanned ? 'Unblock user' : 'Block user'}
                          >
                            <AlertOctagon size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (confirm('Delete user permanently?')) dispatch(deleteUserThunk(user._id)); }}
                            className="p-2 rounded-xl text-[#71717A] bg-white/5 border border-white/5 hover:text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/20 transition-all duration-300"
                            title="Delete user"
                          >
                            <UserMinus size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-[#71717A] uppercase font-black tracking-[4px]">
                        No Users Found in Directory
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Selected User Details Override panel */}
        <div className="lg:col-span-4 space-y-6">
          {selectedUser ? (
            <>
              <GlassCard title="Trader Diagnostics" hasGlow={true} glowColor="cyan">
                <div className="space-y-6">
                  {/* Demographics */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black tracking-[2px] text-[#71717A] uppercase block">TRADER IDENTITY</span>
                    <h3 className="text-xl font-black text-white italic uppercase">{selectedUser.name || 'Anonymous User'}</h3>
                    <p className="text-xs font-bold text-[#00C2FF] tracking-wider">{selectedUser.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">BIOMETRICS SYNC</span>
                      <span className="font-bold text-white uppercase text-[10px]">VERIFIED ACTIVE</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[8px] font-black text-[#71717A] tracking-[1.5px] uppercase block">TOKEN VERSION</span>
                      <span className="font-bold text-white text-[10px]">{selectedUser.tokenVersion || 0} Sessions</span>
                    </div>
                  </div>

                  {/* Manual Subscription Assignment */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[9px] font-black text-amber-500 tracking-[2px] uppercase block">
                      MANUAL SUBSCRIPTION BRIDGE
                    </span>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[#71717A] uppercase tracking-[1px]">Assign Package Plan</label>
                        <select 
                          value={overridePlan} 
                          onChange={(e) => setOverridePlan(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                        >
                          <option value="free">Free - Basic Access</option>
                          <option value="pro">Pro - Real-time Signals</option>
                          <option value="elite">Elite - Full Execution Bridge</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[#71717A] uppercase tracking-[1px]">Duration In Days</label>
                        <input 
                          type="number"
                          value={overrideDuration}
                          onChange={(e) => setOverrideDuration(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold"
                          placeholder="30"
                        />
                      </div>

                      <button
                        onClick={() => handleApplySubscription(selectedUser._id)}
                        className="w-full h-10 rounded-xl bg-[#00C2FF] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform"
                      >
                        ASSIGN MANUAL ACCESS
                      </button>
                    </div>
                  </div>

                  {/* Manual Permissions Assignment */}
                  <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-4">
                    <span className="text-[9px] font-black text-amber-500 tracking-[2px] uppercase block">
                      ADMIN PRIVILEGE CONTROL
                    </span>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-[#71717A] uppercase tracking-[1px]">Administrative Role</label>
                        <select 
                          value={overrideRole} 
                          onChange={(e) => setOverrideRole(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none"
                        >
                          <option value="USER">USER - Standard Trader</option>
                          <option value="ANALYST">ANALYST - Access to Signals</option>
                          <option value="SUPPORT">SUPPORT - Ticket Manager</option>
                          <option value="ADMIN">ADMIN - Full ecosystem operations</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleApplyRole(selectedUser._id)}
                        className="w-full h-10 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform"
                      >
                        UPDATE SYSTEM PERMISSIONS
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </>
          ) : (
            <GlassCard className="h-[400px] flex items-center justify-center text-center p-8 border-dashed">
              <div className="space-y-2">
                <Settings size={28} className="text-[#4B4B52] mx-auto animate-spin" />
                <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[3px]">
                  Select user to edit credentials
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
