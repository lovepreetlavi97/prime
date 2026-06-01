import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, createAdmin, deleteAdmin } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { ShieldCheck, Plus, Trash2, Mail, ShieldAlert } from 'lucide-react';

export default function Admins() {
  const dispatch = useDispatch();
  const admins = useSelector((state) => state.admin.admins);

  useEffect(() => {
    dispatch(setActiveTab('admins'));
  }, [dispatch]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill out all fields.');
      return;
    }
    dispatch(createAdmin({ name, email, role }));
    setName('');
    setEmail('');
    setShowAddForm(false);
    alert('Administrative role successfully assigned!');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      dispatch(deleteAdmin(id));
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
            ADMINISTRATOR <span className="text-[#D4AF37]">ROLES</span>
          </h2>
          <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
            Assign system roles and configure admin access permissions
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#cfa52f] text-black font-black text-[9px] tracking-[2px] uppercase flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          <Plus size={12} />
          {showAddForm ? 'CANCEL' : 'ASSIGN ADMIN ROLE'}
        </button>
      </div>

      {showAddForm && (
        <GlassCard title="Register New Administrative Partner">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Partner Full Name</label>
              <input
                type="text"
                placeholder="e.g. Preeti Kaur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Partner Email Address</label>
              <input
                type="email"
                placeholder="e.g. analyst@lvprimex.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Assigned Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
              >
                <option value="ANALYST">ANALYST (SIGNAL BROADCASTER)</option>
                <option value="SUPPORT">SUPPORT REPRESENTATIVE</option>
                <option value="SUPER_ADMIN">SUPER ADMINISTRATOR (FULL PRIVILEGES)</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#10B981] hover:bg-[#0fa874] text-black font-black uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <ShieldCheck size={12} />
              PUBLISH ASSIGNMENT
            </button>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {admins.map((adm) => {
          const isSuper = adm.role === 'SUPER_ADMIN';
          return (
            <GlassCard key={adm._id} hasGlow={isSuper} glowColor="amber" hoverable={true}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isSuper 
                      ? 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]' 
                      : 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                  }`}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider">{adm.name}</h4>
                    <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border block w-max mt-1 ${
                      isSuper
                        ? 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                    }`}>
                      {adm.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(adm._id)}
                  className="p-2 rounded-xl text-[#5A5E70] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 transition-all duration-300 cursor-pointer"
                  title="Revoke Admin Access"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-2 text-[10px] font-bold border-t border-white/[0.03] pt-4 uppercase">
                <div className="flex items-center gap-2 text-[#71717A]">
                  <Mail size={12} className="text-[#5A5E70]" />
                  <span className="text-[#A1A1AA] select-text font-bold tracking-normal">{adm.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[#71717A]">
                  <ShieldAlert size={12} className="text-[#5A5E70]" />
                  <span>
                    {isSuper ? 'READ, WRITE, REVOKE PERMISSIONS' : 'READ & SIGNAL BROADCAST ACCESS ONLY'}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
