import { create } from 'zustand';
import { getPackages, subscribeToPackage } from '../api/subscriptions.api';

interface Package {
  _id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  badge?: string;
}

interface SubscriptionsState {
  packages: Package[];
  loading: boolean;
  error: string | null;
  fetchPackages: () => Promise<void>;
  buyPackage: (packageId: string) => Promise<void>;
}

export const useSubscriptionsStore = create<SubscriptionsState>((set) => ({
  packages: [],
  loading: false,
  error: null,

  fetchPackages: async () => {
    set({ loading: true });
    try {
      const data = await getPackages();
      set({ packages: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  buyPackage: async (packageId: string) => {
    set({ loading: true });
    try {
      await subscribeToPackage(packageId);
      // Success logic: Maybe refresh user profile or show success modal
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
