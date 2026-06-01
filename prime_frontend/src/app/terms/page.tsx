"use client";

import React, { useEffect, useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/layout/Footer";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { API_URL } from "@/config";

export default function TermsPage() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${API_URL}/system/legal/terms_conditions`);
        if (res.ok) {
          const data = await res.json();
          setDoc(data);
        }
      } catch (err) {
        console.error("Error fetching terms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, []);

  const defaultContent = `
    Welcome to LVX!
    
    These terms and conditions outline the rules and regulations for the use of LVX's Website, located at http://localhost:3000.
    
    By accessing this website we assume you accept these terms and conditions. Do not continue to use LVX if you do not agree to take all of the terms and conditions stated on this page.
    
    The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
    
    License:
    Unless otherwise stated, LVX and/or its licensors own the intellectual property rights for all material on LVX. All intellectual property rights are reserved. You may access this from LVX for your own personal use subjected to restrictions set in these terms and conditions.
    
    You must not:
    - Republish material from LVX
    - Sell, rent or sub-license material from LVX
    - Reproduce, duplicate or copy material from LVX
    - Redistribute content from LVX
    
    Disclaimer:
    To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will limit or exclude our or your liability for death or personal injury resulting from negligence; limit or exclude our or your liability for fraud or fraudulent misrepresentation; or limit any of our or your liabilities in any way that is not permitted under applicable law.
  `;

  return (
    <div className="min-h-screen bg-[#060606] text-white overflow-y-auto">
      <LandingNav />
      <div className="h-24" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <PremiumCard className="p-8 md:p-12">
          {loading ? (
            <div className="py-16 text-center text-neutral-500 font-mono text-xs uppercase tracking-widest">
              Retrieving legal ledger...
            </div>
          ) : (
            <article className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-black font-outfit uppercase tracking-tight text-white italic">
                {doc?.title || "Terms & Conditions"}
              </h1>
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest block">
                Last updated: {doc?.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-IN") : "Today"}
              </span>

              <div className="h-px bg-white/5 my-6" />

              <div className="text-neutral-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium space-y-4">
                {doc?.content || defaultContent}
              </div>
            </article>
          )}
        </PremiumCard>
      </main>

      <Footer />
    </div>
  );
}
