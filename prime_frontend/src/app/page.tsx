"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config";
import LandingNav from "@/components/landing/LandingNav";
import LiveTickerStrip from "@/components/landing/LiveTickerStrip";
import HeroSection from "@/components/landing/HeroSection";
import IntelligenceStatus from "@/components/landing/IntelligenceStatus";
import SignalPreview from "@/components/landing/SignalPreview";
import MarketGuidance from "@/components/landing/MarketGuidance";
import RecentResults from "@/components/landing/RecentResults";
import WhyPrimeTrade from "@/components/landing/WhyPrimeTrade";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  const router = useRouter();
  const [homeContent, setHomeContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Auth check: Redirect to dashboard if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      router.replace("/dashboard");
      return;
    }

    // 2. Fetch CMS content
    const fetchHomeContent = async () => {
      try {
        const res = await fetch(`${API_URL.replace("/v1", "")}/home-content`);
        if (res.ok) {
          const data = await res.json();
          setHomeContent(data);
        }
      } catch (err) {
        console.error("Failed to fetch public home-content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeContent();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060606] text-white overflow-y-auto selection:bg-[#D4AF37] selection:text-black">
      {/* 1. Public Navigation */}
      <LandingNav />

      {/* Ticker Strip placeholder offset */}
      <div className="h-20" />

      {/* 2. Live Market Ticker Strip */}
      <LiveTickerStrip />

      {/* 3. Hero Section */}
      <HeroSection
        heroData={homeContent?.hero}
        anticipation={homeContent?.anticipation}
        lastSignal={homeContent?.lastSignal}
      />

      {/* 4. Market Intelligence Status */}
      <IntelligenceStatus />

      {/* 5. Signal Preview Card (blurred for non-auth) */}
      <SignalPreview />

      {/* 6. Market Guidance / Methodology */}
      <MarketGuidance
        guidance={homeContent?.guidance}
        trustText={homeContent?.trust}
      />

      {/* 7. Recent Closed Results */}
      <RecentResults />

      {/* 8. Why PrimeTrade (Features) */}
      <WhyPrimeTrade />

      {/* 9. Pricing & Packages */}
      <PricingSection />

      {/* 10. Testimonials */}
      <Testimonials testimonials={homeContent?.testimonials} />

      {/* 11. FAQ Accordion */}
      <FaqSection faq={homeContent?.faq} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
