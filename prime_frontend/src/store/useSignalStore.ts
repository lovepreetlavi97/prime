import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';
import { Signal } from '@/types';
import { API_URL } from '@/config';

interface SignalState {
  signals: Signal[];
  isConnected: boolean;
  loading: boolean;
  user: any | null;
  socket: Socket | null;
  marketPrices: Record<string, { val: number, trend: 'up' | 'down' | 'neutral' }>;
  tradingAlerts: Record<string, any>; // signalId -> alertData
  isHydrated: boolean;
  lastHeartbeat: number | null;
  homeContent: any | null;

  isRealtimeReady: boolean;
  telegramStatus: { connected: boolean, channels: string[], lastSync: string | null } | null;
  settings: {
    sound: boolean;
    haptics: boolean;
    notifications: boolean;
  };

  notifications: any[];
  addNotification: (notification: any) => void;
  activeTab: 'home' | 'signals' | 'insights' | 'alerts' | 'profile' | 'history';
  setActiveTab: (tab: 'home' | 'signals' | 'insights' | 'alerts' | 'profile' | 'history') => void;

  // Actions

  connect: (url: string) => void;
  disconnect: () => void;
  setSignals: (signals: Signal[]) => void;
  updateSignal: (signalId: string, updates: Partial<Signal>) => void;
  setUser: (user: any) => void;
  updateSettings: (settings: Partial<SignalState['settings']>) => void;
  isBootstrapping: boolean;
  forceHydrate: () => void;
  dismissAlert: (signalId: string) => void;
  logout: () => void;
  refreshSignals: () => Promise<void>;
}




export const useSignalStore = create<SignalState>()(
  persist(
    (set, get) => ({
      signals: [],
      isConnected: false,
      loading: true,
      user: null,
      socket: null,
      marketPrices: {},
      isHydrated: false,
      isRealtimeReady: false,
      isBootstrapping: true,
      tradingAlerts: {},
      lastHeartbeat: null,
      telegramStatus: null,
      activeTab: 'home',
      homeContent: null,
      notifications: [],
      addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications].slice(0, 100) })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      settings: {
        sound: true,
        haptics: true,
        notifications: true,
      },


      connect: (url) => {
        const { socket: existingSocket } = get();
        if (existingSocket?.connected) return;

        const token = localStorage.getItem('token');

        const socket = io(url, {
          auth: { token },
          transports: ['websocket'],
          reconnectionAttempts: 15,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5000,
          timeout: 10000,
        });

        // 🔥 BATCHING ENGINE: To prevent React Rerender Storms
        let signalBuffer: Record<string, Partial<Signal>> = {};
        let marketBuffer: Record<string, any> = {};
        let batchTimer: NodeJS.Timeout | null = null;

        const flushBatch = () => {
          set((state) => {
            let newSignals = [...state.signals];
            let signalsChanged = false;

            // Apply atomic signal updates or add new ones
            Object.keys(signalBuffer).forEach(id => {
              const idx = newSignals.findIndex(s => s._id === id);
              const updateData = signalBuffer[id];
              
              if (idx !== -1) {
                const oldStatus = newSignals[idx].status;
                const newStatus = updateData.status;
                
                newSignals[idx] = { 
                  ...newSignals[idx], 
                  ...updateData, 
                  lastUpdateAt: Date.now(),
                  // 🔥 LIFECYCLE TRACKER: Record timestamp when status transitions to terminal
                  statusChangedAt: (newStatus && newStatus !== oldStatus) ? new Date().toISOString() : newSignals[idx].statusChangedAt
                };
                signalsChanged = true;
              } else if (updateData.symbol && updateData.entry) {
                // New signal detected in stream
                newSignals = [{ ...updateData, _id: id, lastUpdateAt: Date.now() } as Signal, ...newSignals];
                signalsChanged = true;
              }
            });

            const update: Partial<SignalState> = {};
            if (signalsChanged) update.signals = newSignals.slice(0, 100);
            if (Object.keys(marketBuffer).length > 0) {
              update.marketPrices = { ...state.marketPrices, ...marketBuffer };
            }

            signalBuffer = {};
            marketBuffer = {};
            batchTimer = null;
            return update;
          });
        };

        const queueBatch = () => {
          if (!batchTimer) batchTimer = setTimeout(flushBatch, 100); // ⚡ 100ms UI Throttle (was 250ms)
        };

        socket.on('connect', () => {
          set({ isConnected: true, isRealtimeReady: true });

          // 🔥 SUBSCRIBE TO GLOBAL INDICES
          socket.emit('subscribe_market', '13'); // NIFTY 50
          socket.emit('subscribe_market', '25'); // BANKNIFTY

          get().refreshSignals();
        });


        socket.on('disconnect', () => {
          set({ isConnected: false });
        });

        // 🔥 CHANNEL SEPARATION
        socket.on('signal_updates', (data: any) => {
          const updates = Array.isArray(data) ? data : [data];
          updates.forEach(u => {
            const id = u._id;
            if (!id) return;
            signalBuffer[id] = { ...signalBuffer[id], ...u };
          });
          queueBatch();
        });

        socket.on('new_signal', (signal: any) => {
          if (!signal._id) return;
          signalBuffer[signal._id] = { ...signalBuffer[signal._id], ...signal };
          queueBatch();
          
          get().addNotification({
            id: `new_${signal._id}_${Date.now()}`,
            type: 'new_signal',
            title: `New Signal: ${signal.symbol}`,
            message: `Entry target established at ₹${signal.entry}. Confidence Score ${signal.confidenceScore || 95}%`,
            timestamp: new Date().toISOString()
          });
        });

        socket.on('signal_status_change', (data: any) => {
          if (!data._id) return;
          signalBuffer[data._id] = { ...signalBuffer[data._id], ...data };
          queueBatch();
        });

        socket.on('update_signal', (data: any) => {
          if (!data._id) return;
          signalBuffer[data._id] = { ...signalBuffer[data._id], ...data };
          queueBatch();
        });

        socket.on('signal_closed', (data: any) => {
          if (!data._id) return;
          signalBuffer[data._id] = { ...signalBuffer[data._id], ...data };
          queueBatch();

          get().addNotification({
            id: `close_${data._id}_${Date.now()}`,
            type: 'signal_closed',
            title: `Signal Finalized: ${data.symbol}`,
            message: `Trade cycle closed. Status: ${data.status}`,
            timestamp: new Date().toISOString()
          });
        });

        socket.on('market_feed', (data: any) => {
          const name = data.instrument || data.token; 
          if (name) {
            const oldVal = get().marketPrices[name]?.val || 0;
            const trend = data.price > oldVal ? 'up' : data.price < oldVal ? 'down' : 'neutral';
            marketBuffer[name] = { val: data.price, trend };
            queueBatch();
          }
        });

        socket.on('telegram_status', (status: any) => {
          set({ telegramStatus: status });
        });

        // ⚡ Direct price_update from backend signal service (separate from market_feed)
        socket.on('price_update', (data: any) => {
          if (!data._id) return;
          signalBuffer[data._id] = { ...signalBuffer[data._id], ...data };
          queueBatch();
        });

        socket.on('heartbeat', (data: any) => {
          set({ lastHeartbeat: data.timestamp });
        });

        socket.on('trading_alert', (alert: any) => {
          set((state) => ({
            tradingAlerts: { ...state.tradingAlerts, [alert.signalId]: alert }
          }));

          get().addNotification({
            id: `alert_${alert.signalId}_${Date.now()}`,
            type: 'trading_alert',
            title: alert.title || 'Trading Alert',
            message: alert.message || alert.text,
            timestamp: new Date().toISOString()
          });

          // AUTO-DISMISS after 8 seconds
          setTimeout(() => {
            get().dismissAlert(alert.signalId);
          }, 8000);
        });

        set({ socket });
      },


      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },

      setSignals: (signals) => set({ signals, loading: false }),
      
      updateSignal: (id, updates) => set((state) => ({
        signals: state.signals.map(s => s._id === id ? { ...s, ...updates } : s)
      })),

      setUser: (user) => set({ user }),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      refreshSignals: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ loading: false, isBootstrapping: false });
          return;
        }

        try {
          const res = await fetch(`${API_URL}/system/bootstrap`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ signals: data.signals || [], loading: false, user: data.user, homeContent: data.homeContent || null, isBootstrapping: false });
          } else {
            set({ loading: false, isBootstrapping: false });
          }
        } catch (err) {
          set({ loading: false, isBootstrapping: false });
        }
      },


      forceHydrate: () => {
        set({ isHydrated: true, isBootstrapping: false });
      },

      dismissAlert: (signalId: string) => {
        set((state) => {
          const newAlerts = { ...state.tradingAlerts };
          delete newAlerts[signalId];
          return { tradingAlerts: newAlerts };
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        get().disconnect();
        set({ user: null, signals: [] });
      }
    }),
    {
      name: 'prime-trade-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data to avoid bloated localStorage
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?.forceHydrate();
        console.log('📦 Zustand Hydration Complete');
      },


    }
  )
);
