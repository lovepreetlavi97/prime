'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSignalStore } from '@/store/useSignalStore';
import axios from 'axios';
import { getBaseUrl } from '@/config';

interface ChartPoint {
  time: number;
  value: number;
}

export const RealtimeSignalChart: React.FC<{ signalId: string; mainColor: string }> = ({ signalId, mainColor }) => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [socketName, setSocketName] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { socket } = useSignalStore();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await axios.get(`${getBaseUrl()}/api/v1/signals/${signalId}/chart`);
        if (res.data.historicalData) {
          setData(res.data.historicalData);
          setSocketName(res.data.socketName);
        }
      } catch (err) {
        console.error('Failed to load chart data:', err);
      }
    };

    fetchInitialData();
  }, [signalId]);

  useEffect(() => {
    if (!socket || !socketName) return;

    const handleUpdate = (update: any) => {
      if (update.instrument === socketName) {
        setData(prev => {
          const newData = [...prev, { time: Date.now() / 1000, value: update.price }];
          return newData.slice(-100); // Keep last 100 points
        });
      }
    };

    socket.on('price_update', handleUpdate);
    return () => {
      socket.off('price_update', handleUpdate);
    };
  }, [socket, socketName]);

  if (data.length < 2) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-black/20 rounded-xl border border-white/5 animate-pulse" />
    );
  }

  // Calculate SVG dimensions
  const minVal = Math.min(...data.map(d => d.value)) * 0.999;
  const maxVal = Math.max(...data.map(d => d.value)) * 1.001;
  const range = maxVal - minVal;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `M0,100 L${points} L100,100 Z`;

  return (
    <div className="w-full h-40 relative group" ref={containerRef}>
      {/* GLOW EFFECT */}
      <div 
        className="absolute inset-x-0 -top-10 h-32 blur-[40px] opacity-20 transition-opacity duration-1000" 
        style={{ background: `linear-gradient(to bottom, ${mainColor}, transparent)` }} 
      />

      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={`gradient-${signalId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={mainColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* AREA FILL */}
        <motion.path
          d={areaPath}
          fill={`url(#gradient-${signalId})`}
          initial={false}
          animate={{ d: areaPath }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* LINE */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={mainColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ points }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* CURRENT PRICE INDICATOR (Dot) */}
        <motion.circle
          cx="100"
          cy={100 - ((data[data.length - 1].value - minVal) / range) * 100}
          r="2.5"
          fill="white"
          stroke={mainColor}
          strokeWidth="1.5"
          initial={false}
          animate={{ cy: 100 - ((data[data.length - 1].value - minVal) / range) * 100 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        />
      </svg>

      {/* PRICE HUD */}
      <div className="absolute top-0 right-0 p-2 text-right">
        <div className="flex items-center gap-1 justify-end">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Live Execution</span>
        </div>
        <p className="text-xl font-black text-white italic tracking-tighter">
          ₹{data[data.length - 1].value.toFixed(2)}
        </p>
      </div>
    </div>
  );
};
