'use client';

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Activity } from 'lucide-react';

interface InstrumentPrice {
  [key: string]: number;
}

const PriceTicker: React.FC = () => {
  const [prices, setPrices] = useState<InstrumentPrice>({
    'NIFTY 50': 0,
    'NIFTY BANK': 0,
    'SENSEX': 0,
    'INDIA VIX': 0,
    'USD-INR': 0
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // 🔥 ARCHITECTURE OPTIMIZATION: Removed independent Socket.io connection to prevent header rerender storms.
    // Market data is now static or fetched on bootstrap to save CPU/Bandwidth.
    setConnectionStatus('connected');

    const fetchInitialPrices = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/v1/market/prices');
        const data = await response.json();
        if (data.success) {
          setPrices(data.data.prices);
        }
      } catch (error) {
        console.error('Failed to fetch initial prices:', error);
      }
    };

    fetchInitialPrices();
  }, []);

  const formatPrice = (price: number | null, instrumentName: string): string => {
    if (price === null || price === 0) return '--';
    if (instrumentName === 'USD-INR') return price.toFixed(4);
    return price.toFixed(2);
  };

  const instruments = [
    { name: 'NIFTY 50', short: 'NIFTY' },
    { name: 'NIFTY BANK', short: 'BANK' },
    { name: 'SENSEX', short: 'SENSEX' },
    { name: 'INDIA VIX', short: 'VIX' },
    { name: 'USD-INR', short: 'USD/INR' }
  ];

  return (
    <div className="bg-black/50 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-amber-500" />
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Live Markets</span>
            </div>

            <div className="flex items-center space-x-6">
              {instruments.map((instrument) => {
                const price = prices[instrument.name];

                return (
                  <div key={instrument.name} className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-400 font-medium min-w-[60px]">
                      {instrument.short}
                    </span>
                    <span className="text-sm text-white font-mono font-semibold min-w-[80px] text-right">
                      {formatPrice(price, instrument.name)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              <span className="text-xs text-zinc-500 capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTicker;
