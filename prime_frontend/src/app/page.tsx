'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSignalStore } from '@/store/useSignalStore';
import { useShallow } from 'zustand/react/shallow';
import { LuxurySignalCard } from '@/components/LuxurySignalCard';
import { MarketOverviewBar } from '@/components/MarketOverviewBar';
import { MobileHeader } from '@/components/MobileHeader';
import { GlobalBottomNav } from '@/components/GlobalBottomNav';
import { Logo } from '@/components/Logo';
import { ConnectivityBanner } from '@/components/ConnectivityBanner';

// ⚡ Dynamic Import for LandingPage to reduce initial dashboard bundle size
const LandingPage = dynamic(() => import('@/components/LandingPage').then(mod => mod.LandingPage), {
  loading: () => <div className="min-h-screen bg-[#060606] flex items-center justify-center text-zinc-500 uppercase tracking-widest text-xs">Loading...</div>
});

import { 
  Home as HomeIcon, 
  Zap, 
  Crown, 
  User, 
  History, 
  ShieldCheck, 
  Loader2, 
  Sparkles, 
  Radio, 
  RefreshCw, 
  AlertTriangle, 
  Plus, 
  Eye, 
  Key, 
  Trash2, 
  BrainCircuit, 
  Bell, 
  TrendingUp, 
  Activity, 
  Compass, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { API_URL, SOCKET_URL } from '@/config';

// ⚡ Memoized StatItem
const StatItem = React.memo(({ label, value, color, dot, subValue }: { label: string; value: string; color?: string; dot?: boolean; subValue?: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-[16px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-[#D4AF37]/20 transition-all">
    <div className="flex items-center gap-1 mb-0.5">
      {dot && <div className={`w-1 h-1 rounded-full ${color?.replace('text-', 'bg-') || 'bg-[#D4AF37]'} animate-pulse shadow-[0_0_8px_currentColor]`} />}
      <span className="text-[7px] font-black text-[#71717A] uppercase tracking-[2px]">{label}</span>
    </div>
    <div className="flex flex-col items-center">
      <span className={`text-[11px] font-black uppercase tracking-tight ${color || 'text-white'}`}>{value}</span>
      {subValue && <span className="text-[7px] font-bold text-[#A1A1AA] opacity-40">{subValue}</span>}
    </div>
  </div>
));
StatItem.displayName = 'StatItem';

// ⚡ Memoized MiniCandlestickChart
const MiniCandlestickChart = React.memo(() => (
  <div className="flex items-end gap-1.5 h-14 justify-center select-none">
    {[
      { h: 35, w: 4, isUp: true, offset: 10 },
      { h: 22, w: 4, isUp: false, offset: 15 },
      { h: 48, w: 4, isUp: true, offset: 5 },
      { h: 32, w: 4, isUp: true, offset: 12 },
      { h: 18, w: 4, isUp: false, offset: 8 },
      { h: 42, w: 4, isUp: true, offset: 2 },
      { h: 28, w: 4, isUp: false, offset: 18 },
      { h: 52, w: 4, isUp: true, offset: 0 }
    ].map((c, i) => (
      <div key={i} className="flex flex-col items-center h-full justify-end relative" style={{ width: c.w }}>
        {/* Wick */}
        <div className={`absolute w-[1px] h-10 ${c.isUp ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} opacity-40`} style={{ bottom: c.offset }} />
        {/* Body */}
        <div className={`w-full rounded-sm ${c.isUp ? 'bg-gradient-to-t from-[#22C55E] to-[#80ED99]' : 'bg-gradient-to-t from-[#EF4444] to-[#FF85A2]'}`} style={{ height: c.h * 0.5 }} />
      </div>
    ))}
  </div>
));
MiniCandlestickChart.displayName = 'MiniCandlestickChart';

// ⚡ Memoized EquityLineChart
const EquityLineChart = React.memo(() => (
  <div className="w-full h-24 relative mt-2 select-none">
    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Gradient Area */}
      <path
        d="M0,80 Q50,60 100,75 T200,35 T300,15 L300,100 L0,100 Z"
        fill="url(#chartGlow)"
      />
      {/* Chart Line */}
      <motion.path
        d="M0,80 Q50,60 100,75 T200,35 T300,15"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* End Point Glow */}
      <circle cx="300" cy="15" r="4" fill="#FFC857" className="animate-ping" />
      <circle cx="300" cy="15" r="2.5" fill="#D4AF37" />
    </svg>
  </div>
));
EquityLineChart.displayName = 'EquityLineChart';

export default function Dashboard() {
  const router = useRouter();

  const {
    signals,
    loading,
    connect,
    isConnected,
    refreshSignals,
    user,
    isHydrated,
    isRealtimeReady,
    isBootstrapping,
    forceHydrate,
    telegramStatus,
    activeTab,
    setActiveTab,
    marketPrices,
    homeContent
  } = useSignalStore(
    useShallow((state) => ({
      signals: state.signals,
      loading: state.loading,
      connect: state.connect,
      isConnected: state.isConnected,
      refreshSignals: state.refreshSignals,
      user: state.user,
      isHydrated: state.isHydrated,
      isRealtimeReady: state.isRealtimeReady,
      isBootstrapping: state.isBootstrapping,
      forceHydrate: state.forceHydrate,
      telegramStatus: state.telegramStatus,
      activeTab: state.activeTab,
      setActiveTab: state.setActiveTab,
      marketPrices: state.marketPrices,
      homeContent: state.homeContent
    }))
  );

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [timedOut, setTimedOut] = useState(false);
  const [hydratedByWatchdog, setHydratedByWatchdog] = useState(false);
  const [tick, setTick] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  // --- PROFILE STATE ---
  const [profileName, setProfileName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // --- ADVANCED INDICATORS STATE ---
  const [activeTimeframe, setActiveTimeframe] = useState('5M');
  const [enabledIndicators, setEnabledIndicators] = useState({
    EMA: true,
    RSI: false,
    MACD: false
  });

  // --- HOLOGRAPHIC AI ASSISTANT ORB STATE ---
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Secure holographic link secured. Ask me about support zones, whale clusters, or today\'s PCR bias.' }
  ]);

  // --- ADMIN-CONTROLLED SCANNING TEXT ROTATOR ---
  const [scanIndex, setScanIndex] = useState(0);
  const defaultWaitingLines = useMemo(() => [
    "Scanning order books for institutional setups...",
    "Watching volume imbalances on BANKNIFTY Spot...",
    "Avoiding late entries & emotional chasings...",
    "Whale transaction tracking modules engaged...",
    "Patience protects capital. Stand by..."
  ], []);

  const scanningLines = useMemo(() => {
    if (homeContent?.waitingState && homeContent.waitingState.length > 0) {
      return homeContent.waitingState;
    }
    return defaultWaitingLines;
  }, [homeContent, defaultWaitingLines]);

  useEffect(() => {
    const scanTimer = setInterval(() => {
      setScanIndex(prev => (prev + 1) % scanningLines.length);
    }, 3000);
    return () => clearInterval(scanTimer);
  }, [scanningLines]);

  // Splash timeout
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.username || user.name || 'Hedge Fund Member');
    }
  }, [user]);

  // UI Tick
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  // Startup Watchdogs
  useEffect(() => {
    const hTimer = setTimeout(() => {
      if (!isHydrated) {
        setHydratedByWatchdog(true);
        forceHydrate();
      }
    }, 3000);

    const bTimer = setTimeout(() => {
      if (isBootstrapping && !isRealtimeReady) {
        setTimedOut(true);
      }
    }, 10000);

    return () => {
      clearTimeout(hTimer);
      clearTimeout(bTimer);
    };
  }, [isHydrated, isBootstrapping, isRealtimeReady, forceHydrate]);

  // Bootstrap lifecycle
  useEffect(() => {
    if (!isHydrated && !hydratedByWatchdog) return;

    const bootstrap = async () => {
      try {
        await refreshSignals();
        connect(SOCKET_URL);
      } catch (err) {
        console.error('Bootstrap Failed:', err);
      }
    };
    bootstrap();
  }, [isHydrated, hydratedByWatchdog, connect]);

  const isPro = user?.role === 'ADMIN' || (
    user?.subscription?.isActive &&
    user?.subscription?.plan !== 'free' &&
    (!user?.subscription?.endDate || new Date(user.subscription.endDate) > new Date())
  );

  const stats = useMemo(() => {
    const wins = signals.filter(s => s.status === 'PROFIT' || s.status === 'CLOSED_PROFIT' || s.status === 'TARGET_HIT').length;
    const losses = signals.filter(s => s.status === 'CLOSED_LOSS' || s.status === 'SL_HIT' || s.status === 'EXIT_ALERT').length;
    const total = wins + losses;
    const aiConfidence = total > 0 ? ((wins / total) * 100).toFixed(0) : '92';
    const profitPoints = signals.reduce((acc, sig) => {
      const profit = (sig.currentPrice || sig.entry) - sig.entry;
      return acc + profit;
    }, 0);
    const momentumBias = wins >= losses ? 'BULLISH' : 'NEUTRAL';
    return { wins, losses, aiConfidence, profitPoints, momentumBias };
  }, [signals]);

  // Update profile name
  const handleUpdateName = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName })
      });
      if (res.ok) {
        setIsEditingName(false);
        refreshSignals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const latestSignal = useMemo(() => signals.find(s => {
    const isTerminal = ['SL_HIT', 'EXIT_ALERT', 'EXIT', 'PROFIT_BOOKED', 'CLOSED_PROFIT', 'CLOSED_LOSS'].includes(s.status) || s.status.startsWith('CLOSED');
    if (!isTerminal) return true;
    if (s.statusChangedAt) {
      return (Date.now() - new Date(s.statusChangedAt).getTime()) < 20 * 1000;
    }
    return false;
  }), [signals, tick]);

  const filteredHistory = useMemo(() => {
    let historySignals = signals.filter(s => s._id !== latestSignal?._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    historySignals = historySignals.filter(s => {
      const signalDate = new Date(s.createdAt || Date.now());
      signalDate.setHours(0, 0, 0, 0);
      return signalDate.getTime() === today.getTime();
    });

    if (activeFilter !== 'ALL') {
      historySignals = historySignals.filter(s => s.symbol.toUpperCase().includes(activeFilter));
    }
    return historySignals.slice(0, 8);
  }, [signals, latestSignal, activeFilter]);

  const mockSystemAlerts = useMemo(() => [
    { id: 1, type: 'SIGNAL', title: 'NIFTY 23550 CE Breakout', desc: 'Bullish order book block detected at 23500 support level.', time: '2m ago' },
    { id: 2, type: 'VOLATILITY', title: 'India VIX Spiked 2.1%', desc: 'Option decay speed accelerating. Scalpers switch to 3M timeframe charts.', time: '12m ago' },
    { id: 3, type: 'WHALE', title: 'Institutional Smart Money Inflow', desc: '₹2,480 Cr block purchase logged on banking weight sectors.', time: '40m ago' },
    { id: 4, type: 'CALENDAR', title: 'Macro Event Warning', desc: 'RBI repo rate meeting guidelines release in 2 hours. High volatility predicted.', time: '1h ago' }
  ], []);

  const shouldWait = !isHydrated || (isBootstrapping && !timedOut && !user);

  if (shouldWait) {
    return (
      <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-[#D4AF37] animate-spin" />
          <Crown className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37]" size={20} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[4px] animate-pulse">
            Connecting to Scanners...
          </span>
          <span className="text-[8px] font-bold text-[#A1A1AA] uppercase tracking-[2px]">PRIMETRADE QUANT TERMINAL</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const formatPrice = (price?: number) => price ? price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '--';

  return (
    <div className="h-screen w-screen flex bg-[#060606] overflow-hidden text-white font-sans selection:bg-[#D4AF37]/30">
      <ConnectivityBanner />

      {/* 🌌 FUTURISTIC ORBITAL SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[9999] bg-[#060606] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Pulsing orbital rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute w-[80%] h-[80%] rounded-full border border-double border-[#FFC857]/15"
              />
              {/* Glowing orbital horizontal line */}
              <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent animate-pulse" />
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="flex flex-col items-center gap-4 relative z-10"
              >
                {/* Animated Monogram "PT" */}
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-[#D4AF37] to-[#FFC857] tracking-widest italic filter drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] select-none">
                  PT
                </div>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                <h1 className="text-xl font-black uppercase tracking-[8px] text-white">
                  PRIMETRADE
                </h1>
                <p className="text-[9px] font-bold text-[#FFC857] uppercase tracking-[4px] mt-1">
                  Institutional Signals Engine
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👑 DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0E0E0E] border-r border-white/5 p-6 justify-between select-none shrink-0">
        <div className="space-y-8">
          <Logo size="md" />

          <nav className="space-y-2">
            {[
              { id: 'home', label: 'Overview Dashboard', icon: HomeIcon },
              { id: 'signals', label: 'Live Signals Feed', icon: Radio },
              { id: 'insights', label: 'Advanced Scanners', icon: Sparkles },
              { id: 'alerts', label: 'Alert Center', icon: Bell },
              { id: 'profile', label: 'Identity & Security', icon: User },
            ].map((item) => {
              const active = activeTab === item.id || (item.id === 'home' && activeTab === 'home');
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-2 border-[#D4AF37] text-white' 
                      : 'text-[#A1A1AA] hover:bg-white/[0.02] hover:text-white'
                  }`}
                >
                  <item.icon size={16} className={active ? 'text-[#D4AF37]' : 'text-[#A1A1AA]'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs uppercase text-amber-500 border border-[#D4AF37]/20">
              {user?.role === 'ADMIN' ? 'AD' : 'OB'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{user?.username || user?.name || 'Hedge Fund Session'}</p>
              <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-wider">
                {isPro ? 'OBSIDIAN VIP' : 'FREE TIER'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold text-[#71717A] px-1 uppercase tracking-widest">
            <span>ORBIT NODE</span>
            <span className={isConnected ? 'text-[#22C55E] flex items-center gap-1' : 'text-red-500 flex items-center gap-1'}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {isConnected ? 'SECURED' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <MobileHeader />
        <MarketOverviewBar />

        {/* 💎 MULTI-COLUMN TERMINAL FOR DESKTOP VIEWS */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-8 flex justify-center">
          <div className="w-full max-w-7xl px-4 py-6 mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Center Area */}
            <main className="col-span-1 lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                
                {/* 1. HOME VIEW */}
                {activeTab === 'home' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Performance strip stats */}
                    <div className="flex justify-between items-center py-4 border-b border-white/5 px-2 bg-white/[0.01] rounded-3xl gap-1 max-w-xl mx-auto lg:mx-0">
                      <StatItem label="Precision" value={`${stats.wins}W ${stats.losses}L`} color={stats.wins > stats.losses ? 'text-[#22C55E]' : 'text-red-500'} />
                      <StatItem label="AI Score" value={`${stats.aiConfidence}%`} color="text-[#D4AF37]" />
                      <StatItem label="Total Return" value={`${stats.profitPoints >= 0 ? '+' : ''}${((stats.profitPoints / (signals.reduce((a, s) => a + s.entry, 0) || 1)) * 100).toFixed(1)}%`} color={stats.profitPoints >= 0 ? 'text-[#22C55E]' : 'text-red-500'} />
                      <StatItem label="Quant Net" value={telegramStatus?.connected ? 'READY' : 'SCAN'} color={telegramStatus?.connected ? 'text-[#22C55E]' : 'text-[#D4AF37]'} dot />
                    </div>

                    {/* HERO SECTION */}
                    <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#141414] to-[#0E0E0E] border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <BrainCircuit size={100} className="text-[#D4AF37]" />
                      </div>
                      <div className="space-y-3 max-w-lg">
                        <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase leading-tight">
                          {homeContent?.hero?.headline || "You’ve seen trades work… just not when you took them."}
                        </h2>
                        <p className="text-[11px] md:text-xs text-[#A1A1AA] font-bold leading-relaxed whitespace-pre-line">
                          {homeContent?.hero?.subtext || "Entered late. Exited early. Or skipped the right one.\n\nThis removes that confusion.\n\nClear signals. Clear entry. Clear exit."}
                        </p>
                      </div>
                    </div>

                    {/* ANTICIPATION STRIP */}
                    <div className="h-10 bg-[#141414] border border-white/5 rounded-xl flex items-center overflow-hidden relative select-none">
                      <div className="absolute left-4 z-10 h-full flex items-center bg-[#141414] pr-3 text-[9px] font-black text-[#F6D365] uppercase tracking-widest border-r border-white/5">
                        STATUS
                      </div>
                      <div className="flex-1 overflow-hidden whitespace-nowrap pl-24">
                        <motion.div
                          animate={{ x: [0, -400] }}
                          transition={{ repeat: Infinity, ease: 'linear', duration: 15 }}
                          className="inline-block text-[9px] font-black text-zinc-500 uppercase tracking-[2px] pr-20"
                        >
                          {homeContent?.anticipation || "🟡 Next institutional signal can trigger anytime. Real-time scanning models active."}
                        </motion.div>
                      </div>
                    </div>

                    {/* ACTIVE OR WAITING SIGNAL CARD */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-[#D4AF37] tracking-[3px]">Institutional Setup</h3>
                      {latestSignal ? (
                        <LuxurySignalCard signal={latestSignal} index={0} isPro={isPro} />
                      ) : (
                        <div className="w-full bg-[#141414] border border-[#D4AF37]/10 rounded-[32px] p-8 text-center space-y-6 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/5 to-transparent opacity-30" />
                          <Sparkles size={28} className="text-[#D4AF37]/30 mx-auto animate-pulse" />
                          <div className="space-y-2">
                            <h3 className="text-xl font-black italic uppercase tracking-tight">Setup Engine <span className="text-[#D4AF37]">Active</span></h3>
                            {/* Rotating AI Line */}
                            <AnimatePresence mode="wait">
                              <motion.p
                                key={scanIndex}
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -5, opacity: 0 }}
                                className="text-[10px] font-bold text-[#FFC857] uppercase tracking-[2.5px] min-h-[14px]"
                              >
                                {scanningLines[scanIndex]}
                              </motion.p>
                            </AnimatePresence>
                          </div>
                          {!isPro && (
                            <button
                              onClick={() => setActiveTab('profile')}
                              className="w-full h-14 bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] text-black rounded-2xl font-black uppercase tracking-[3px] text-[10px] relative z-10 active:scale-95 transition-all shadow-[0_10px_25px_rgba(212,175,55,0.2)]"
                            >
                              Go Premium VIP 🔥
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* AI GUIDANCE SECTION */}
                    <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#D4AF37]">
                        <Compass size={14} />
                        <span>AI Guidance Rules</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(homeContent?.guidance || [
                          "Wait for the entry zone",
                          "Do not chase price after breakout",
                          "Always respect stop loss",
                          "Book profits step by step"
                        ]).map((rule: string, i: number) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-400 font-bold">
                            <span className="text-[#D4AF37] font-black">{i + 1}.</span>
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LAST RESULT & UPGRADE CARD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Last Result */}
                      <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#71717A]">Last Setup Result</span>
                        <div className="my-6">
                          <h4 className="text-3xl font-black italic tracking-tighter text-[#22C55E]">+78%</h4>
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-[2px] mt-1">NIFTY Option Scalp in 6m</p>
                        </div>
                        <span className="text-[9px] font-semibold text-zinc-500">
                          {homeContent?.lastSignal || "Last Signal: +78% in 6 minutes — most people saw it, few followed it."}
                        </span>
                      </div>

                      {/* Upgrade Block */}
                      <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#141414] to-[#D4AF37]/5 border border-[#D4AF37]/20 flex flex-col justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">VIP Access Gate</span>
                        <div className="my-6 space-y-1">
                          <h4 className="text-base font-black uppercase tracking-tight text-white leading-none">
                            {homeContent?.upgrade?.headline || "Most traders enter after the move is already gone."}
                          </h4>
                          <p className="text-[9px] font-bold text-zinc-400">
                            {homeContent?.upgrade?.subtext || "Pro members see it when it actually matters."}
                          </p>
                        </div>
                        <button
                          onClick={() => router.push('/plans')}
                          className="w-full h-12 bg-gradient-to-r from-[#D4AF37] via-[#F6D365] to-[#B8860B] hover:opacity-90 text-black font-black uppercase tracking-[2px] text-[9px] rounded-xl transition-all"
                        >
                          {homeContent?.upgrade?.cta || "Unlock VIP Option Feed"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. LIVE SIGNALS VIEW */}
                {activeTab === 'signals' && (
                  <motion.div
                    key="signals"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <h2 className="text-2xl font-black tracking-tight uppercase italic">Live Option <span className="text-[#D4AF37]">Signals</span></h2>
                      <div className="flex gap-2">
                        {['ALL', 'NIFTY', 'BANKNIFTY'].map(f => (
                          <button 
                            key={f} 
                            onClick={() => setActiveFilter(f)} 
                            className={`px-3 h-8 rounded-lg text-[9px] font-black tracking-widest border transition-all ${
                              activeFilter === f 
                                ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                                : 'bg-[#141414] text-[#A1A1AA] border-white/5 hover:text-white'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {signals.filter(s => activeFilter === 'ALL' || s.symbol === activeFilter).length > 0 ? (
                        signals
                          .filter(s => activeFilter === 'ALL' || s.symbol === activeFilter)
                          .map((sig, i) => (
                            <LuxurySignalCard key={sig._id} signal={sig} index={i} isPro={isPro} />
                          ))
                      ) : (
                        <div className="py-20 text-center border border-dashed border-white/5 rounded-[24px] text-xs font-black text-zinc-500 uppercase tracking-[4px]">
                          No Active Signals Found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. ADVANCED SCANNERS VIEW */}
                {activeTab === 'insights' && (
                  <motion.div
                    key="insights"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-black tracking-tight uppercase italic">Advanced <span className="text-[#D4AF37]">Scanners</span></h2>
                    
                    {/* Timeframe selector & Indicators toggle */}
                    <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 space-y-6">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-2 bg-black p-1 rounded-xl border border-white/5">
                          {['1M', '3M', '5M', '15M', '1H'].map(t => (
                            <button 
                              key={t}
                              onClick={() => setActiveTimeframe(t)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all ${
                                activeTimeframe === t 
                                  ? 'bg-[#D4AF37] text-black font-extrabold' 
                                  : 'text-zinc-500 hover:text-white'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          {Object.keys(enabledIndicators).map((ind) => (
                            <label key={ind} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-zinc-400 select-none">
                              <input 
                                type="checkbox" 
                                checked={(enabledIndicators as any)[ind]}
                                onChange={() => setEnabledIndicators(prev => ({ ...prev, [ind]: !(prev as any)[ind] }))}
                                className="w-3.5 h-3.5 accent-[#D4AF37]"
                              />
                              <span>{ind}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Mock Chart Visualization */}
                      <div className="h-64 bg-black rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-end p-4">
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-60" />
                        
                        {/* Legend */}
                        <div className="absolute top-4 left-4 flex gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-[#22C55E]" /><span>NIFTY Spot</span></div>
                          {enabledIndicators.EMA && <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#D4AF37]" /><span>EMA 9/20</span></div>}
                          {enabledIndicators.RSI && <div className="flex items-center gap-1.5"><span className="w-2 h-0.5 bg-[#A855F7]" /><span>RSI 14</span></div>}
                        </div>

                        <div className="w-full h-40 relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 100" preserveAspectRatio="none">
                            {/* Main price path */}
                            <path d="M0,80 Q100,20 200,60 T400,20 T500,50" fill="none" stroke="#22C55E" strokeWidth="2.5" />
                            {/* EMA overlay */}
                            {enabledIndicators.EMA && (
                              <path d="M0,82 Q100,24 200,62 T400,22 T500,48" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="3" />
                            )}
                            {/* RSI overlay */}
                            {enabledIndicators.RSI && (
                              <path d="M0,50 Q120,80 250,20 T500,70" fill="none" stroke="#A855F7" strokeWidth="1.2" />
                            )}
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">NIFTY 50 Technometrics</span>
                        <div className="space-y-2 text-xs font-bold text-zinc-400">
                          <div className="flex justify-between"><span>Current Value</span><span className="font-mono text-white">₹{formatPrice(marketPrices['NIFTY 50']?.val)}</span></div>
                          <div className="flex justify-between"><span>EMA Structure</span><span className="font-mono text-zinc-400">Bullish Aligned</span></div>
                          <div className="flex justify-between"><span>RSI Index (14)</span><span className="font-mono text-emerald-500">62.4 (Buy bias)</span></div>
                        </div>
                      </div>

                      <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">BANKNIFTY Technometrics</span>
                        <div className="space-y-2 text-xs font-bold text-zinc-400">
                          <div className="flex justify-between"><span>Current Value</span><span className="font-mono text-white">₹{formatPrice(marketPrices['BANKNIFTY']?.val)}</span></div>
                          <div className="flex justify-between"><span>EMA Structure</span><span className="font-mono text-zinc-400">Accumulation Channel</span></div>
                          <div className="flex justify-between"><span>RSI Index (14)</span><span className="font-mono text-emerald-500">58.8 (Neutral)</span></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. ALERT CENTER VIEW */}
                {activeTab === 'alerts' && (
                  <motion.div
                    key="alerts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-black tracking-tight uppercase italic">Alert <span className="text-[#D4AF37]">Center</span></h2>
                    
                    <div className="space-y-4">
                      {mockSystemAlerts.map(alert => (
                        <div key={alert.id} className="p-5 rounded-[20px] bg-[#141414] border border-white/5 flex gap-4 items-start hover:border-[#D4AF37]/30 transition-all">
                          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 text-[#D4AF37] shrink-0">
                            {alert.type === 'SIGNAL' ? <Radio size={16} /> : <AlertTriangle size={16} />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">{alert.type} ALERT</span>
                              <span className="text-[8px] text-zinc-600 font-bold">{alert.time}</span>
                            </div>
                            <h4 className="text-sm font-black text-white">{alert.title}</h4>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">{alert.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 5. USER PROFILE / SETTINGS VIEW */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 animate-fade-in"
                  >
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight uppercase italic">Identity & <span className="text-[#D4AF37]">Security</span></h2>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Private Server Access Settings</p>
                    </div>

                    <div className="p-6 rounded-[24px] bg-[#141414] border border-white/5 space-y-6">
                      <div className="flex justify-between items-center pb-4 border-b border-white/5">
                        <div>
                          <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Trader Handle</span>
                          {isEditingName ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input 
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="bg-black border border-white/10 rounded-lg px-3 h-10 text-sm font-bold text-white focus:border-[#D4AF37] outline-none"
                              />
                              <button onClick={handleUpdateName} className="px-3 h-10 bg-[#D4AF37] text-black font-black text-xs uppercase rounded-lg">Save</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 mt-1">
                              <h4 className="text-xl font-black uppercase italic">{user?.username || user?.name || 'Hedge Fund Member'}</h4>
                              <button onClick={() => setIsEditingName(true)} className="text-[9px] uppercase tracking-widest text-[#D4AF37] hover:underline">Edit</button>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-[2px] bg-amber-500/10 border border-[#D4AF37]/30 px-3 py-1.5 rounded-full">
                          {isPro ? 'OBSIDIAN VIP' : 'FREE TIER'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-zinc-400">
                        <div><span className="text-zinc-500 block mb-1">Phone String</span><span className="font-mono text-white">{user?.phone || '+91 99****88'}</span></div>
                        <div><span className="text-zinc-500 block mb-1">Joined Epoch</span><span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Session'}</span></div>
                      </div>
                    </div>

                    {/* VIP Telegram Section */}
                    <div className="p-6 rounded-[24px] bg-gradient-to-br from-[#141414] to-[#D4AF37]/5 border border-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black uppercase text-[#D4AF37] tracking-wider">Hedge Fund VIP Telegram</h4>
                          <p className="text-xs text-zinc-400 font-bold mt-1">Instant push updates direct to your private messaging stream.</p>
                        </div>
                        <span className="px-2 py-0.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[8px] font-black uppercase tracking-widest rounded">ONLINE</span>
                      </div>
                      <button 
                        onClick={() => window.open('https://t.me/your_dummy_vip_link', '_blank')}
                        className="w-full h-12 bg-[#000000] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white font-black text-[10px] uppercase tracking-[3px] rounded-xl transition-all"
                      >
                        Launch Private Telegram Channel
                      </button>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="w-full h-14 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-[3px] rounded-xl transition-all"
                    >
                      Disconnect Terminal Session
                    </button>
                  </motion.div>
                )}

                {/* 6. SIGNAL HISTORY VIEW */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="flex flex-col gap-6">
                      <h1 className="text-2xl font-black text-white tracking-tight uppercase italic">Signal <span className="text-[#D4AF37]">Archive</span></h1>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        {['ALL', 'NIFTY', 'BANKNIFTY'].map(f => (
                          <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 h-10 rounded-xl text-[9px] font-black tracking-[2px] border ${activeFilter === f ? 'bg-[#D4AF37] text-black' : 'bg-[#141414] text-[#A1A1AA] border-white/5'}`}>{f}</button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                      {filteredHistory.length > 0 ? (
                        filteredHistory.map((s, i) => <LuxurySignalCard key={s._id} signal={s} index={i} isPro={isPro} />)
                      ) : (
                        <div className="col-span-full py-20 text-center opacity-40 uppercase font-black tracking-[4px]">No Archive Logs Found</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Right Area: Market Analytics Sidebar */}
            <aside className="col-span-1 lg:col-span-4 space-y-6">
              
              {/* Candlestick Graphic Panel */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
                <span className="text-[9px] font-black text-[#A1A1AA] block tracking-[2px] uppercase">AI Prediction Candlesticks</span>
                <MiniCandlestickChart />
              </div>

              {/* Total account value performance curve */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black text-[#A1A1AA] tracking-[2px] uppercase">
                  <span>PrimeTrade Performance Curve</span>
                  <span className="text-[#22C55E]">+12.4% THIS MON</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black italic text-white">₹8,45,210.00</span>
                  <span className="text-[10px] font-bold text-zinc-500">QUANT ACCOUNT</span>
                </div>
                <EquityLineChart />
              </div>

              {/* Volatility India VIX */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-[#A1A1AA]">
                  <span className="tracking-widest text-[9px] font-black">VOLATILITY SCANNER</span>
                  <span className="text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded text-[8px] font-black">LOW REGIME</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black">India VIX</span>
                  <span className="text-base font-black text-[#22C55E]">{formatPrice(marketPrices['INDIA VIX']?.val) || '12.86'}</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-[#22C55E] rounded-full" />
                </div>
              </div>

              {/* FII/DII Net Flow */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
                <span className="text-[9px] font-black text-[#A1A1AA] block tracking-[2px] uppercase">NET FLOW QUANT MATRIX</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#71717A] block uppercase">FII Blocks</span>
                    <span className="text-sm font-black text-[#22C55E]">+₹2,480 Cr</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-[#71717A] block uppercase">DII Blocks</span>
                    <span className="text-sm font-black text-red-500">-₹410 Cr</span>
                  </div>
                </div>
              </div>

              {/* Sector Rotation Preview */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
                <span className="text-[9px] font-black text-[#A1A1AA] block tracking-[2px] uppercase">Sector Heatmap Bias</span>
                <div className="space-y-2">
                  {[
                    { name: 'Nifty Banks', val: '+3.4%', up: true },
                    { name: 'Infrastructure Weight', val: '+1.2%', up: true },
                    { name: 'Technology Index', val: '-1.8%', up: false },
                  ].map((sec) => (
                    <div key={sec.name} className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-500">{sec.name}</span>
                      <span className={sec.up ? 'text-[#22C55E]' : 'text-red-500'}>{sec.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* 🎨 HOLOGRAPHIC AI ASSISTANT ORB */}
        <div className="fixed bottom-20 right-6 z-[200] lg:bottom-8 lg:right-8">
          <button
            onClick={() => {
              setShowAiAssistant(!showAiAssistant);
              if (!showAiAssistant) {
                import('@/utils/feedback').then(m => m.playTechClick(1));
              }
            }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F6D365] to-[#B8860B] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-white/10 active:scale-95 transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-20" />
            <BrainCircuit size={22} className="text-black" />
          </button>
        </div>

        {/* AI Copilot Holographic Panel */}
        <AnimatePresence>
          {showAiAssistant && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed bottom-36 right-6 z-[200] w-80 max-w-[calc(100vw-2rem)] h-96 rounded-[24px] bg-[#0E0E0E]/95 backdrop-blur-2xl border border-[#D4AF37]/30 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 bg-[#141414] border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[2px] text-white">PrimeTrade Copilot</span>
                </div>
                <button onClick={() => setShowAiAssistant(false)} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest">Close</button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3">
                {aiChat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-[16px] text-xs leading-relaxed font-bold ${
                      msg.sender === 'user' 
                        ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]' 
                        : 'bg-white/5 border border-white/5 text-zinc-300'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!aiInput.trim()) return;
                const userMsg = aiInput;
                setAiChat(prev => [...prev, { sender: 'user', text: userMsg }]);
                setAiInput('');
                setTimeout(() => {
                  let response = "Scanning trade setup matrices. Order book imbalance detected on BANKNIFTY spot index with 92% confidence support at 51200.";
                  if (userMsg.toLowerCase().includes('nifty')) {
                    response = "NIFTY Spot Index is trading within narrow EMA channels. Technical scanners suggest waiting for a breakout above 23610.";
                  } else if (userMsg.toLowerCase().includes('whale') || userMsg.toLowerCase().includes('money')) {
                    response = "FII buying density has surged by 1.8x over the last 15 minutes. Institutional activity clusters show high concentration of bullish block orders.";
                  }
                  setAiChat(prev => [...prev, { sender: 'ai', text: response }]);
                }, 800);
              }} className="p-3 bg-[#141414] border-t border-white/5 flex gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Ask copilot..."
                  className="flex-1 h-10 bg-black border border-white/10 rounded-xl px-3 text-xs font-bold outline-none focus:border-[#D4AF37] placeholder:text-zinc-700"
                />
                <button type="submit" className="h-10 px-4 bg-[#D4AF37] text-black font-black text-[9px] uppercase tracking-widest rounded-xl">Send</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="lg:hidden">
          <GlobalBottomNav />
        </div>
      </div>
    </div>
  );
}
