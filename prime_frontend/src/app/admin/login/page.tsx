'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center text-white font-black text-3xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-6 mx-auto">
            P
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Access Control</h1>
          <p className="text-slate-500 font-medium mt-2">Sign in to manage PrimeTrade operations</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="admin@primetrade.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-1">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
              <label htmlFor="remember" className="text-sm font-semibold text-slate-500 cursor-pointer select-none">Remember this session</label>
            </div>

            <button className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(79,70,229,0.25)] hover:bg-indigo-700 transition-all hover:translate-y-[-2px] active:translate-y-[0px] group">
              AUTHENTICATE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Secured by PrimeGate v2.4</span>
        </div>
      </div>
    </div>
  );
}
