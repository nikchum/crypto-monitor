// hooks/usePriceMonitor.ts
import { useEffect, useCallback } from "react";
import { useMonitorStore } from "@/store/monitorStore";
import { fetchPrice, ExchangeName } from "@/lib/api";

const usePriceMonitor = () => {
  const pairs = useMonitorStore((state) => state.pairs);
  const updateData = useMonitorStore((state) => state.updateData);

  // Функция для получения и обработки данных для одной пары
  const fetchAndProcessPair = useCallback(
    async (pairId: string) => {
      const pair = pairs.find((p) => p.id === pairId);
      if (!pair) return;

      // Устанавливаем статус загрузки
      updateData(pair.id, { loading: true });

      // Параллельное выполнение запросов
      const [price1, price2] = await Promise.all([
        fetchPrice(pair.exchange1 as ExchangeName, pair.ticker1),
        fetchPrice(pair.exchange2 as ExchangeName, pair.ticker2),
      ]);

      let diffPercent: number | null = null;

      // Вычисление процентной разницы
      if (price1 !== null && price2 !== null && price1 !== 0) {
        diffPercent = ((price2 - price1) / price1) * 100;
      }

      // Обновляем состояние
      updateData(pair.id, {
        price1,
        price2,
        diffPercent: diffPercent ? parseFloat(diffPercent.toFixed(4)) : null,
        loading: false,
      });
    },
    [pairs, updateData]
  );

  // Главный эффект для интервала
  useEffect(() => {
    // Функция, которая обрабатывает все пары
    const monitorAllPairs = () => {
      pairs.forEach((pair) => {
        // Проверяем, что оба тикера заданы
        if (pair.ticker1 && pair.ticker2) {
          fetchAndProcessPair(pair.id);
        }
      });
    };

    // 1. Немедленно запускаем при монтировании/изменении пар
    monitorAllPairs();

    // 2. Устанавливаем интервал (каждые 10 секунд)
    const intervalId = setInterval(monitorAllPairs, 10000); // 10 секунд

    // 3. Очистка интервала при размонтировании
    return () => clearInterval(intervalId);
  }, [pairs, fetchAndProcessPair]);
};

export default usePriceMonitor;
