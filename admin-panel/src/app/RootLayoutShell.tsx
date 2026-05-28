'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '../store/useAdminStore';
import { Sidebar } from '../components/Sidebar';

export default function RootLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, connectRealtime, disconnectRealtime } = useAdminStore();

  const isLoginRoute = pathname === '/login';

  useEffect(() => {
    if (!isAuthenticated && !isLoginRoute) {
      router.push('/login');
    } else if (isAuthenticated && isLoginRoute) {
      router.push('/');
    }
  }, [isAuthenticated, isLoginRoute, router]);

  useEffect(() => {
    if (isAuthenticated) {
      connectRealtime();
    }
    return () => {
      disconnectRealtime();
    };
  }, [isAuthenticated, connectRealtime, disconnectRealtime]);

  if (!isAuthenticated && !isLoginRoute) {
    return (
      <div className="h-screen w-screen bg-[#03050C] flex items-center justify-center select-none">
        <div className="animate-pulse text-[#D4AF37] font-black tracking-[4px] uppercase text-[10px]">
          Initializing Secure Session...
        </div>
      </div>
    );
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-screen flex bg-[#03050C] overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main viewport */}
      <main className="flex-grow h-full overflow-y-auto no-scrollbar flex flex-col p-8 bg-[#03050C]">
        {children}
      </main>
    </div>
  );
}
