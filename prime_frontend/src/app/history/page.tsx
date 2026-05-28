'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useSignalStore } from '@/store/useSignalStore';

export default function RedirectToDashboard() {
  const router = useRouter();
  const setActiveTab = useSignalStore(state => state.setActiveTab);

  useEffect(() => {
    // Set the state and redirect to the consolidated dashboard
    setActiveTab('history');
    router.replace('/');
  }, [router, setActiveTab]);

  return (
    <div className="h-screen bg-[#0B0B0F] flex items-center justify-center">
      <div className="animate-pulse text-[#D4AF37] font-black uppercase tracking-[5px]">
        Loading Elite Dashboard...
      </div>
    </div>
  );
}
