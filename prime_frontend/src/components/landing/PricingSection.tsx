"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { PremiumCard } from "../ui/PremiumCard";
import { GoldButton } from "../ui/GoldButton";
import { useRouter } from "next/navigation";
import { Crown, Check } from "lucide-react";

export function PricingSection() {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_URL}/subscriptions/packages`);
        if (res.ok) {
          const data = await res.json();
          setPackages(data || []);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSelectPackage = (pkgId: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.push(`/plans?select=${pkgId}`);
    } else {
      router.push(`/login?signup=true&redirect=/plans?select=${pkgId}`);
    }
  };

  const fallbackPackages = [
    {
      _id: "fb_month",
      name: "VIP Monthly Pass",
      price: 2999,
      durationInDays: 30,
      badge: "POPULAR",
      features: [
        "Live Option Signals Feed",
        "Nifty & BankNifty Support",
        "WebSocket Live Price Sync",
        "Push Notifications",
        "AI Confidence Analytics",
      ],
    },
    {
      _id: "fb_quarter",
      name: "VIP Quarterly Pass",
      price: 7999,
      durationInDays: 90,
      badge: "BEST VALUE",
      features: [
        "All Monthly Pass Features",
        "Priority Socket Connection",
        "Premium Telegram Access",
        "Direct Support Channel",
        "Save 15% Over Monthly",
      ],
    },
  ];

  const list = packages.length > 0 ? packages : fallbackPackages;

  return (
    <section id="pricing" className="py-24 px-6 relative max-w-7xl mx-auto border-t border-white/[0.04]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />

      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">
          Subscription
        </h2>
        <h3 className="text-3xl md:text-5xl font-black font-outfit text-white">
          Choose Your Access Level
        </h3>
        <p className="text-neutral-400 text-sm md:text-base max-w-xl mx-auto mt-4 font-medium">
          Unlock the institutional feed. Select a pricing structure suited for your trading scale and frequency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {loading ? (
          <div className="col-span-full py-12 text-center text-neutral-500 text-xs">
            Loading options packages...
          </div>
        ) : (
          list.map((pkg) => {
            const isPopular = pkg.badge === "POPULAR" || pkg.badge === "BEST VALUE";

            return (
              <PremiumCard
                key={pkg._id}
                className="p-8 flex flex-col justify-between relative"
                borderGold={isPopular}
                hoverGlow={true}
              >
                {isPopular && (
                  <span className="absolute top-4 right-6 text-[9px] font-bold text-[#D4AF37] tracking-[2px] border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-2.5 py-0.5 rounded-full uppercase">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown size={16} className="text-[#D4AF37]" />
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                      {pkg.durationInDays} Days Access
                    </span>
                  </div>

                  <h4 className="text-2xl font-black font-outfit text-white mb-4">
                    {pkg.name}
                  </h4>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black font-outfit text-white">
                      ₹{pkg.price}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      / flat
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {pkg.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                        <span className="text-sm font-semibold text-neutral-300">
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <GoldButton
                  variant={isPopular ? "solid" : "outline"}
                  size="md"
                  className="w-full"
                  onClick={() => handleSelectPackage(pkg._id)}
                >
                  Activate Pass Now
                </GoldButton>
              </PremiumCard>
            );
          })
        )}
      </div>
    </section>
  );
}
export default PricingSection;
