// store/monitorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TickerPair {
  id: string;
  exchange1: string;
  ticker1: string;
  exchange2: string;
  ticker2: string;
}

export interface TickerData {
  price1: number | null;
  price2: number | null;
  diffPercent: number | null;
  loading: boolean;
  lastNotificationTime: number | null;
}

export interface NotificationSettings {
  priceLimit: number;
  enableDesktop: boolean;
  enableSound: boolean;
}

interface MonitorState {
  pairs: TickerPair[];
  data: Record<string, TickerData>;
  tickerCache: Record<string, string[]>;
  settings: NotificationSettings;
  _hasHydrated: boolean;

  addPair: () => void;
  removePair: (id: string) => void;
  updatePair: (id: string, field: keyof TickerPair, value: string) => void;
  updateData: (id: string, data: Partial<TickerData>) => void;
  updateSettings: (update: Partial<NotificationSettings>) => void;
  setTickerCache: (exchange: string, tickers: string[]) => void;
  initializePairsFromStorage: () => void;
}

const initialPair: TickerPair = {
  id: "111",
  exchange1: "Binance",
  ticker1: "BTCUSDT",
  exchange2: "Bybit",
  ticker2: "BTCUSDT",
};

const defaultSettings: NotificationSettings = {
  priceLimit: 0.5,
  enableDesktop: true,
  enableSound: true,
};

export const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      pairs: [initialPair],
      data: {},
      tickerCache: {},
      settings: defaultSettings,
      _hasHydrated: false,

      // Методы:
      setHasHydrated: (state: boolean) => {
        // Метод для установки флага
        set({
          _hasHydrated: state,
        });
      },

      setTickerCache: (exchange, tickers) => {
        set((state) => ({
          tickerCache: {
            ...state.tickerCache,
            [exchange]: tickers,
          },
        }));
      },

      addPair: () => {
        const newPair: TickerPair = {
          ...initialPair,
          id: Date.now().toString(),
        };
        set((state) => ({
          pairs: [...state.pairs, newPair],
        }));
      },

      removePair: (id) => {
        set((state) => ({
          pairs: state.pairs.filter((pair) => pair.id !== id),
          data: Object.fromEntries(Object.entries(state.data).filter(([key]) => key !== id)),
        }));
      },

      updatePair: (id, field, value) => {
        set((state) => ({
          pairs: state.pairs.map((pair) => (pair.id === id ? { ...pair, [field]: value } : pair)),
        }));
      },

      updateSettings: (update) => {
        set((state) => ({
          settings: { ...state.settings, ...update },
        }));
      },

      updateData: (id, update) => {
        set((state) => ({
          data: {
            ...state.data,
            [id]: { ...state.data[id], ...update },
          },
        }));
      },

      initializePairsFromStorage: () => {
        if (get().pairs.length === 0) {
          set({ pairs: [{ ...initialPair, id: Date.now().toString() }] });
        }
      },
    }),
    {
      name: "crypto-monitor-storage",
      partialize: (state) => ({ pairs: state.pairs, settings: state.settings }),
      onRehydrateStorage: () => {
        return (state) => {
          // Вызываем инициализацию пар (если она нужна для специфической логики)
          state?.initializePairsFromStorage();
        };
      },
    }
  )
);
