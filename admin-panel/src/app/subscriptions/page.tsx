'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/useAdminStore';
import { 
  Plus, CreditCard, Sparkles, Check, Trash2, Edit3, 
  BarChart4, ArrowUpRight, DollarSign, Wallet
} from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { RealtimeChart } from '../../components/RealtimeChart';

export default function SubscriptionsPage() {
  const { 
    packages, fetchPackages, createPackage, updatePackage, deletePackage, setActiveTab
  } = useAdminStore();

  const [loading, setLoading] = useState(false);
  
  // Package form fields state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [features, setFeatures] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab('subscriptions');
  }, [setActiveTab]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleSubmitPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Please fill in all mandatory fields');
      return;
    }

    const featureList = features.split('\n').filter(f => f.trim() !== '');

    const pkgData = {
      name,
      price: parseFloat(price),
      durationInDays: parseInt(duration) || 30,
      features: featureList,
    };

    if (editingId) {
      await updatePackage(editingId, pkgData);
      setEditingId(null);
    } else {
      await createPackage(pkgData);
    }

    // Reset Form
    setName('');
    setPrice('');
    setDuration('30');
    setFeatures('');
  };

  const handleEditPackage = (pkg: any) => {
    setEditingId(pkg._id);
    setName(pkg.name);
    setPrice(pkg.price.toString());
    setDuration(pkg.durationInDays.toString());
    setFeatures(pkg.features?.join('\n') || '');
  };

  // Mock revenue chart split
  const revenueTrendData = [
    { name: 'Elite Plan', value: 185400 },
    { name: 'Pro Plan', value: 100000 },
    { name: 'Free Plan', value: 0 },
  ];

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          SUBSCRIPTION <span className="text-[#D4AF37]">TIERS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Plan Configuration, Revenue Analysis & Razorpay Integrations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analytics & Package lists */}
        <div className="lg:col-span-8 space-y-6">
          {/* Billing Overview metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard hoverable={true}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase text-[#71717A]">Elite Plan Share</span>
                  <h4 className="text-2xl font-black text-white uppercase italic">₹185,400</h4>
                  <p className="text-[9px] text-[#00C2FF] font-bold">64.9% of total</p>
                </div>
                <div className="p-3 bg-[#00C2FF]/5 border border-[#00C2FF]/10 text-[#00C2FF] rounded-xl"><DollarSign size={18} /></div>
              </div>
            </GlassCard>

            <GlassCard hoverable={true}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase text-[#71717A]">Pro Plan Share</span>
                  <h4 className="text-2xl font-black text-white uppercase italic">₹100,000</h4>
                  <p className="text-[9px] text-[#10B981] font-bold">35.1% of total</p>
                </div>
                <div className="p-3 bg-[#10B981]/5 border border-[#10B981]/10 text-[#10B981] rounded-xl"><Wallet size={18} /></div>
              </div>
            </GlassCard>

            <GlassCard hoverable={true}>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <span className="text-[8px] font-black tracking-[1.5px] uppercase text-[#71717A]">Checkout Success</span>
                  <h4 className="text-2xl font-black text-white uppercase italic">98.2%</h4>
                  <p className="text-[9px] text-[#10B981] font-bold">Razorpay active</p>
                </div>
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-[#D4AF37] rounded-xl"><BarChart4 size={18} /></div>
              </div>
            </GlassCard>
          </div>

          {/* Plan Package cards list */}
          <div className="space-y-4">
            <span className="text-[9px] font-black text-[#71717A] tracking-[2.5px] uppercase block">
              LVPrimeX PACKAGES IN DATABASE
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <GlassCard key={pkg._id} hasGlow={pkg.name.toUpperCase() === 'ELITE'} glowColor={pkg.name.toUpperCase() === 'ELITE' ? 'cyan' : 'amber'}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black text-white uppercase italic tracking-tight">
                        {pkg.name} <span className="text-[#D4AF37]">PLAN</span>
                      </h4>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-white">₹{pkg.price}</span>
                        <span className="text-[8px] font-bold text-[#71717A] tracking-[1.5px] uppercase">/ {pkg.durationInDays} Days</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPackage(pkg)}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#D4AF37] bg-white/5 border border-white/5 transition-all duration-300"
                        title="Edit plan"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete billing package?')) deletePackage(pkg._id); }}
                        className="p-2 rounded-xl text-[#71717A] hover:text-[#EF4444] bg-white/5 border border-white/5 transition-all duration-300"
                        title="Delete plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-2">
                    {pkg.features?.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#71717A] font-bold">
                        <Check size={12} className="text-[#10B981]" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Manage plan package Form */}
        <div className="lg:col-span-4">
          <GlassCard title={editingId ? 'Modify Package' : 'Create Package'} hasGlow={true}>
            <form onSubmit={handleSubmitPackage} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                  PLAN TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pro, Elite, Free"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                    PRICE (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1">
                    DURATION (DAYS)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1 flex items-center justify-between">
                  <span>FEATURES (ONE PER LINE)</span>
                  <span className="text-[7px] text-[#4B4B52]">Shift + Enter</span>
                </label>
                <textarea
                  placeholder="Real-time alerts&#10;Premium coaching&#10;Manual syncs"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="w-full h-32 p-4 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setPrice('');
                      setDuration('30');
                      setFeatures('');
                    }}
                    className="flex-1 h-12 rounded-xl border border-white/5 text-[#71717A] font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-grow h-12 rounded-xl bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-transform shadow-[0_4px_12px_rgba(212,175,55,0.15)]"
                >
                  {editingId ? 'APPLY CHANGES' : 'CREATE PACKAGE'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
