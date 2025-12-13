// components/ticker-pair-form.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExchangeName, EXCHANGES } from "@/lib/api";
import { TickerPair, useMonitorStore } from "@/store/monitorStore";
import { X } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { useEffect, useState } from "react";

const DEBOUNCE_DELAY = 500; // Задержка 500 мс

interface TickerPairFormProps {
  pair: TickerPair;
}

const EXCHANGES_LIST: ExchangeName[] = Object.keys(EXCHANGES) as ExchangeName[];

export function TickerPairForm({ pair }: TickerPairFormProps) {
  const { updatePair, removePair, tickerCache } = useMonitorStore(); // Добавляем tickerCache

  const handleUpdate = (field: keyof TickerPair, value: string) => {
    updatePair(pair.id, field, value);
  };

  // Локальные состояния для ввода, чтобы избежать частого обновления Zustand
  const [localTicker1, setLocalTicker1] = useState(pair.ticker1);
  const [localTicker2, setLocalTicker2] = useState(pair.ticker2);

  // Debounce для локальных значений
  const debouncedTicker1 = useDebounce(localTicker1, DEBOUNCE_DELAY);
  const debouncedTicker2 = useDebounce(localTicker2, DEBOUNCE_DELAY);

  // --- Эффект для синхронизации Debounced значений с Zustand ---
  useEffect(() => {
    // Обновляем Zustand только если отложенное значение изменилось и отличается от текущего в Zustand
    if (debouncedTicker1 !== pair.ticker1) {
      updatePair(pair.id, "ticker1", debouncedTicker1.toUpperCase());
    }
  }, [debouncedTicker1, pair.id, pair.ticker1, updatePair]);

  useEffect(() => {
    if (debouncedTicker2 !== pair.ticker2) {
      updatePair(pair.id, "ticker2", debouncedTicker2.toUpperCase());
    }
  }, [debouncedTicker2, pair.id, pair.ticker2, updatePair]);

  // Синхронизация при загрузке из localStorage или удалении/добавлении пары
  useEffect(() => {
    setLocalTicker1(pair.ticker1);
    setLocalTicker2(pair.ticker2);
  }, [pair.ticker1, pair.ticker2]);

  // Тикеры для первой биржи
  const tickers1 = tickerCache[pair.exchange1] || [];
  // Тикеры для второй биржи
  const tickers2 = tickerCache[pair.exchange2] || [];

  return (
    <div className="border p-4 rounded-lg space-y-4 bg-card shadow-sm relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground"
        onClick={() => removePair(pair.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="grid grid-cols-2 gap-4">
        {/* Пара 1 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Биржа 1</h4>
          <Select value={pair.exchange1} onValueChange={(v) => handleUpdate("exchange1", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите биржу" />
            </SelectTrigger>
            <SelectContent>
              {EXCHANGES_LIST.map((ex) => (
                <SelectItem key={ex} value={ex}>
                  {ex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Тикер 1 ({tickers1.length > 0 ? tickers1.length : "0"})</h4>
          {/* Инпут + datalist */}
          <Input
            // Используем ЛОКАЛЬНОЕ состояние для ввода
            value={localTicker1}
            // Обновляем ЛОКАЛЬНОЕ состояние при каждом вводе
            onChange={(e) => setLocalTicker1(e.target.value.toUpperCase())}
            placeholder="Введите тикер (e.g., BTCUSDT)"
            list={`tickers-${pair.id}-1`}
          />
          {/* Datalist теперь заполняется из кэша */}
          <datalist id={`tickers-${pair.id}-1`}>
            {tickers1.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        {/* Пара 2 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Биржа 2</h4>
          <Select value={pair.exchange2} onValueChange={(v) => handleUpdate("exchange2", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите биржу" />
            </SelectTrigger>
            <SelectContent>
              {EXCHANGES_LIST.map((ex) => (
                <SelectItem key={ex} value={ex}>
                  {ex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Тикер 2 ({tickers2.length > 0 ? tickers2.length : "0"})</h4>
          <Input
            // Используем ЛОКАЛЬНОЕ состояние для ввода
            value={localTicker2}
            // Обновляем ЛОКАЛЬНОЕ состояние при каждом вводе
            onChange={(e) => setLocalTicker2(e.target.value.toUpperCase())}
            placeholder="Введите тикер (e.g., BTCUSDT)"
            list={`tickers-${pair.id}-2`}
          />
          <datalist id={`tickers-${pair.id}-2`}>
            {tickers2.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
}
