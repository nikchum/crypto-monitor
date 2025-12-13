// app/page.tsx
"use client";

import { useMonitorStore } from "@/store/monitorStore";
import { TickerPairForm } from "@/components/ticker-pair-form";
import useTickerLoader from "@/hooks/useTickerLoader";
import usePriceMonitor from "@/hooks/usePriceMonitor";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { useEffect } from "react";

// Компонент, который обернет приложение и инициирует гидрацию Zustand
const HydrateWrapper = ({ children }: { children: React.ReactNode }) => {
  const initializePairsFromStorage = useMonitorStore((state) => state.initializePairsFromStorage);

  // Эффект для гидрации Zustand, чтобы получить данные из localStorage
  useEffect(() => {
    useMonitorStore.persist.rehydrate();
    initializePairsFromStorage();
  }, [initializePairsFromStorage]);

  return <>{children}</>;
};

export default function Home() {
  const { pairs, data, addPair } = useMonitorStore();

  // Запускаем мониторинг цен
  usePriceMonitor();

  // Запускаем загрузчик тикеров
  const { isLoadingTickers } = useTickerLoader();

  return (
    <HydrateWrapper>
      <main className="container mx-auto p-4 space-y-8">
        <h1 className="text-3xl font-bold">💰 Crypto Arbitrage Monitor</h1>

        {isLoadingTickers && (
          <div className="flex items-center text-blue-500 font-medium">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Загрузка списков тикеров... (может занять 10-20 секунд)
          </div>
        )}

        {/* Формы для ввода данных */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pairs.map((pair) => (
              <TickerPairForm key={pair.id} pair={pair} />
            ))}
          </div>

          <Button onClick={addPair} className="w-full md:w-auto" disabled={isLoadingTickers}>
            + Добавить новую пару для отслеживания
          </Button>
        </div>

        {/* Таблица с результатами */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">📊 Результаты мониторинга (Обновление каждые 10с)</h2>
          <Table>
            <TableCaption>Разница в ценах между выбранными биржами и тикерами.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Пара</TableHead>
                <TableHead className="text-right">Цена 1</TableHead>
                <TableHead className="text-right">Цена 2</TableHead>
                <TableHead className="text-right">Разница (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs.map((pair) => {
                const result = data[pair.id];
                const diff = result?.diffPercent;
                const isLoading = result?.loading;

                const diffStyle =
                  diff !== null
                    ? diff > 0
                      ? "text-green-500 font-bold"
                      : diff < 0
                      ? "text-red-500 font-bold"
                      : ""
                    : "text-muted-foreground";

                return (
                  <TableRow key={pair.id}>
                    <TableCell className="font-medium">
                      {`${pair.exchange1}: ${pair.ticker1}`} vs {`${pair.exchange2}: ${pair.ticker2}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {result?.price1 !== null ? `$${result?.price1?.toFixed(4)}` : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {result?.price2 !== null ? `$${result?.price2?.toFixed(4)}` : "N/A"}
                    </TableCell>
                    <TableCell className={`text-right ${diffStyle}`}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                      ) : diff !== null ? (
                        <>
                          {diff > 0 ? (
                            <ArrowUp className="h-4 w-4 inline mr-1" />
                          ) : diff < 0 ? (
                            <ArrowDown className="h-4 w-4 inline mr-1" />
                          ) : null}
                          {diff?.toFixed(4)}%
                        </>
                      ) : (
                        "--"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>
    </HydrateWrapper>
  );
}
