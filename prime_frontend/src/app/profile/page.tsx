'use client';

import React, { useEffect, useState } from 'react';
import { MobileHeader } from '@/components/MobileHeader';
import { Home as HomeIcon, Crown, User, History as HistoryIcon, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/config';
import { GlobalBottomNav } from '@/components/GlobalBottomNav';

export default function ProfilePage() {
  const router = useRouter();
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

  if (loading) return (
    <div className="h-screen bg-[#0B0B0F] flex flex-col items-center justify-center gap-4">
       <div className="w-12 h-12 rounded-full border-t border-[#D4AF37] animate-spin" />
       <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[4px]">Loading Profile...</span>
    </div>
  );

  return (
    <div className="h-[100dvh] relative flex flex-col bg-[#0B0B0F] overflow-hidden text-white font-sans">
      <MobileHeader />
      
      <main className="flex-1 mt-16 p-8 lg:p-12 overflow-y-auto no-scrollbar pb-40">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl mx-auto space-y-16"
        >
          <div className="space-y-2">
             <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-[5px]">Account Settings</span>
             <h1 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter italic">
                Settings & <span className="text-[#D4AF37]">Profile</span>
             </h1>
          </div>

          <div className="space-y-10">
             <div className="grid grid-cols-1 gap-1">
                
                <div className="flex flex-col gap-2 py-6 border-b border-[#27272A]">
                   <span className="text-[#A1A1AA] text-[9px] font-black uppercase tracking-[3px]">Full Name</span>
                   <div className="flex justify-between items-center group">
                      {isEditingName ? (
                        <div className="flex items-center gap-4 w-full">
                          <input 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="bg-transparent text-2xl font-black tracking-tighter text-white border-b border-[#D4AF37] outline-none flex-1"
                            autoFocus
                          />
                          <button onClick={handleUpdateName} className="p-2 bg-[#D4AF37] rounded-lg text-black">
                            <Check size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">{user?.name || 'User'}</span>
                          <button onClick={() => setIsEditingName(true)} className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors">
                            <Edit2 size={16} />
                          </button>
                        </>
                      )}
                   </div>
                </div>

                <InfoRow label="Contact Number" value={user?.phone || 'Not added'} />
                <InfoRow label="Subscription Plan" value={user?.subscription?.plan || 'Free'} highlight />
             </div>
             
             <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full h-16 rounded-xl bg-[#14141A] border border-[#27272A] text-[10px] font-black uppercase tracking-[4px] text-[#EF4444] hover:bg-[#EF4444]/10 transition-all font-sans"
             >
                Logout Account
             </button>
          </div>
        </motion.div>
      </main>

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
               className="relative w-full max-w-xs bg-[#14141A] border border-[#27272A] rounded-2xl p-10 text-center shadow-2xl"
            >
               <h3 className="text-xl font-black tracking-tighter uppercase italic mb-2">Logout Account?</h3>
               <p className="text-[10px] text-[#A1A1AA] font-bold uppercase tracking-[2px] mb-10">Are you sure you want to logout?</p>
               
               <div className="space-y-4">
                  <button 
                    onClick={() => {
                      import('@/store/useSignalStore').then(m => {
                        m.useSignalStore.getState().disconnect();
                      });
                      localStorage.clear();
                      router.push('/login');
                    }}
                    className="w-full h-14 bg-[#EF4444] text-white rounded-xl font-black text-[10px] uppercase tracking-[4px] hover:opacity-90 active:scale-95 transition-all"
                  >
                    Confirm Logout
                  </button>
                  <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="w-full h-14 bg-[#27272A] text-white rounded-xl font-black text-[10px] uppercase tracking-[4px] hover:bg-[#3f3f46] active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📱 GLOBAL NAV */}
      <GlobalBottomNav />
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="flex flex-col gap-2 py-6 border-b border-[#27272A] last:border-none">
       <span className="text-[#A1A1AA] text-[9px] font-black uppercase tracking-[3px]">{label}</span>
       <span className={`text-2xl font-black tracking-tighter ${highlight ? 'text-[#D4AF37] italic' : 'text-white'}`}>{value}</span>
    </div>
  );
}
