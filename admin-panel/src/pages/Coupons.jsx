import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, createCoupon, deleteCoupon } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { Percent, Plus, Trash2, Calendar, CheckCircle } from 'lucide-react';

export default function Coupons() {
  const dispatch = useDispatch();
  const coupons = useSelector((state) => state.admin.coupons);

  useEffect(() => {
    dispatch(setActiveTab('coupons'));
  }, [dispatch]);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [type, setType] = useState('PERCENT');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code || !discount) {
      alert('Please fill out all fields.');
      return;
    }
    dispatch(createCoupon({
      code: code.toUpperCase().trim(),
      discount: parseFloat(discount),
      type
    }));
    setCode('');
    setDiscount('');
    setShowAddForm(false);
    alert('Promo coupon code registered successfully!');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      dispatch(deleteCoupon(id));
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
            COUPONS & <span className="text-[#D4AF37]">PROMOS</span>
          </h2>
          <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
            Manage subscription discount promotion codes and limit rules
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-10 px-5 rounded-xl bg-[#D4AF37] hover:bg-[#cfa52f] text-black font-black text-[9px] tracking-[2px] uppercase flex items-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.15)]"
        >
          <Plus size={12} />
          {showAddForm ? 'CANCEL' : 'CREATE PROMO CODE'}
        </button>
      </div>

      {showAddForm && (
        <GlassCard title="Register New Promo Coupon">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Promo Code Name</label>
              <input
                type="text"
                placeholder="e.g. PRIME50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold uppercase focus:border-[#D4AF37]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Discount Amount</label>
              <input
                type="number"
                placeholder="50 or 1000"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Reduction Mode</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
              >
                <option value="PERCENT">PERCENT (%) OFF</option>
                <option value="FIXED">FIXED AMOUNT (₹) OFF</option>
              </select>
            </div>

            <button
              type="submit"
              className="h-11 rounded-xl bg-[#10B981] hover:bg-[#0fa874] text-black font-black uppercase text-[10px] tracking-[2px] flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <CheckCircle size={12} />
              PUBLISH PROMO
            </button>
          </form>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.length > 0 ? (
          coupons.map((c) => (
            <GlassCard key={c._id} hoverable={true}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37]">
                    <Percent size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white uppercase tracking-wider">{c.code}</h4>
                    <p className="text-[9px] text-[#71717A] font-bold mt-0.5">
                      Type: <span className="text-white">{c.type}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(c._id)}
                  className="p-2 rounded-xl text-[#5A5E70] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-transparent hover:border-[#EF4444]/20 transition-all duration-300 cursor-pointer"
                  title="Remove coupon"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-2 text-[10px] font-bold border-t border-white/[0.03] pt-4 uppercase">
                <div className="flex justify-between items-center">
                  <span className="text-[#71717A]">Reduction Reward</span>
                  <span className="text-[#10B981]">
                    {c.type === 'PERCENT' ? `${c.discount}% Off` : `₹${c.discount} Off`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717A]">Status</span>
                  <span className="text-white">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#71717A]">Usage Count</span>
                  <span className="text-[#00C2FF]">{c.usageCount} checkouts</span>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-3 p-12 text-center text-[#71717A] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]">
            No Active Promo Coupons found
          </div>
        )}
      </div>
    </div>
  );
}
