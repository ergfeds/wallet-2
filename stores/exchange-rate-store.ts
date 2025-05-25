import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExchangeRates {
  btc: number;
  eth: number;
  usdt: number;
  sol: number;
}

interface ExchangeRateState {
  rates: ExchangeRates;
  updateRate: (currencyId: string, rate: number) => void;
  getRate: (currencyId: string) => number;
  fetchLiveRates: () => Promise<void>;
  resetToDefaults: () => void;
}

// Live market rates (these would be fetched from a real API)
const liveRates: ExchangeRates = {
  btc: 43250,
  eth: 2680,
  usdt: 1.00,
  sol: 98,
};

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      rates: liveRates,

      updateRate: (currencyId: string, rate: number) => {
        const { rates } = get();
        set({
          rates: {
            ...rates,
            [currencyId]: rate,
          },
        });
      },

      getRate: (currencyId: string) => {
        const { rates } = get();
        return rates[currencyId as keyof ExchangeRates] || 0;
      },

      fetchLiveRates: async () => {
        try {
          // In a real app, you would fetch from a live API like CoinGecko
          // For now, we'll simulate live data with slight variations
          const { rates } = get();
          const updatedRates = {
            btc: rates.btc + (Math.random() - 0.5) * 1000,
            eth: rates.eth + (Math.random() - 0.5) * 100,
            usdt: 1.00 + (Math.random() - 0.5) * 0.01,
            sol: rates.sol + (Math.random() - 0.5) * 10,
          };
          
          set({ rates: updatedRates });
        } catch (error) {
          console.error('Failed to fetch live rates:', error);
        }
      },

      resetToDefaults: () => {
        set({ rates: liveRates });
      },
    }),
    {
      name: 'exchange-rate-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);