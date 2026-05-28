'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-[14px]',
    lg: 'text-[18px]'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${dimensions[size]} flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(212,175,55,0.45)]">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="30%" stopColor="#F6D365" />
              <stop offset="70%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
          </defs>

          {/* Rotating Luxury Diamond Border */}
          <motion.path 
            d="M50 8 L92 50 L50 92 L8 50 Z" 
            stroke="url(#goldGrad)" 
            strokeWidth="2" 
            strokeDasharray="4 4" 
            opacity="0.4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50px", originY: "50px" }}
          />

          {/* Interlocking LVX Monogram Paths */}
          {/* L: Vertical from (32, 28) to (32, 68), Horizontal from (32, 68) to (52, 68) */}
          <motion.path 
            d="M32 28 V68 H52" 
            stroke="url(#goldGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />

          {/* V Left arm: from (40, 28) to (50, 68) */}
          <motion.path 
            d="M40 28 L50 68" 
            stroke="url(#goldGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
          />

          {/* V Right arm / X Rising arm: from (50, 68) to (75, 25) */}
          <motion.path 
            d="M50 68 L75 25" 
            stroke="url(#goldGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
          />
          
          {/* Arrow Barbs for Rising Breakout Leg */}
          <motion.path 
            d="M63 25 H75 V37" 
            stroke="url(#goldGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.5 }}
          />

          {/* X crossing leg: from (70, 68) to (56, 42) */}
          <motion.path 
            d="M70 68 L56 42" 
            stroke="url(#goldGrad)" 
            strokeWidth="6.5" 
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, ease: "easeInOut", delay: 0.55 }}
          />
        </svg>
      </div>
      
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-black tracking-[4px] text-white flex items-center gap-1`}>
          PRIMETRADE <span className="text-[#D4AF37] font-medium text-[8px] tracking-[2.5px] uppercase">AI</span>
        </span>
      </div>
    </div>
  );
};
