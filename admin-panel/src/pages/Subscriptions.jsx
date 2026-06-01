import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Edit3, CreditCard, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { 
  fetchPackages, createPackageThunk, 
  updatePackageThunk, deletePackageThunk, setActiveTab 
} from '../store/slices/adminSlice';

export default function Subscriptions() {
  const dispatch = useDispatch();
  const packages = useSelector((state) => state.admin.packages);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [features, setFeatures] = useState('');
  const [badge, setBadge] = useState('');

  useEffect(() => {
    dispatch(setActiveTab('subscriptions'));
    dispatch(fetchPackages());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Plan Name and Price are required.');
      return;
    }

    const featureList = features.split(',').map(f => f.trim()).filter(f => f.length > 0);

    const pkgData = {
      name,
      price: parseFloat(price),
      durationInDays: parseInt(duration) || 30,
      features: featureList,
      badge: badge || undefined,
      isActive: true
    };

    if (editingId) {
      dispatch(updatePackageThunk({ id: editingId, pkgData }));
      setEditingId(null);
    } else {
      dispatch(createPackageThunk(pkgData));
    }

    // Reset Form
    setName('');
    setPrice('');
    setDuration('30');
    setFeatures('');
    setBadge('');
    setIsAdding(false);
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg._id);
    setName(pkg.name);
    setPrice(pkg.price.toString());
    setDuration(pkg.durationInDays.toString());
    setFeatures(pkg.features.join(', '));
    setBadge(pkg.badge || '');
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
            SUBSCRIPTION <span className="text-[#D4AF37]">TIERS</span>
          </h2>
          <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[4px]">
            Manage Plan Packages, Feature Details & Pricing Structures
          </p>
        </div>

        <button 
          onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
          className="h-12 px-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/50 hover:bg-[#D4AF37] hover:text-black font-black text-[10px] tracking-[2px] uppercase transition-all duration-300 active:scale-[0.98] flex items-center gap-2 cursor-pointer text-[#D4AF37]"
        >
          <Plus size={12} />
          {isAdding ? 'CANCEL FORM' : 'CREATE BILLING TIER'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Package cards listing */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {packages.length > 0 ? (
            packages.map((pkg) => {
              const isElite = pkg.name.toLowerCase().contains?.('elite') || pkg.name.toLowerCase().includes('elite') || pkg.price > 2000;
              return (
                <GlassCard key={pkg._id} hasGlow={isElite} glowColor={isElite ? 'cyan' : 'amber'} hoverable={true}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-white uppercase italic">{pkg.name}</h4>
                      <p className="text-xs font-black text-[#71717A] uppercase">{pkg.durationInDays} Days Duration</p>
                    </div>
                    {pkg.badge && (
                      <span className="text-[8px] font-black tracking-widest bg-amber-500 text-black px-2 py-0.5 rounded">
                        {pkg.badge.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-white italic mb-6">
                    ₹{pkg.price.toLocaleString()}
                  </div>

                  <div className="border-t border-white/[0.03] pt-4 mb-6">
                    <span className="text-[8px] font-black text-[#5A5E70] uppercase tracking-[1px] block mb-3">FEATURES INCLUDED</span>
                    <ul className="space-y-2 text-[11px] font-bold text-[#A1A1AA]">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => handleEdit(pkg)}
                      className="p-2 rounded-xl text-[#A1A1AA] bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button 
                      onClick={() => { if (confirm('Delete billing plan package?')) dispatch(deletePackageThunk(pkg._id)); }}
                      className="p-2 rounded-xl text-[#71717A] bg-white/5 border border-white/5 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </GlassCard>
              );
            })
          ) : (
            <div className="col-span-2 p-12 text-center text-[#5A5E70] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]">
              No Packages Loaded
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="lg:col-span-4">
            <GlassCard title={editingId ? 'Edit Billing Package' : 'Create Billing Package'} hasGlow={true}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A]">PLAN NAME</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elite Tier"
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A]">PRICE (INR)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4999"
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A]">DURATION (DAYS)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="30"
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A]">BADGE HINT</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. POPULAR"
                    className="w-full h-11 px-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1px] text-[#71717A] flex justify-between">
                    <span>FEATURES (COMMA SEPARATED)</span>
                  </label>
                  <textarea
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="e.g. Real-time Option Signals, VIP Telegram, Broker Sync"
                    className="w-full h-20 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] hover:scale-[1.01] hover:bg-[#cfa52f] cursor-pointer"
                >
                  {editingId ? 'SAVE PLAN CHANGES' : 'CREATE BILLING TIER'}
                </button>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
