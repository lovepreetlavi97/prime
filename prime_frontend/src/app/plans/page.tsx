'use client';

import React, { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/MobileHeader';
import { GlobalBottomNav } from '@/components/GlobalBottomNav';
import { Zap, Crown, Loader2, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '@/config';
import { useSignalStore } from '@/store/useSignalStore';
import { useShallow } from 'zustand/react/shallow';

// Load Razorpay Script Dynamically
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function PlansPage() {
    const router = useRouter();
    const [packages, setPackages] = useState<any[]>([]);
    const { user: globalUser } = useSignalStore(
        useShallow((state) => ({
            user: state.user
        }))
    );
    const [loading, setLoading] = useState(true);
    const [purchasingId, setPurchasingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const pkgRes = await axios.get(`${getApiUrl()}/subscriptions/packages`);
                setPackages(pkgRes.data);

                const userRes = globalUser;

                const redirectPlan = localStorage.getItem('redirect_plan');
                if (redirectPlan && token) {
                    const pkg = JSON.parse(redirectPlan);
                    localStorage.removeItem('redirect_plan');
                    handlePayment(pkg, userRes, token);
                }
            } catch (err) {
                console.error('Failed to fetch data');
            }
            setLoading(false);
        };
        fetchData();
    }, [globalUser]);

    const handlePayment = async (pkg: any, currentUser?: any, currentToken?: any) => {
        const token = currentToken || localStorage.getItem('token');
        const userData = currentUser || globalUser;

        if (!token) {
            localStorage.setItem('redirect_plan', JSON.stringify(pkg));
            return router.push('/login');
        }
        if (userData?.subscription?.plan?.toUpperCase() === pkg.name?.toUpperCase()) return;

        setPurchasingId(pkg._id);

        try {
            const { data } = await axios.post(`${getApiUrl()}/subscriptions/create-order`,
                { packageId: pkg._id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (!data.success) throw new Error('Failed to create order');

            const res = await loadRazorpay();
            if (!res) {
                alert('Razorpay SDK failed to load. Are you online?');
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_dummy_key',
                amount: data.order.amount,
                currency: data.order.currency,
                name: "PRIMETRADE Premium",
                description: `Upgrade to ${pkg.name}`,
                order_id: data.order.id,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await axios.post(`${getApiUrl()}/subscriptions/verify-payment`, {
                            ...response,
                            packageId: pkg._id
                        }, { headers: { 'Authorization': `Bearer ${token}` } });

                        if (verifyRes.data.success) {
                            alert('Success! Your Pro plan is now active.');
                            window.location.reload();
                        }
                    } catch (err) {
                        alert('Payment Verification Failed. Contact Support.');
                    }
                },
                prefill: {
                    name: globalUser?.name || "Trader",
                    contact: globalUser?.phone || ""
                },
                theme: { color: "#D4AF37" }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (err: any) {
            console.error('Payment Error:', err);
            if (err.response?.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.clear();
                router.push('/login');
            } else {
                alert('Something went wrong during checkout.');
            }
        } finally {
            setPurchasingId(null);
        }
    };

    // Find the premium package (usually Pro or whatever package is active in DB)
    const proPackage = packages.find(p => p.name?.toLowerCase().includes('pro') || p.name?.toLowerCase().includes('gold') || p.name?.toLowerCase().includes('premium')) || packages[0];
    const isProUser = globalUser?.subscription?.active && globalUser?.subscription?.plan;

    return (
        <div className="min-h-screen relative flex flex-col bg-[#060606] overflow-x-hidden text-white font-sans selection:bg-[#D4AF37]/30 pb-32">
            {/* Ambient upper glow background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-[#D4AF37]/5 to-transparent blur-[120px] pointer-events-none" />

            <MobileHeader />

            <main className="flex-1 mt-20 px-4 md:px-12 relative z-10">
                <div className="max-w-4xl mx-auto space-y-12">
                    
                    {/* CHOOSE PLAN BADGE & HERO */}
                    <div className="text-center py-4">
                        <div className="flex justify-center mb-6">
                            <span className="px-4 py-1.5 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[10px] uppercase tracking-widest rounded-full bg-[#D4AF37]/5">
                                Choose Your Plan
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic leading-none text-white">
                            Get the Timing Advantage
                        </h1>
                        <p className="text-xs md:text-sm text-zinc-500 font-bold max-w-md mx-auto mt-4 leading-relaxed">
                            Most traders enter after the move is already gone. Upgrade to capture setups in real-time.
                        </p>
                    </div>

                    {/* PRICING GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                        
                        {/* 1. FREE PLAN CARD */}
                        <div className="bg-[#0E0E0E] border border-white/5 p-8 rounded-[32px] flex flex-col justify-between relative shadow-2xl">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                        <Zap size={14} className="text-zinc-400" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider text-white">FREE</span>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-white">₹0</h3>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Get a taste of PRIMETRADE</p>
                                </div>

                                <div className="h-px bg-white/5" />

                                <ul className="space-y-4">
                                    {[
                                        "Delayed signals (5 min)",
                                        "Blurred entry levels",
                                        "Limited signal history",
                                        "Basic market intelligence"
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-semibold text-zinc-300">
                                            <div className="w-4 h-4 rounded-full bg-[#22C55E]/10 flex items-center justify-center shrink-0">
                                                <Check size={10} className="text-[#22C55E]" />
                                            </div>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8">
                                <button
                                    disabled
                                    className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.01] text-zinc-400 font-bold text-xs uppercase tracking-[2px] cursor-default"
                                >
                                    Current Plan
                                </button>
                            </div>
                        </div>

                        {/* 2. PRO PLAN CARD */}
                        <div className="bg-[#0E0E0E] border border-[#D4AF37]/30 p-8 rounded-[32px] flex flex-col justify-between relative shadow-2xl shadow-[#D4AF37]/5 overflow-hidden">
                            {/* POPULAR BADGE */}
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 bg-[#D4AF37] text-black text-[8px] font-black uppercase tracking-widest rounded-md">
                                    POPULAR
                                </span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shrink-0">
                                        <Crown size={14} className="text-[#D4AF37]" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">PRO</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        <h3 className="text-4xl font-black text-white">₹{proPackage?.price || '4,999'}</h3>
                                        <span className="text-zinc-500 text-[10px] font-black tracking-wider uppercase">/ month</span>
                                    </div>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-wider">Full access to everything</p>
                                </div>

                                <div className="h-px bg-white/5" />

                                <ul className="space-y-4">
                                    {[
                                        "Real-time signals (instant)",
                                        "Full entry, SL & target levels",
                                        "Unlimited signal history",
                                        "AI guidance & reasoning",
                                        "Instant push alerts",
                                        "VIP Telegram access",
                                        "Advanced market analytics",
                                        "Priority support"
                                    ].map((f, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs font-semibold text-[#D4AF37]">
                                            <div className="w-4 h-4 rounded-full bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                                                <Check size={10} className="text-[#D4AF37]" />
                                            </div>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    onClick={() => handlePayment(proPackage)}
                                    disabled={loading || isProUser || purchasingId === proPackage?._id}
                                    className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[3px] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                                        isProUser
                                        ? 'bg-white/5 text-[#22C55E] cursor-not-allowed border border-[#22C55E]/20'
                                        : 'bg-[#D4AF37] text-black hover:bg-[#F6D365] shadow-[0_4px_25px_rgba(212,175,55,0.25)]'
                                    }`}
                                >
                                    {purchasingId === proPackage?._id ? (
                                        <Loader2 className="animate-spin mx-auto" size={16} />
                                    ) : (
                                        <>{isProUser ? 'VIP ACTIVE' : 'Upgrade to Pro'}</>
                                    )}
                                </button>
                                <p className="text-[9px] text-zinc-500 text-center font-semibold">
                                    7-day money back guarantee • Cancel anytime
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* WHY UPGRADE NOW */}
                    <div className="max-w-3xl mx-auto space-y-6 pt-8">
                        <h4 className="text-xs font-black uppercase text-center text-zinc-500 tracking-[4px]">Why upgrade now?</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            <div className="p-6 bg-[#0E0E0E] border border-white/5 rounded-2xl text-center space-y-2">
                                <h5 className="text-3xl font-black text-[#22C55E]">68%</h5>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average signal success rate</p>
                            </div>

                            <div className="p-6 bg-[#0E0E0E] border border-white/5 rounded-2xl text-center space-y-2">
                                <h5 className="text-3xl font-black text-[#D4AF37]">+₹2.4L</h5>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Avg monthly profit (Pro users)</p>
                            </div>

                            <div className="p-6 bg-[#0E0E0E] border border-white/5 rounded-2xl text-center space-y-2">
                                <h5 className="text-3xl font-black text-[#EF4444]">4.2 min</h5>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Average time to first target</p>
                            </div>

                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-3 text-zinc-600">
                        <ShieldCheck size={16} />
                        <span className="text-[8px] font-black uppercase tracking-[3px]">Institutional Security Shield Connected</span>
                    </div>

                </div>
            </main>

            <GlobalBottomNav />
        </div>
    );
}
