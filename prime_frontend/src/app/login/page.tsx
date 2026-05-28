'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignalStore } from '@/store/useSignalStore';
import { Phone, ShieldCheck, Loader2, Lock } from 'lucide-react';
import { API_URL } from '@/config';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 📡 WEB OTP API: Auto-read SMS
  useEffect(() => {
    if (step === 2 && 'OTPCredential' in window) {
      const ac = new AbortController();
      navigator.credentials.get({
        // @ts-ignore
        otp: { transport: ['sms'] },
        signal: ac.signal
      }).then((otpObj: any) => {
        const code = otpObj.code;
        if (code) {
          setOtpCode(code);
          handleVerify(code, phone);
        }
      }).catch(err => {
        console.log('Web OTP API not supported');
      });
      return () => ac.abort();
    }
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return setError('Please enter a valid phone number');

    setLoading(true);
    setError('');

    const fullPhone = `+91${phone}`;

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (codeOverride?: string, phoneOverride?: string) => {
    if (isVerifying) return;

    const finalOtp = codeOverride || otpCode;
    const finalPhone = phoneOverride || phone;
    if (finalOtp.length < 4) return setError('Enter valid OTP');

    setIsVerifying(true);
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: `+91${finalPhone}`, otp: finalOtp })
      });
      const data = await res.json();

      if (res.status === 429) {
        setError('Verification already in progress. Please wait.');
        return;
      }

      if (data.success) {
        const { setUser, refreshSignals } = useSignalStore.getState();
        localStorage.setItem('token', data.token);
        setUser(data.user);
        await refreshSignals();

        const hasRedirectPlan = localStorage.getItem('redirect_plan');
        if (hasRedirectPlan) {
          router.push('/plans');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'The code you entered is incorrect.');
      }
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
      setIsVerifying(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-white font-sans selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* LOGO */}
        <div className="flex items-center gap-2.5 mb-8 select-none">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37] font-black text-black text-base flex items-center justify-center font-sans">
            P
          </div>
          <span className="text-xl font-bold tracking-[1px] text-white">
            PRIME<span className="text-[#D4AF37]">TRADE</span>
          </span>
        </div>

        {/* HEADER TEXT */}
        <h2 className="text-3xl font-bold tracking-tight text-white text-center mb-1">
          Welcome Back
        </h2>
        <p className="text-xs text-zinc-500 text-center mb-8">
          {step === 1 ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
        </p>

        {/* FORM CONTAINER CARD */}
        <div className="w-full bg-[#0E0E0E] border border-[#D4AF37]/10 p-8 rounded-[24px] shadow-2xl relative">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 focus-within:border-[#D4AF37]/30 transition-all">
                  <Phone className="text-zinc-600 mr-3 shrink-0" size={16} />
                  <span className="text-sm font-semibold text-zinc-400 mr-1 select-none">+91</span>
                  <input
                    type="tel"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    className="bg-transparent border-none text-white text-sm font-semibold tracking-wider outline-none w-full placeholder:text-zinc-700"
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#D4AF37] hover:bg-[#F6D365] text-black font-black uppercase text-xs tracking-[2px] rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Send OTP'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">
                  Enter OTP
                </label>
                <div className="relative flex items-center bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 focus-within:border-[#D4AF37]/30 transition-all">
                  <Lock className="text-zinc-600 mr-3 shrink-0" size={16} />
                  <input
                    type="tel"
                    placeholder="Enter 6 digit OTP"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      setError('');
                      if (val.length === 4 || val.length === 6) {
                        handleVerify(val);
                      }
                    }}
                    className="bg-transparent border-none text-white text-sm font-semibold tracking-widest outline-none w-full placeholder:text-zinc-700 placeholder:tracking-normal"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setOtpCode('');
                    setError('');
                    alert('OTP Resent! (Static code is 1111)');
                  }}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider"
                >
                  Resend OTP
                </button>
              </div>

              {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>}

              <div className="space-y-4">
                <button
                  onClick={() => handleVerify()}
                  disabled={loading}
                  className="w-full py-4 bg-[#D4AF37] hover:bg-[#F6D365] text-black font-black uppercase text-xs tracking-[2px] rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Verify & Continue'}
                </button>

                <button
                  onClick={() => {
                    setStep(1);
                    setOtpCode('');
                    setError('');
                  }}
                  className="w-full text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider text-center block"
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}
        </div>

        {/* POLICY FOOTER */}
        <p className="text-[9px] text-zinc-600 mt-12 text-center max-w-[280px]">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}
