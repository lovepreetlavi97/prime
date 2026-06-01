'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Crown, User, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config';
import { useSignalStore } from '@/store/useSignalStore';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { GoldButton } from '@/components/ui/GoldButton';

export default function ProfilePage() {
  const router = useRouter();
  const logout = useSignalStore((state) => state.logout);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch(`${getApiUrl()}/profile/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data || data.error) {
          router.replace('/login');
          return;
        }
        setUser(data);
        setNewName(data.name || '');
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        router.replace('/login');
        setLoading(false);
      });
  }, [router]);

  const handleUpdateName = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/profile/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        setUser({ ...user, name: newName });
        setIsEditingName(false);
      }
    } catch (err) {
      console.error('Failed to update name');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    router.push('/login');
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center gap-4">
       <div className="w-12 h-12 rounded-full border-t border-[#D4AF37] animate-spin" />
       <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[4px]">Loading Profile...</span>
    </div>
  );

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto space-y-12"
      >
        <div className="space-y-2">
           <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[5px]">Account Settings</span>
           <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter italic font-outfit text-white">
              Settings & <span className="text-[#D4AF37]">Profile</span>
           </h1>
        </div>

        <PremiumCard className="p-8">
           <div className="space-y-8">
              <div className="flex flex-col gap-2 py-4 border-b border-white/[0.04]">
                 <span className="text-neutral-500 text-[9px] font-black uppercase tracking-[3px]">Full Name</span>
                 <div className="flex justify-between items-center group">
                    {isEditingName ? (
                      <div className="flex items-center gap-4 w-full">
                        <input 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-transparent text-xl font-bold tracking-tight text-white border-b border-[#D4AF37] outline-none flex-1 py-1"
                          autoFocus
                        />
                        <button onClick={handleUpdateName} className="p-2 bg-[#D4AF37] rounded-lg text-black cursor-pointer">
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-xl font-bold tracking-tight text-white uppercase italic">{user?.name || 'User'}</span>
                        <button onClick={() => setIsEditingName(true)} className="text-neutral-500 hover:text-[#D4AF37] transition-colors cursor-pointer">
                          <Edit2 size={16} />
                        </button>
                      </>
                    )}
                 </div>
              </div>

              <InfoRow label="Contact Number" value={user?.phone || 'Not added'} />
              <InfoRow label="Subscription Plan" value={user?.subscription?.plan || 'Free'} highlight />
           </div>
           
           <div className="mt-12">
             <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-12 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[10px] font-black uppercase tracking-[4px] text-rose-400 hover:bg-rose-500/10 transition-all font-sans cursor-pointer"
             >
                Logout Account
             </button>
           </div>
        </PremiumCard>
      </motion.div>

      {/* 🔒 LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowLogoutModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-xs bg-[#0E0E12] border border-white/[0.04] rounded-2xl p-10 text-center shadow-2xl z-10"
            >
               <h3 className="text-xl font-black tracking-tighter uppercase italic mb-2 text-white">Logout Account?</h3>
               <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[2px] mb-10">Are you sure you want to logout?</p>
               
               <div className="space-y-4">
                  <button 
                    onClick={handleLogout}
                    className="w-full h-12 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[4px] hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                  >
                    Confirm Logout
                  </button>
                  <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full h-12 bg-white/[0.04] text-white rounded-xl font-black text-[10px] uppercase tracking-[4px] hover:bg-white/[0.08] active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function InfoRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-2 py-4 border-b border-white/[0.04] last:border-none">
       <span className="text-neutral-500 text-[9px] font-black uppercase tracking-[3px]">{label}</span>
       <span className={`text-xl font-bold tracking-tight ${highlight ? 'text-[#D4AF37] italic' : 'text-white'}`}>{value}</span>
    </div>
  );
}

