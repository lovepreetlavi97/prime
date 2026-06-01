"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignalStore } from "@/store/useSignalStore";
import { GoldButton } from "../ui/GoldButton";
import { Logo } from "../Logo";

export function LandingNav() {
  const router = useRouter();
  const { user } = useSignalStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token || !!user);

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [user]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-[#060606]/85 backdrop-blur-md py-4 border-white/[0.04]"
          : "bg-transparent py-6 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
          <Logo />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#market-intelligence"
            className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            Intelligence
          </a>
          <a
            href="#live-signals"
            className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            Live Feed
          </a>
          <a
            href="#guidance"
            className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            Methodology
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
          >
            FAQ
          </a>
        </div>

        {/* CTA Button */}
        <div>
          {isLoggedIn ? (
            <GoldButton variant="glow" size="sm" onClick={() => router.push("/dashboard")}>
              Launch Dashboard
            </GoldButton>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-neutral-400 hover:text-[#D4AF37] transition-colors"
              >
                Log In
              </Link>
              <GoldButton variant="solid" size="sm" onClick={() => router.push("/login?signup=true")}>
                Get Access
              </GoldButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
export default LandingNav;
