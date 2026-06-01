import React from "react";
import Link from "next/link";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/[0.04] py-16 px-6 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-[#D4AF37]/5 blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
        {/* Brand info */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <Link href="/">
            <Logo />
          </Link>
          <p className="text-xs text-neutral-500 max-w-sm font-medium leading-relaxed mt-2">
            LVX / PrimeTrade is a premium options signals engine and real-time market intelligence platform. We focus on discipline, statistics, and automation.
          </p>
          <span className="text-[10px] text-neutral-600 font-mono tracking-widest uppercase mt-4">
            © {new Date().getFullYear()} LVX. ALL RIGHTS RESERVED.
          </span>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Product
          </h4>
          <ul className="space-y-3">
            <li>
              <a href="#market-intelligence" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                AI Sentiment
              </a>
            </li>
            <li>
              <a href="#live-signals" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                Option Alerts
              </a>
            </li>
            <li>
              <a href="#pricing" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                VIP Plans
              </a>
            </li>
          </ul>
        </div>

        {/* Legal / CMS */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Legal & Support
          </h4>
          <ul className="space-y-3">
            <li>
              <Link href="/contact" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-xs text-neutral-400 hover:text-[#D4AF37] transition-colors">
                FAQ Support
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
