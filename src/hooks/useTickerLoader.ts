// hooks/useTickerLoader.ts
import { useEffect, useState } from "react";
import { useMonitorStore } from "@/store/monitorStore";
import { fetchAllTickers, ExchangeName } from "@/lib/api";

const useTickerLoader = () => {
  const pairs = useMonitorStore((state) => state.pairs);
  const tickerCache = useMonitorStore((state) => state.tickerCache);
  const setTickerCache = useMonitorStore((state) => state.setTickerCache);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Собираем уникальные биржи, которые нужно загрузить
    const exchangesToLoad = new Set<ExchangeName>();

    pairs.forEach((pair) => {
      // Проверяем, есть ли биржа в кэше
      if (pair.exchange1 && !tickerCache[pair.exchange1]) {
        exchangesToLoad.add(pair.exchange1 as ExchangeName);
      }
      if (pair.exchange2 && !tickerCache[pair.exchange2]) {
        exchangesToLoad.add(pair.exchange2 as ExchangeName);
      }
    });

    if (exchangesToLoad.size > 0 && !isLoading) {
      setIsLoading(true);

      const loadTickers = async () => {
        const loadingPromises: Promise<void>[] = [];

        exchangesToLoad.forEach((exchange) => {
          loadingPromises.push(
            fetchAllTickers(exchange).then((tickers) => {
              if (tickers.length > 0) {
                setTickerCache(exchange, tickers);
              } else {
                console.warn(`Не удалось загрузить тикеры для ${exchange}`);
              }
            })
          );
        });

        await Promise.all(loadingPromises);
        setIsLoading(false);
      };

      loadTickers();
    }

    // Этот эффект запускается при изменении пар или кэша
  }, [pairs, tickerCache, setTickerCache, isLoading]);

  return { isLoadingTickers: isLoading };
};

export default useTickerLoader;
