import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "LVX | Premium Signals Engine",
  description: "The premium AI-powered signals platform. High-fidelity real-time stock market option signals.",
  keywords: ["LVX Signals", "Option Signals", "BankNifty AI Alerts", "Institutional Trading Tools"],
  openGraph: {
    title: "LVX | Premium Terminal",
    description: "Premium signals engine with institutional AI intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${outfit.variable} font-inter antialiased`}>
        <div className="bg-glow" aria-hidden="true" />
        <div className="particles" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
