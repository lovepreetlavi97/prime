"use client";

import React, { useState } from "react";
import LandingNav from "@/components/landing/LandingNav";
import Footer from "@/components/layout/Footer";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { GoldButton } from "@/components/ui/GoldButton";
import { API_URL } from "@/config";
import { Send, Phone, Mail, MapPin, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/system/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit message.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white overflow-y-auto">
      <LandingNav />
      <div className="h-24" />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center">
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[5px] block mb-2">
            Support Desk
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-outfit">
            Get in Touch
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mt-3 font-medium">
            Have questions about subscriptions or technical parameters? Send us a ticket.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Contact Details */}
          <div className="lg:col-span-1 space-y-6">
            <PremiumCard className="p-8 space-y-8 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <h3 className="text-xl font-bold font-outfit text-white">
                  Corporate Office
                </h3>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400 uppercase">
                      Location
                    </h4>
                    <p className="text-sm font-semibold text-white mt-1">
                      Financial District, Hyderabad, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-400 uppercase">
                      Email
                    </h4>
                    <p className="text-sm font-semibold text-white mt-1">
                      support@lvprimex.app
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 text-[11px] font-semibold text-[#D4AF37] leading-relaxed">
                📢 Support tickets are reviewed by our operations staff within 24 hours.
              </div>
            </PremiumCard>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <PremiumCard className="p-8 md:p-10" borderGold={true}>
              {success ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-4">
                  <CheckCircle size={48} className="text-emerald-400 animate-bounce" />
                  <h3 className="text-2xl font-black font-outfit text-white uppercase">
                    Ticket Created Successfully
                  </h3>
                  <p className="text-sm text-neutral-400 max-w-sm">
                    Thank you. We have received your query and will reply via email shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-xs font-bold text-[#D4AF37] uppercase tracking-wider hover:underline"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold uppercase tracking-wider">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                      Message Content *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-[#14141a]/40 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"
                    />
                  </div>

                  <GoldButton type="submit" variant="solid" size="md" className="w-full" disabled={loading}>
                    {loading ? "Creating Ticket..." : "Send Message"}
                    <Send size={14} className="ml-1" />
                  </GoldButton>
                </form>
              )}
            </PremiumCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
