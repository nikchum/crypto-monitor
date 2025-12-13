// store/monitorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Интерфейсы
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
}

interface MonitorState {
  pairs: TickerPair[];
  data: Record<string, TickerData>; // key: pair.id
  tickerCache: Record<string, string[]>;
  addPair: () => void;
  removePair: (id: string) => void;
  updatePair: (id: string, field: keyof TickerPair, value: string) => void;
  updateData: (id: string, data: Partial<TickerData>) => void;
  initializePairsFromStorage: () => void;
  setTickerCache: (exchange: string, tickers: string[]) => void;
}

const initialPair: TickerPair = {
  id: Date.now().toString(),
  exchange1: "Binance",
  ticker1: "BTCUSDT",
  exchange2: "Bybit",
  ticker2: "BTCUSDT",
};

export const useMonitorStore = create<MonitorState>()(
  persist(
    (set, get) => ({
      pairs: [initialPair],
      data: {},
      tickerCache: {}, // Инициализируем пустой кэш

      setTickerCache: (exchange, tickers) => {
        set((state) => ({
          tickerCache: {
            ...state.tickerCache,
            [exchange]: tickers,
          },
        }));
      },

      initializePairsFromStorage: () => {
        // Логика инициализации из storage будет выполнена автоматически мидлварой `persist`
        // Но мы можем убедиться, что всегда есть хотя бы одна форма
        if (get().pairs.length === 0) {
          set({ pairs: [{ ...initialPair, id: Date.now().toString() }] });
        }
      },

      addPair: () => {
        const newPair: TickerPair = {
          id: Date.now().toString(),
          exchange1: "Binance",
          ticker1: "BTCUSDT",
          exchange2: "Bybit",
          ticker2: "BTCUSDT",
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

      updateData: (id, update) => {
        set((state) => ({
          data: {
            ...state.data,
            [id]: { ...state.data[id], ...update },
          },
        }));
      },
    }),
    {
      name: "crypto-monitor-storage", // Ключ в localStorage
      partialize: (state) => ({ pairs: state.pairs }), // Сохраняем только пары, а не данные
      skipHydration: true, // Пропускаем гидрацию на старте
      onRehydrateStorage: () => {
        // Выполняется после восстановления из localStorage
        return (state) => state?.initializePairsFromStorage();
      },
    }
  )
);
