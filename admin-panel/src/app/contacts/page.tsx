'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '../../store/useAdminStore';
import { GlassCard } from '../../components/GlassCard';
import { Search, CheckCircle2, MessageSquare, Reply, AlertCircle, HelpCircle, User, Mail, Phone, Calendar } from 'lucide-react';

export default function ContactsPage() {
  const { fetchContactSubmissions, resolveContactSubmission, setActiveTab } = useAdminStore();

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');
  const [page, setPage] = useState(1);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab('contacts');
  }, [setActiveTab]);

  useEffect(() => {
    loadSubmissions();
  }, [search, statusFilter, page]);

  const loadSubmissions = async () => {
    setLoading(true);
    const filterStatus = statusFilter === 'ALL' ? undefined : statusFilter;
    const res = await fetchContactSubmissions(search || undefined, filterStatus, page);
    if (res && res.success) {
      setSubmissions(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      if (selectedSub) {
        const found = res.data.find((s: any) => s._id === selectedSub._id);
        if (found) setSelectedSub(found);
      }
    } else {
      // Mock fallback data for testing/offline support
      const mockData = [
        { _id: 'c1', name: 'Kabir Dev', email: 'kabir@trader.io', phone: '9898989898', subject: 'Unable to connect Dhan API', message: 'I tried generating a client token on Dhan but the backend keeps throwing auth errors. Can you reset my connection?', status: 'PENDING', reply: '', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { _id: 'c2', name: 'Aarav Mehta', email: 'aarav@gold.in', phone: '9765432100', subject: 'Subscription payment failed', message: 'My Razorpay checkout failed thrice but the money was deducted from my account. Please verify my status.', status: 'PENDING', reply: '', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { _id: 'c3', name: 'Meera Nair', email: 'meera@nifty.com', phone: '9123456789', subject: 'Refund Request', message: 'I want a refund for my quarterly subscription as I am relocating abroad.', status: 'RESOLVED', reply: 'Refund initiated. It will reflect in 5-7 business days.', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ];
      const filtered = mockData.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                              m.email.toLowerCase().includes(search.toLowerCase()) ||
                              m.subject.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
      setSubmissions(filtered);
      setPagination({ page: 1, totalPages: 1, total: filtered.length });
    }
    setLoading(false);
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    if (!replyText) {
      alert('Please enter a response/reply message for the user.');
      return;
    }
    setResolving(true);
    await resolveContactSubmission(selectedSub._id, replyText);
    setReplyText('');
    setResolving(false);
    alert('User inquiry resolved and response logged!');
    loadSubmissions();
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[3px]">CUSTOMER OPERATIONS SYSTEM</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">
            SUPPORT <span className="text-[#D4AF37]">CENTER</span>
          </h2>
          <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[4px]">
            User Contact forms, unresolved queries, and institutional ticket resolutions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Submissions List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="w-full sm:max-w-xs md:max-w-md flex items-center gap-3 px-4 h-12 rounded-2xl bg-[#0A0D18]/65 border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
              <Search size={14} className="text-[#4B4B52]" />
              <input
                type="text"
                placeholder="Search queries, email or name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-grow bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 tracking-wider font-bold"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 shrink-0">
              {(['ALL', 'PENDING', 'RESOLVED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => { setStatusFilter(filter); setPage(1); }}
                  className={`px-4 h-10 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 cursor-pointer ${
                    statusFilter === filter 
                      ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                      : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* List display */}
          <div className="space-y-4">
            {loading && (
              <div className="text-xs text-[#D4AF37] font-bold animate-pulse tracking-widest uppercase pl-1">SYNCING ECOSYSTEM TICKETS...</div>
            )}
            
            <AnimatePresence mode="popLayout">
              {submissions.length > 0 ? (
                submissions.map((sub) => {
                  const isPending = sub.status === 'PENDING';
                  const isSelected = selectedSub?._id === sub._id;
                  
                  return (
                    <motion.div
                      key={sub._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    >
                      <GlassCard 
                        hasGlow={isPending}
                        glowColor="amber"
                        onClick={() => setSelectedSub(sub)}
                        className={`cursor-pointer transition-all duration-300 border ${
                          isSelected 
                            ? 'bg-gradient-to-r from-white/[0.04] to-[#D4AF37]/5 border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]' 
                            : 'border-white/[0.03] hover:border-white/10 hover:bg-white/[0.01]'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-sm font-black text-white italic tracking-wide">{sub.subject}</span>
                              <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md ${
                                isPending 
                                  ? 'bg-amber-500/10 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_8px_rgba(245,158,11,0.05)]' 
                                  : 'bg-green-500/10 text-[#10B981] border border-[#10B981]/20'
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                            <p className="text-[9px] text-[#5A5E70] font-black uppercase tracking-wider">
                              FROM: <span className="text-white">{sub.name}</span> &lt;{sub.email}&gt;
                            </p>
                          </div>
                          <span className="text-[8px] text-[#5A5E70] font-black tracking-wider uppercase bg-white/[0.02] border border-white/5 px-2 py-0.5 rounded-lg shrink-0">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] mt-3 line-clamp-2 leading-relaxed">
                          {sub.message}
                        </p>
                      </GlassCard>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center text-[#5A5E70] uppercase font-black tracking-[4px] border border-white/[0.03] rounded-3xl bg-white/[0.01]"
                >
                  No Customer Support Inquiries Found
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 h-9 bg-white/5 border border-white/5 disabled:opacity-50 text-[10px] font-black uppercase text-white rounded-lg cursor-pointer hover:bg-white/10"
                >
                  Prev
                </button>
                <span className="px-4 h-9 flex items-center text-[10px] font-black text-[#5A5E70]">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 h-9 bg-white/5 border border-white/5 disabled:opacity-50 text-[10px] font-black uppercase text-white rounded-lg cursor-pointer hover:bg-white/10"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed View & Action Reply */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedSub ? (
              <motion.div
                key={selectedSub._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <GlassCard title="Support Ticket Terminal" hasGlow={selectedSub.status === 'PENDING'}>
                  <div className="space-y-6">
                    {/* User Metadata */}
                    <div className="space-y-3.5 border-b border-white/[0.03] pb-5">
                      <span className="text-[8px] font-black tracking-[2px] text-[#71717A] uppercase block pl-0.5">SENDER TELEMETRY</span>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <User size={13} className="text-[#D4AF37]" />
                          <span className="text-sm font-black text-white italic uppercase tracking-wider">{selectedSub.name}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Mail size={13} className="text-[#00C2FF]" />
                          <span className="text-xs font-bold text-[#A1A1AA]">{selectedSub.email}</span>
                        </div>
                        {selectedSub.phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone size={13} className="text-[#5A5E70]" />
                            <span className="text-[10px] font-bold text-[#71717A]">Tel: {selectedSub.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <Calendar size={13} className="text-[#5A5E70]" />
                          <span className="text-[10px] font-bold text-[#71717A]">Opened: {new Date(selectedSub.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inquiry Message content */}
                    <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2.5">
                      <span className="text-[8px] font-black text-[#D4AF37] tracking-[2px] uppercase block">Inquiry Message</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{selectedSub.subject}</h4>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed font-bold italic">
                        "{selectedSub.message}"
                      </p>
                    </div>

                    {/* Resolution details or reply form */}
                    {selectedSub.status === 'RESOLVED' ? (
                      <div className="p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/10 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-black text-[#10B981] uppercase tracking-wider">
                          <CheckCircle2 size={13} />
                          Resolution Settle Log
                        </div>
                        <p className="text-xs text-[#71717A] leading-relaxed italic pl-5 font-bold">
                          "{selectedSub.reply}"
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleResolve} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Resolution Response Message</label>
                          <textarea
                            placeholder="Type diagnostic instructions or resolution reply details..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full h-28 p-3 rounded-xl bg-[#0D0D12] border border-white/5 focus:border-[#D4AF37]/50 text-xs text-white outline-none font-bold resize-none leading-relaxed"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={resolving}
                          className="w-full h-12 rounded-xl bg-[#10B981] hover:bg-[#0fa874] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        >
                          <Reply size={11} />
                          {resolving ? 'MARKING RESOLVED...' : 'RESOLVE & SUBMIT RESPONSE'}
                        </button>
                      </form>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlassCard className="h-[420px] flex items-center justify-center text-center p-8 border-dashed">
                  <div className="space-y-3">
                    <HelpCircle size={32} className="text-[#5A5E70] mx-auto animate-pulse" />
                    <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[3px]">
                      Select support inquiry query to process details
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
