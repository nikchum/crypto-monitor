// lib/api.ts (Обновленная версия)
import axios from "axios";

// ---------------------- ТИПЫ (НЕ МЕНЯЕМ) ----------------------
// Типы нужны, чтобы использовать их в серверных Route Handlers
export const EXCHANGES = {
  Binance: (ticker: string) => ticker, // Теперь не используем URL, просто возвращаем тикер
  Bybit: (ticker: string) => ticker,
  Mexc: (ticker: string) => ticker,
  BingX: (ticker: string) => ticker,
  Gate: (ticker: string) => ticker,
};
export type ExchangeName = keyof typeof EXCHANGES;

// ---------------------- ФУНКЦИЯ ДЛЯ ЦЕНЫ (fetchPrice) ----------------------
export async function fetchPrice(exchange: ExchangeName, ticker: string): Promise<number | null> {
  // НОВЫЙ URL: Запрос идет на ваш локальный API Route
  const url = `/api/proxy/price?exchange=${exchange}&ticker=${ticker}`;

  try {
    // В запросе отправляем только exchange и ticker, вся логика на бэкенде
    const response = await axios.get(url, { timeout: 10000 });
    let price: string | number | undefined;

    // Логика обработки данных остается здесь (на клиенте)
    switch (exchange) {
      case "Binance":
      case "Mexc":
        price = response.data.price;
        break;
      case "Bybit":
        price = response.data.result.list?.[0]?.lastPrice;
        break;
      case "BingX":
        price = response.data.data?.price;
        break;
      case "Gate":
        price = response.data?.last_price;
        break;
      default:
        return null;
    }

    if (price && !isNaN(Number(price))) {
      return Number(price);
    }
    return null;
  } catch (error) {
    console.error(
      `Ошибка при получении ${ticker} с ${exchange} (Через прокси):`,
      error instanceof Error ? error.message : "Unknown Error"
    );
    return null;
  }
}

// ---------------------- ФУНКЦИЯ ДЛЯ СПИСКА ТИКЕРОВ (fetchAllTickers) ----------------------
export async function fetchAllTickers(exchange: ExchangeName): Promise<string[]> {
  // НОВЫЙ URL: Запрос идет на ваш локальный API Route
  const url = `/api/proxy/tickers?exchange=${exchange}`;

  try {
    // В запросе отправляем только exchange
    const response = await axios.get(url, { timeout: 10000 });

    // Логика обработки данных остается здесь (на клиенте)
    switch (exchange) {
      case "Binance":
        return response.data.symbols
          .filter(
            (s: any) => s.contractType === "PERPETUAL" && s.status === "TRADING" && s.symbol.endsWith("USDT")
          )
          .map((s: any) => s.symbol);
      case "Bybit":
        return response.data.result.list
          .filter((s: any) => s.symbol.endsWith("USDT"))
          .map((s: any) => s.symbol);
      case "Mexc":
        return response.data?.data?.filter((s: any) => s.endsWith("USDT"));
      case "BingX":
        return response.data.data
          .filter((s: any) => s.status === 1 && s.symbol.endsWith("USDT"))
          .map((s: any) => s.symbol);
      case "Gate":
        return response.data
          .filter((s: any) => s.status === "trading" && s.name.endsWith("USDT"))
          .map((s: any) => s.name);
      default:
        return [];
    }
  } catch (error) {
    console.error(
      `Ошибка при получении списка тикеров для ${exchange} (Через прокси):`,
      error instanceof Error ? error.message : "Unknown Error"
    );
    return [];
  }
}
