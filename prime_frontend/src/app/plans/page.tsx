'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Zap, Crown, Loader2, Check, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { getApiUrl } from '@/config';
import { useSignalStore } from '@/store/useSignalStore';
import { useShallow } from 'zustand/react/shallow';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { GoldButton } from '@/components/ui/GoldButton';

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

function PlansContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectParam = searchParams.get("select");
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

                // Auto checkout if selected via query param
                if (selectParam && pkgRes.data.length > 0 && token) {
                    const selectedPkg = pkgRes.data.find((p: any) => p._id === selectParam);
                    if (selectedPkg) {
                        handlePayment(selectedPkg, globalUser, token);
                    }
                }

                const redirectPlan = localStorage.getItem('redirect_plan');
                if (redirectPlan && token) {
                    const pkg = JSON.parse(redirectPlan);
                    localStorage.removeItem('redirect_plan');
                    handlePayment(pkg, globalUser, token);
                }
            } catch (err) {
                console.error('Failed to fetch data');
            }
            setLoading(false);
        };
        fetchData();
    }, [globalUser, selectParam]);

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
                name: "LVX Premium",
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

    const handleBypassPayment = async (pkg: any) => {
        const token = localStorage.getItem('token');
        if (!token) {
            localStorage.setItem('redirect_plan', JSON.stringify(pkg));
            return router.push('/login');
        }
        setPurchasingId(pkg._id);
        try {
            const { data } = await axios.post(`${getApiUrl()}/subscriptions/bypass-purchase`,
                { packageId: pkg._id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (data.success) {
                alert('Success! Your Pro plan is now active (Simulated).');
                window.location.reload();
            } else {
                throw new Error(data.error || 'Failed to bypass purchase');
            }
        } catch (err: any) {
            console.error('Bypass Payment Error:', err);
            alert(err.response?.data?.error || err.message || 'Bypass failed.');
        } finally {
            setPurchasingId(null);
        }
    };

    const isProUser = globalUser?.subscription?.isActive && globalUser?.subscription?.plan !== 'free';

    return (
        <AppShell>
            <div className="space-y-12">
                
                {/* HERO TITLE */}
                <div className="text-center py-4">
                    <div className="flex justify-center mb-4">
                        <span className="px-4 py-1.5 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold text-[10px] uppercase tracking-widest rounded-full bg-[#D4AF37]/5">
                            Upgrade Subscription
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase italic leading-none text-white font-outfit">
                        Get the Timing Advantage
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-400 font-medium max-w-md mx-auto mt-4 leading-relaxed">
                        Capture institutional setups in real-time. Full execution target mapping unlocked.
                    </p>
                </div>

                {/* PRICING GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                    
                    {/* 1. FREE PLAN CARD */}
                    <PremiumCard className="p-8 flex flex-col justify-between" hoverGlow={false}>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                    <Zap size={14} className="text-zinc-400" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-white">FREE TIER</span>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-4xl font-black text-white">₹0</h3>
                                <p className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">Operational parameters</p>
                            </div>

                            <div className="h-px bg-white/5" />

                            <ul className="space-y-4">
                                {[
                                    "Delayed index feeds (5 min)",
                                    "Blurred entry & stop loss parameters",
                                    "Partial historical ledger",
                                    "Standard AI intelligence reviews"
                                ].map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-semibold text-neutral-300">
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
                                className="w-full h-12 rounded-2xl border border-white/10 bg-white/[0.01] text-zinc-400 font-bold text-xs uppercase tracking-[2px] cursor-default"
                            >
                                Current Plan
                            </button>
                        </div>
                    </PremiumCard>

                    {/* 2. PRO PLAN CARD */}
                    {packages.map((pkg) => {
                        const isActivePkg = globalUser?.subscription?.plan?.toUpperCase() === pkg.name?.toUpperCase();

                        return (
                            <PremiumCard
                                key={pkg._id}
                                className="p-8 flex flex-col justify-between relative"
                                borderGold={true}
                                hoverGlow={true}
                            >
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-[#D4AF37] text-black text-[8px] font-black uppercase tracking-widest rounded-md">
                                        PRO VIP
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shrink-0">
                                            <Crown size={14} className="text-[#D4AF37]" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">
                                            {pkg.name}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-1">
                                            <h3 className="text-4xl font-black text-white">₹{pkg.price}</h3>
                                            <span className="text-neutral-500 text-[10px] font-black tracking-wider uppercase">
                                                / {pkg.durationInDays} days
                                            </span>
                                        </div>
                                        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-wider">
                                            Full unrestricted platform access
                                        </p>
                                    </div>

                                    <div className="h-px bg-white/5" />

                                    <ul className="space-y-4">
                                        {pkg.features.map((f: string, i: number) => (
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
                                    <GoldButton
                                        onClick={() => handlePayment(pkg)}
                                        disabled={loading || isActivePkg || purchasingId === pkg._id}
                                        className="w-full h-12 text-xs uppercase tracking-[3px] font-black"
                                    >
                                        {purchasingId === pkg._id ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <>{isActivePkg ? "VIP ACTIVE" : "Upgrade to Pro"}</>
                                        )}
                                    </GoldButton>

                                    {!isActivePkg && (
                                        <button
                                            onClick={() => handleBypassPayment(pkg)}
                                            disabled={loading || purchasingId === pkg._id}
                                            className="w-full text-center text-[10px] font-bold text-neutral-500 hover:text-[#D4AF37] uppercase tracking-wider mt-2 transition-all bg-transparent border-none outline-none cursor-pointer"
                                        >
                                            [ Simulated Payment Bypass ]
                                        </button>
                                    )}
                                </div>
                            </PremiumCard>
                        );
                    })}

                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-3 text-neutral-600">
                    <ShieldCheck size={16} />
                    <span className="text-[8px] font-black uppercase tracking-[3px]">
                        Institutional Security Cryptographic verification active
                    </span>
                </div>

            </div>
        </AppShell>
    );
}

export default function PlansPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#060606] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-[#D4AF37] border-white/5 animate-spin" />
            </div>
        }>
            <PlansContent />
        </Suspense>
    );
}

