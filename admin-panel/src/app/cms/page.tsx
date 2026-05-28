'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminStore } from '../../store/useAdminStore';
import { GlassCard } from '../../components/GlassCard';
import { Save, FileText, Globe, Sparkles, Plus, Trash2, ShieldCheck, Heart, Terminal } from 'lucide-react';

export default function CMSPage() {
  const { 
    fetchHomeContent, updateHomeContent, fetchLegalDocument, updateLegalDocument, setActiveTab
  } = useAdminStore();

  const [activeSubTab, setActiveSubTab] = useState<'LANDING' | 'LEGAL'>('LANDING');

  // Landing page form states
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [heroCta, setHeroCta] = useState('');
  const [anticipation, setAnticipipation] = useState('');
  const [lastSignal, setLastSignal] = useState('');
  const [trust, setTrust] = useState('');
  const [locked, setLocked] = useState('');
  const [upgradeHeadline, setUpgradeHeadline] = useState('');
  const [upgradeSubtext, setUpgradeSubtext] = useState('');
  const [upgradeCta, setUpgradeCta] = useState('');

  // Lists (Waiting state messages, guidance advice, micro-lines)
  const [waitingMessages, setWaitingMessages] = useState<string[]>([]);
  const [newWaitMsg, setNewWaitMsg] = useState('');
  const [guidanceList, setGuidanceList] = useState<string[]>([]);
  const [newGuidanceMsg, setNewGuidanceMsg] = useState('');
  const [microLines, setMicroLines] = useState<string[]>([]);
  const [newMicroMsg, setNewMicroMsg] = useState('');

  // Legal documents states
  const [selectedDocType, setSelectedDocType] = useState<'privacy_policy' | 'terms_and_conditions' | 'about_us' | 'faq' | 'support'>('privacy_policy');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab('cms');
    loadLandingData();
  }, [setActiveTab]);

  const loadLandingData = async () => {
    setLoading(true);
    const data = await fetchHomeContent();
    if (data) {
      setHeroHeadline(data.hero?.headline || '');
      setHeroSubtext(data.hero?.subtext || '');
      setHeroCta(data.hero?.cta || '');
      setAnticipipation(data.anticipation || '');
      setLastSignal(data.lastSignal || '');
      setTrust(data.trust || '');
      setLocked(data.locked || '');
      setUpgradeHeadline(data.upgrade?.headline || '');
      setUpgradeSubtext(data.upgrade?.subtext || '');
      setUpgradeCta(data.upgrade?.cta || '');
      setWaitingMessages(data.waitingState || []);
      setGuidanceList(data.guidance || []);
      setMicroLines(data.microLines || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeSubTab === 'LEGAL') {
      loadLegalDoc(selectedDocType);
    }
  }, [activeSubTab, selectedDocType]);

  const loadLegalDoc = async (type: typeof selectedDocType) => {
    setLoading(true);
    const doc = await fetchLegalDocument(type);
    if (doc) {
      setDocTitle(doc.title || '');
      setDocContent(doc.content || '');
    }
    setLoading(false);
  };

  const handleSaveLanding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      hero: { headline: heroHeadline, subtext: heroSubtext, cta: heroCta },
      waitingState: waitingMessages,
      anticipation,
      lastSignal,
      trust,
      guidance: guidanceList,
      upgrade: { headline: upgradeHeadline, subtext: upgradeSubtext, cta: upgradeCta },
      locked,
      microLines
    };
    await updateHomeContent(payload);
    setLoading(false);
    alert('Homepage CMS details saved and published live! 🚀');
  };

  const handleSaveLegal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateLegalDocument(selectedDocType, docTitle, docContent);
    setLoading(false);
    alert('Legal document updated and synchronized successfully! 📜');
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[3px]">Ecosystem Copywriting Engine</span>
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight leading-none">
            CMS & <span className="text-[#D4AF37]">COPYWRITING</span>
          </h2>
          <p className="text-[10px] font-black text-[#5A5E70] uppercase tracking-[4px]">
            Manage landing copy, live scanners queue lines, VIP upgrade copy, and legal documents
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setActiveSubTab('LANDING')}
          className={`px-5 h-11 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'LANDING' 
              ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
              : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          <Globe size={12} />
          Landing & App Copy
        </button>
        <button
          onClick={() => setActiveSubTab('LEGAL')}
          className={`px-5 h-11 rounded-xl text-[9px] font-black tracking-[1.5px] uppercase border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'LEGAL' 
              ? 'bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
              : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
          }`}
        >
          <FileText size={12} />
          Legal Pages & Docs
        </button>
      </div>

      {loading && (
        <div className="text-xs text-[#D4AF37] font-bold animate-pulse tracking-widest uppercase pl-1">SYNCING ECOSYSTEM CMS CACHE...</div>
      )}

      <AnimatePresence mode="wait">
        {activeSubTab === 'LANDING' ? (
          <motion.form 
            key="landing-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSaveLanding} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Hero Copy */}
              <GlassCard title="Hero & CTA Section" hasGlow={true}>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Headline Text</label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Sub-paragraph / Value Prop</label>
                    <textarea
                      value={heroSubtext}
                      onChange={(e) => setHeroSubtext(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold resize-none leading-relaxed focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Button Call-To-Action</label>
                    <input
                      type="text"
                      value={heroCta}
                      onChange={(e) => setHeroCta(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Premium Upgrade Bannercopy */}
              <GlassCard title="Pro Subscription Upgrade Screen Copy">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Upgrade Headline</label>
                    <input
                      type="text"
                      value={upgradeHeadline}
                      onChange={(e) => setUpgradeHeadline(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Upgrade Subtext Copy</label>
                    <textarea
                      value={upgradeSubtext}
                      onChange={(e) => setUpgradeSubtext(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold resize-none leading-relaxed focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Upgrade Button CTA</label>
                    <input
                      type="text"
                      value={upgradeCta}
                      onChange={(e) => setUpgradeCta(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* FOMO Status & Messages */}
              <GlassCard title="Friction & FOMO Elements">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Anticipation Ticker Line (e.g. Next Signal Triggering...)</label>
                    <input
                      type="text"
                      value={anticipation}
                      onChange={(e) => setAnticipipation(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Last Closed Signal Result Announcement</label>
                    <input
                      type="text"
                      value={lastSignal}
                      onChange={(e) => setLastSignal(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Locked Signals Blurring Explanation Box</label>
                    <textarea
                      value={locked}
                      onChange={(e) => setLocked(e.target.value)}
                      className="w-full h-20 p-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold resize-none leading-relaxed focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* Trust and Psychology advice */}
              <GlassCard title="Trader Trust & Psychology Content">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Global Trust Statement</label>
                    <textarea
                      value={trust}
                      onChange={(e) => setTrust(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold resize-none leading-relaxed focus:border-[#D4AF37]/50"
                    />
                  </div>
                </div>
              </GlassCard>

              {/* List management for Waiting Messages */}
              <GlassCard title="Interactive Waiting Lines">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add scanning queue line..."
                      value={newWaitMsg}
                      onChange={(e) => setNewWaitMsg(e.target.value)}
                      className="flex-grow h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newWaitMsg) {
                          setWaitingMessages([...waitingMessages, newWaitMsg]);
                          setNewWaitMsg('');
                        }
                      }}
                      className="px-4 rounded-xl bg-[#D4AF37] text-black font-black text-[10px] tracking-wider uppercase cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    <AnimatePresence>
                      {waitingMessages.map((msg, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs"
                        >
                          <span className="text-[#A1A1AA] font-bold">{msg}</span>
                          <button
                            type="button"
                            onClick={() => setWaitingMessages(waitingMessages.filter((_, i) => i !== idx))}
                            className="text-[#EF4444] hover:underline cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassCard>

              {/* List management for guidance list */}
              <GlassCard title="Live Trading Guidance Rules">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add trading guidance advice..."
                      value={newGuidanceMsg}
                      onChange={(e) => setNewGuidanceMsg(e.target.value)}
                      className="flex-grow h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newGuidanceMsg) {
                          setGuidanceList([...guidanceList, newGuidanceMsg]);
                          setNewGuidanceMsg('');
                        }
                      }}
                      className="px-4 rounded-xl bg-[#D4AF37] text-black font-black text-[10px] tracking-wider uppercase cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    <AnimatePresence>
                      {guidanceList.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs"
                        >
                          <span className="text-[#A1A1AA] font-bold">{msg}</span>
                          <button
                            type="button"
                            onClick={() => setGuidanceList(guidanceList.filter((_, i) => i !== idx))}
                            className="text-[#EF4444] hover:underline cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassCard>

              {/* List management for micro lines */}
              <GlassCard title="App Footer Micro-motivation Affirmations">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add micro affirmation line..."
                      value={newMicroMsg}
                      onChange={(e) => setNewMicroMsg(e.target.value)}
                      className="flex-grow h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/30"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMicroMsg) {
                          setMicroLines([...microLines, newMicroMsg]);
                          setNewMicroMsg('');
                        }
                      }}
                      className="px-4 rounded-xl bg-[#D4AF37] text-black font-black text-[10px] tracking-wider uppercase cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    <AnimatePresence>
                      {microLines.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex justify-between items-center p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs"
                        >
                          <span className="text-[#A1A1AA] font-bold">{msg}</span>
                          <button
                            type="button"
                            onClick={() => setMicroLines(microLines.filter((_, i) => i !== idx))}
                            className="text-[#EF4444] hover:underline cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </GlassCard>

            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#D4AF37] hover:bg-[#cfa52f] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Save size={13} />
              Publish Copywriting Updates Live
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="legal-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSaveLegal} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-3 space-y-2">
                <span className="text-[9px] font-black uppercase text-[#5A5E70] tracking-wider block mb-2 pl-1">Select Legal Page</span>
                {(['privacy_policy', 'terms_and_conditions', 'about_us', 'faq', 'support'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedDocType(type)}
                    className={`w-full flex items-center gap-3 px-4 h-12 rounded-xl text-[10px] font-black tracking-wider uppercase border text-left transition-all duration-300 cursor-pointer ${
                      selectedDocType === type 
                        ? 'bg-amber-500/10 border-[#D4AF37]/45 text-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.05)]' 
                        : 'bg-[#0A0D18] border-white/5 text-[#5A5E70] hover:text-white hover:bg-white/[0.01]'
                    }`}
                  >
                    <FileText size={13} />
                    {type.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="lg:col-span-9">
                <GlassCard title={`Editing: ${selectedDocType.replace(/_/g, ' ').toUpperCase()}`}>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Page Title</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold focus:border-[#D4AF37]/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#71717A] tracking-wider pl-1">Page Content Body (HTML/Markdown support)</label>
                      <textarea
                        value={docContent}
                        onChange={(e) => setDocContent(e.target.value)}
                        className="w-full h-[320px] p-4 rounded-xl bg-[#0D0D12] border border-white/5 text-xs text-white outline-none font-bold resize-none leading-relaxed font-mono focus:border-[#D4AF37]/50"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#D4AF37] hover:bg-[#cfa52f] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Save size={13} />
                      Sync & Publish Document
                    </button>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
