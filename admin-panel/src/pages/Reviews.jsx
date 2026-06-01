import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, toggleReviewApproval } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { Star, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function Reviews() {
  const dispatch = useDispatch();
  const testimonials = useSelector((state) => state.admin.testimonials);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    dispatch(setActiveTab('reviews'));
  }, [dispatch]);

  const filteredReviews = testimonials.filter(t => {
    if (filter === 'APPROVED') return t.approved;
    if (filter === 'PENDING') return !t.approved;
    return true;
  });

  const handleToggle = (id) => {
    dispatch(toggleReviewApproval(id));
  };

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          TESTIMONIALS & <span className="text-[#D4AF37]">REVIEWS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Moderate and showcase premium user testimonials on target landing pages
        </p>
      </div>

      <div className="flex gap-2">
        {['ALL', 'APPROVED', 'PENDING'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 cursor-pointer ${
              filter === status 
                ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <GlassCard key={rev._id} hasGlow={!rev.approved} glowColor="amber">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-sm font-black text-white italic uppercase tracking-wider">{rev.user}</h4>
                  <div className="flex items-center gap-0.5 mt-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < Math.floor(rev.rating) ? 'currentColor' : 'none'}
                        className={i < Math.floor(rev.rating) ? 'text-amber-400' : 'text-[#4B4B52]'}
                      />
                    ))}
                    <span className="text-[9px] font-black ml-1.5 text-white/50">{rev.rating}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(rev._id)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border flex items-center gap-1 cursor-pointer transition-all duration-300 ${
                    rev.approved
                      ? 'bg-green-500/10 border-green-500/20 text-[#10B981] hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500'
                      : 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37] hover:bg-green-500/20'
                  }`}
                  title={rev.approved ? 'Reject review' : 'Approve review'}
                >
                  {rev.approved ? (
                    <>
                      <CheckCircle size={10} />
                      APPROVED
                    </>
                  ) : (
                    <>
                      <XCircle size={10} />
                      PENDING APPROVAL
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 flex gap-3 items-start">
                <MessageSquare size={14} className="text-[#5A5E70] shrink-0 mt-0.5" />
                <p className="text-xs text-[#A1A1AA] italic font-medium leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center text-[#71717A] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]">
            No Testimonials / Reviews found
          </div>
        )}
      </div>
    </div>
  );
}
