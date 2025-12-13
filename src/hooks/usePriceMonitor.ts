// hooks/usePriceMonitor.ts
import { useEffect, useCallback } from "react";
import { useMonitorStore } from "@/store/monitorStore";
import { fetchPrice, ExchangeName } from "@/lib/api";
import { showDesktopNotification, playSoundAlert } from "@/utils/notifications";

const MIN_NOTIFICATION_INTERVAL_MS = 30000; // 1 минута

const usePriceMonitor = () => {
  const pairs = useMonitorStore((state) => state.pairs);
  const settings = useMonitorStore((state) => state.settings);
  const updateData = useMonitorStore((state) => state.updateData);

  const fetchAndProcessPair = useCallback(
    async (pairId: string) => {
      const pair = pairs.find((p) => p.id === pairId);
      if (!pair || !pair.ticker1 || !pair.ticker2) return;

      updateData(pair.id, { loading: true });

      const [price1, price2] = await Promise.all([
        fetchPrice(pair.exchange1 as ExchangeName, pair.ticker1),
        fetchPrice(pair.exchange2 as ExchangeName, pair.ticker2),
      ]);

      let diffPercent: number | null = null;
      if (price1 !== null && price2 !== null && price1 !== 0) {
        diffPercent = ((price2 - price1) / price1) * 100;
      }

      updateData(pair.id, {
        price1,
        price2,
        diffPercent: diffPercent ? parseFloat(diffPercent.toFixed(3)) : null,
        loading: false,
      });

      // --- Логика уведомлений ---
      const currentTime = Date.now();

      // **ГЛАВНОЕ ИСПРАВЛЕНИЕ:** Получаем актуальное состояние напрямую через getState().
      // Это гарантирует, что мы видим последние lastNotificationTime и настройки,
      // но не вызывает пересоздания функции (нет цикла).
      const currentStoreState = useMonitorStore.getState();
      const currentData = currentStoreState.data[pairId] || {};
      const currentSettings = currentStoreState.settings;

      const lastTime = currentData.lastNotificationTime || 0;
      const priceLimit = currentSettings.priceLimit || 0;

      const isConditionMet = diffPercent !== null && Math.abs(diffPercent) <= priceLimit;
      const isIntervalPassed = currentTime - lastTime >= MIN_NOTIFICATION_INTERVAL_MS;

      if (isConditionMet && isIntervalPassed) {
        const title = `🚨 ЦЕНА БЛИЗКА: ${pair.exchange1} vs ${pair.exchange2}`;
        const body = `Разница ${pair.ticker1}/${pair.ticker2} составляет ${diffPercent!.toFixed(4)}%`;

        if (currentSettings.enableDesktop) {
          showDesktopNotification(title, body, `pair-${pair.id}`);
        }
        if (currentSettings.enableSound) {
          playSoundAlert();
        }

        updateData(pair.id, { lastNotificationTime: currentTime });
      }
      // Зависимости useCallback: только те, что не меняются на каждом рендере.
    },
    [pairs, updateData]
  );

  useEffect(() => {
    const monitorAllPairs = () => {
      pairs.forEach((pair) => {
        fetchAndProcessPair(pair.id);
      });
    };

    monitorAllPairs();

    // Запускаем новый интервал при изменении пар, настроек или функции
    const intervalId = setInterval(monitorAllPairs, 10000);

    return () => clearInterval(intervalId);
    // Зависимости useEffect:
    // 1. pairs: для запуска при добавлении/удалении пары.
    // 2. settings: для перезапуска интервала, если настройки изменились (применяется немедленно).
    // 3. fetchAndProcessPair: для запуска при изменении его зависимостей (например, pairs).
  }, [pairs, settings, fetchAndProcessPair]);
};

export default usePriceMonitor;
