import { create } from 'zustand';

interface Signal {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entry: number;
  tp: number[];
  sl: number;
  status: string;
}

interface SignalsState {
  signals: Signal[];
  loading: boolean;
  error: string | null;
  fetchSignals: () => Promise<void>;
  addSignal: (signal: Signal) => void;
  updateSignal: (id: string, update: Partial<Signal>) => void;
}

export const useSignalsStore = create<SignalsState>((set) => ({
  signals: [],
  loading: false,
  error: null,

  fetchSignals: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/v1/signals');
      const data = await response.json();
      set({ signals: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addSignal: (signal) => {
    set((state) => ({ signals: [signal, ...state.signals.slice(0, 49)] }));
  },

  updateSignal: (id, update) => {
    set((state) => ({
      signals: state.signals.map((s) => (s.id === id ? { ...s, ...update } : s)),
    }));
  },
}));
