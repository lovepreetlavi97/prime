"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignalStore } from "@/store/useSignalStore";
import { SOCKET_URL } from "@/config";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import { LoadingOrb } from "../ui/LoadingOrb";
import { ConnectivityBanner } from "../ConnectivityBanner";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user, connect, disconnect, refreshSignals, isBootstrapping } = useSignalStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      // Connect to Sockets
      connect(SOCKET_URL);
      // Fetch initial details
      refreshSignals();
      setAuthLoading(false);
    }

    return () => {
      // Don't disconnect immediately on minor rerenders, but clean up when shell fully unmounts
    };
  }, [connect]);

  if (authLoading || isBootstrapping) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <LoadingOrb />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#060606] flex flex-col md:flex-row relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0 overflow-y-auto">
        <ConnectivityBanner />
        <TopBar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
export default AppShell;
