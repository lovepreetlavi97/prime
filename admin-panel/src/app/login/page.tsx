'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '../../store/useAdminStore';
import { ShieldCheck, Mail, Lock, Sparkles, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function LoginPage() {
  const router = useRouter();
  const { setAdminUser, addAuditLog } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Call administrative login endpoint
      const { data } = await api.post('/auth/admin-login', { email, password });
      
      const adminUser = {
        id: data.user.id || data.user._id,
        phone: data.user.phone,
        name: data.user.name || 'Lovepreet Singh',
        role: data.user.role || 'SUPER_ADMIN',
      };

      setAdminUser(adminUser, data.token);
      addAuditLog({ adminName: adminUser.name, action: 'LOGIN', details: 'Successful administrative session authorization' });
      router.push('/');
    } catch (err: any) {
      console.warn('API admin-login failed, checking sandbox overrides.');
      
      // Sandbox validation override
      const emailStr = email.toLowerCase().trim();
      if ((emailStr === 'admin@lvprimex.com' && password === 'admin') || 
          (emailStr === 'admin@lvprimex.com' && password === 'admin123')) {
        const mockAdminUser = {
          id: 'u4',
          phone: '9888877777',
          name: 'Lovepreet Singh',
          role: 'SUPER_ADMIN',
        };
        setAdminUser(mockAdminUser, 'mock-jwt-token-string-value');
        addAuditLog({ adminName: 'Lovepreet Singh', action: 'LOGIN_OFFLINE', details: 'Offline admin credential bypass verified' });
        router.push('/');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Use admin@lvprimex.com / admin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#03050C] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Visual glowing backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00C2FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0A0D18]/65 backdrop-blur-2xl border border-white/[0.08] rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Animated highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

        <div className="text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D4AF37] to-amber-500 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-[#D4AF37]/20 animate-pulse">
            <ShieldCheck size={28} className="text-black" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Operations <span className="text-[#D4AF37]">Login</span>
            </h2>
            <p className="text-[9px] font-black text-[#71717A] uppercase tracking-[3.5px]">
              LVPrimeX SECURE GATEWAY
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-[2px] text-[#71717A] pl-1">
                ADMIN EMAIL ADDRESS
              </label>
              <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-[#0D0D12] border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
                <Mail size={16} className="text-[#4B4B52]" />
                <input
                  type="email"
                  placeholder="admin@lvprimex.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-transparent border-none text-white text-sm outline-none placeholder:text-white/20 tracking-wider font-bold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] font-black uppercase tracking-[2px] text-[#71717A] pl-1">
                SECURE PASSWORD
              </label>
              <div className="flex items-center gap-3 px-4 h-14 rounded-2xl bg-[#0D0D12] border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
                <Lock size={16} className="text-[#4B4B52]" />
                <input
                  type="password"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-grow bg-transparent border-none text-white text-sm outline-none placeholder:text-white/20 tracking-wider font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end items-center px-1">
              <span className="text-[8px] font-bold text-amber-500/50 uppercase tracking-[2px] flex items-center gap-1">
                <Sparkles size={8} /> Bypass Credentials: admin@lvprimex.com / admin
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#D4AF37] text-black font-black uppercase tracking-[4px] text-xs shadow-[0_10px_3px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2 hover:bg-[#cfa52f] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'AUTHORIZE SESSION'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
