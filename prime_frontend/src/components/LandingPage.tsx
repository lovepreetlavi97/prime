'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { 
  Zap, 
  BrainCircuit, 
  Bell, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const router = useRouter();

  const handleStart = () => {
    router.push('/login');
  };

  return (
    <div className="h-screen w-screen bg-black text-white font-sans overflow-y-auto overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] scroll-smooth">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#D4AF37]/10 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-b from-[#22C55E]/5 to-transparent blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header Navbar */}
        <header className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between z-50">
          <Logo size="md" />
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/login')}
              className="text-xs font-black uppercase tracking-widest text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
            <button 
              onClick={handleStart}
              className="h-10 px-6 bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] hover:opacity-90 active:scale-95 text-black font-black uppercase tracking-[1.5px] text-[10px] rounded-full transition-all shadow-[0_4px_15px_rgba(212,175,55,0.25)] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 py-12 md:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text & CTAs */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              {/* Premium Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/10">
                <Sparkles size={12} className="text-[#D4AF37]" />
                <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[3px]">Institutional Signals Engine</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight font-outfit">
                You've seen trades work... <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] filter drop-shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  just not when you took them.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm md:text-base text-[#A1A1AA] font-bold leading-relaxed max-w-xl mx-auto lg:mx-0">
                Entered late. Exited early. Or completely missed the layout. PRIME`TRADE` delivers precise entries, target ranges, and stop-loss levels before the crowd moves.
              </p>

              {/* CTAs */}
              <div className="space-y-4">
                <button 
                  onClick={handleStart}
                  className="w-full sm:w-auto h-14 px-10 bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] hover:opacity-90 active:scale-95 text-black font-black uppercase tracking-[3px] text-xs rounded-full transition-all shadow-[0_8px_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 mx-auto lg:mx-0 cursor-pointer"
                >
                  <Zap size={14} className="fill-black stroke-none" />
                  Start Free Trial
                </button>
                <p className="text-[10px] font-black uppercase text-[#71717A] tracking-[1.5px]">
                  No credit card required • Instant access
                </p>
              </div>
            </div>

            {/* Right Column: Floating Mock Trading Card */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[360px] bg-[#141414] border border-[#D4AF37]/25 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(212,175,55,0.1)] relative overflow-hidden group"
              >
                {/* Glow border overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-30 pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-full">
                      OBSIDIAN SETUP
                    </span>
                    <h3 className="text-xl font-black italic uppercase text-white tracking-tight mt-2.5">
                      NIFTY 23550 CE
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">ENTRY ZONE</span>
                    <span className="text-sm font-black text-[#D4AF37] font-mono">125.00 - 128.00</span>
                  </div>
                  <div className="p-3 bg-black/40 border border-white/5 rounded-xl">
                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-wider block">CURRENT</span>
                    <span className="text-sm font-black text-[#22C55E] font-mono">134.50</span>
                  </div>
                </div>

                {/* Targets Slider */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[9px] font-black text-zinc-500 tracking-wider">
                    <span>STOP LOSS (98.00)</span>
                    <span className="text-[#22C55E]">T1 HIT (155.00)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-red-500 via-[#D4AF37] to-[#22C55E] w-[70%]" />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-zinc-500">
                    <span>Risk: -22%</span>
                    <span className="text-[#22C55E]">T1 Achieved: +24%</span>
                  </div>
                </div>

                {/* Bullet Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                    <TrendingUp size={12} className="text-[#22C55E]" />
                    <span>Imbalance breakout confirmed by institutional order book</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                    <BrainCircuit size={12} className="text-[#D4AF37]" />
                    <span>Avoid emotional chasing — execution ready</span>
                  </div>
                </div>

                {/* Mock CTA */}
                <div className="w-full py-3.5 bg-white/[0.02] border border-white/5 rounded-2xl text-center text-[10px] font-black uppercase tracking-[2px] text-zinc-500">
                  Setup locked. Join Premium to view.
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* Features Section */}
        <section className="bg-black py-16 md:py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6 w-full space-y-16">
            
            {/* Header Text */}
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[3px]">ELITE CAPABILITIES</span>
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase font-outfit">
                Avoid emotional trades. <span className="text-[#D4AF37]">Trade with structure.</span>
              </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature 1 */}
              <div className="bg-[#0E2F1F]/40 border border-emerald-500/10 rounded-[28px] p-8 flex flex-col justify-between min-h-[220px] transition-all hover:border-emerald-500/30">
                <div className="w-10 h-10 rounded-full bg-[#0E2F1F] border border-emerald-500/25 flex items-center justify-center text-[#22C55E]">
                  <TrendingUp size={18} />
                </div>
                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-white">Real-Time Signals</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Get precise entry, exit, and stop-loss levels before the crowd moves.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#302710]/40 border border-amber-500/10 rounded-[28px] p-8 flex flex-col justify-between min-h-[220px] transition-all hover:border-amber-500/30">
                <div className="w-10 h-10 rounded-full bg-[#302710] border border-amber-500/25 flex items-center justify-center text-[#D4AF37]">
                  <BrainCircuit size={18} />
                </div>
                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-white">AI Guidance</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Avoid emotional trades with intelligent market structure analysis.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#331414]/40 border border-rose-500/10 rounded-[28px] p-8 flex flex-col justify-between min-h-[220px] transition-all hover:border-rose-500/30">
                <div className="w-10 h-10 rounded-full bg-[#331414] border border-rose-500/25 flex items-center justify-center text-red-500">
                  <Bell size={18} />
                </div>
                <div className="space-y-2 mt-6">
                  <h3 className="text-lg font-black italic uppercase tracking-tight text-white">Instant Alerts</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Never miss a setup with real-time push notifications.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-black py-16 md:py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 w-full space-y-16">
            
            {/* Header Text */}
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[3px]">THE DIFFERENCE</span>
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase font-outfit">
                Why Elite Traders Choose <span className="text-[#D4AF37]">PRIME`TRADE`</span>
              </h2>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Without Card */}
              <div className="bg-[#0E0E0E] border border-white/5 rounded-[32px] p-8 space-y-6">
                <h4 className="text-sm font-black uppercase text-[#EF4444] tracking-wider flex items-center gap-2">
                  <XCircle size={16} />
                  Without PRIME`TRADE`
                </h4>
                <ul className="space-y-4">
                  {[
                    "Enter after the move is gone",
                    "Emotional decision making",
                    "No clear entry/exit plan",
                    "Miss high-probability setups"
                  ].map((bullet, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* With Card */}
              <div className="bg-[#141414] border border-[#D4AF37]/35 rounded-[32px] p-8 space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                <h4 className="text-sm font-black uppercase text-[#22C55E] tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#22C55E]" />
                  With PRIME`TRADE`
                </h4>
                <ul className="space-y-4">
                  {[
                    "Enter before the crowd",
                    "AI-guided structured approach",
                    "Clear entries, targets, stop loss",
                    "Capture every clean setup"
                  ].map((bullet, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section className="bg-black py-20 md:py-28 border-t border-white/5 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 w-full space-y-8 relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase font-outfit">
              Stop Trading Late. <br />
              <span className="text-[#D4AF37]">Start Trading Smart.</span>
            </h2>
            
            <p className="text-xs md:text-sm text-zinc-400 font-bold max-w-md mx-auto leading-relaxed">
              Get immediate access to institutional-level alerts and option strategies inside our premium private feed.
            </p>

            <div className="space-y-4 pt-4">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto h-14 px-12 bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] hover:opacity-90 active:scale-95 text-black font-black uppercase tracking-[3px] text-xs rounded-full transition-all shadow-[0_8px_30px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2.5 mx-auto cursor-pointer"
              >
                <Zap size={14} className="fill-black stroke-none" />
                Start Free Trial
              </button>
              <p className="text-[10px] font-black uppercase text-[#71717A] tracking-[1.5px]">
                No credit card required • Instant access
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black border-t border-white/5 py-8 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© {new Date().getFullYear()} PRIME`TRADE`. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-zinc-400">Terms of Service</a>
              <a href="#" className="hover:text-zinc-400">Privacy Policy</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
