"use client";

import React, { useEffect, useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/layout/Footer";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { API_URL } from "@/config";

export default function PrivacyPage() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`${API_URL}/system/legal/privacy_policy`);
        if (res.ok) {
          const data = await res.json();
          setDoc(data);
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, []);

  const defaultContent = `
    Your privacy is important to us. It is LVX's policy to respect your privacy regarding any information we may collect from you across our website, http://localhost:3000, and other sites we own and operate.
    
    We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
    
    We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
    
    We don’t share any personally identifying information publicly or with third-parties, except when required to by law.
    
    Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
    
    You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.
    
    Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
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
                {doc?.title || "Privacy Policy"}
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
