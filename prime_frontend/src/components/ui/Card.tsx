import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes safely
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'glass' | 'solid' | 'outline';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  variant = 'glass' 
}) => {
  const baseStyles = "rounded-2xl p-6 transition-all duration-300";
  
  const variants = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
    solid: "bg-slate-900 border border-slate-800 shadow-lg",
    outline: "bg-transparent border border-slate-700 hover:border-blue-500/50",
  };

  return (
    <div className={cn(baseStyles, variants[variant], className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("mb-4", className)}>{children}</div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={cn("text-xl font-bold text-white", className)}>{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);
