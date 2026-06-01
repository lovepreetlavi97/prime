"use client";

import React, { useEffect, useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/layout/Footer";
import FaqSection from "@/components/landing/FaqSection";
import { API_URL } from "@/config";

export default function FaqPage() {
  const [homeContent, setHomeContent] = useState<any>(null);

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await fetch(`${API_URL.replace("/v1", "")}/home-content`);
        if (res.ok) {
          const data = await res.json();
          setHomeContent(data);
        }
      } catch (err) {
        console.error("Failed to fetch public home-content for FAQ:", err);
      }
    };

    fetchHomeContent();
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-white overflow-y-auto">
      <LandingNav />
      <div className="h-24" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <FaqSection faq={homeContent?.faq} />
      </main>

      <Footer />
    </div>
  );
}
