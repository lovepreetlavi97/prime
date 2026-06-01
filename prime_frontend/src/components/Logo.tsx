'use client';

import React from 'react';

export const Logo = ({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const dimensions = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-base',
    lg: 'w-12 h-12 text-2xl'
  };

  const textSizes = {
    sm: 'text-sm tracking-[0.5px]',
    md: 'text-lg tracking-[1px]',
    lg: 'text-2xl tracking-[1.5px]'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className} select-none`}>
      <div className={`rounded-full bg-[#D4AF37] font-black text-black flex items-center justify-center font-sans ${dimensions[size]} shadow-[0_0_12px_rgba(212,175,55,0.4)]`}>
        L
      </div>
      <span className={`font-black ${textSizes[size]} text-white`}>
        LV<span className="text-[#D4AF37]">X</span>
      </span>
    </div>
  );
};
