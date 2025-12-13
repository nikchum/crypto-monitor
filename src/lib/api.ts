// lib/api.ts
import axios from "axios";

export const EXCHANGES = {
  Binance: (ticker: string) => `https://api.binance.com/api/v3/ticker/price?symbol=${ticker.toUpperCase()}`,
  Bybit: (ticker: string) =>
    `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${ticker.toUpperCase()}`,
  Mexc: (ticker: string) => `https://api.mexc.com/api/v3/ticker/price?symbol=${ticker.toUpperCase()}`,
  BingX: (ticker: string) =>
    `https://open-api.bingx.com/openApi/swap/v2/quote/price?symbol=${ticker.toUpperCase()}`,
  Gate: (ticker: string) =>
    `https://api.gateio.ws/api/v4/futures/usdt/tickers?currency_pair=${ticker.toUpperCase()}`,
};

export type ExchangeName = keyof typeof EXCHANGES;

// Получение цены с биржи
export async function fetchPrice(exchange: ExchangeName, ticker: string): Promise<number | null> {
  const urlGetter = EXCHANGES[exchange];
  if (!urlGetter) return null;

  const url = urlGetter(ticker);

  try {
    const response = await axios.get(url, { timeout: 5000 });
    let price: string | number | undefined;

    // Парсинг ответа для каждой биржи
    switch (exchange) {
      case "Binance":
      case "Mexc":
        price = response.data.price;
        break;
      case "Bybit":
        price = response.data.result.list[0]?.lastPrice;
        break;
      case "BingX":
        price = response.data.data?.price;
        break;
      case "Gate":
        price = response.data.data[0]?.last;
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
      `Ошибка при получении ${ticker} с ${exchange}:`,
      error instanceof Error ? error.message : "Unknown Error"
    );
    return null;
  }
}

// Новые эндпоинты для получения ВСЕХ тикеров фьючерсов
export const TICKET_LIST_ENDPOINTS: Record<ExchangeName, string> = {
  Binance: "https://fapi.binance.com/fapi/v1/exchangeInfo", // Binance Futures
  Bybit: "https://api.bybit.com/v5/market/tickers?category=linear", // Bybit Linear Futures
  Mexc: "https://api.mexc.com/api/v3/defaultSymbols", // MEXC Futures
  BingX: "https://open-api.bingx.com/openApi/swap/v2/market/allSymbols", // BingX Futures
  Gate: "https://api.gateio.ws/api/v4/futures/usdt/contracts", // Gate USDT Futures
};

// Функция для получения и парсинга списка тикеров
export async function fetchAllTickers(exchange: ExchangeName): Promise<string[]> {
  const url = TICKET_LIST_ENDPOINTS[exchange];
  if (!url) return [];

  try {
    const response = await axios.get(url, { timeout: 10000 }); // Увеличим таймаут

    switch (exchange) {
      case "Binance":
        // Фильтруем только активные USDT фьючерсы
        return response.data.symbols
          .filter(
            (s: any) => s.contractType === "PERPETUAL" && s.status === "TRADING" && s.symbol.endsWith("USDT")
          )
          .map((s: any) => s.symbol);

      case "Bybit":
        // Bybit возвращает сразу тикеры в list
        return response.data.result.list.map((s: any) => s.symbol);

      case "Mexc":
        // MEXC
        return response.data.map((s: any) => s.symbol);

      case "BingX":
        // BingX
        return response.data.data.filter((s: any) => s.status === "TRADING").map((s: any) => s.symbol);

      case "Gate":
        // Gate.io
        return response.data.map((s: any) => s.name);

      default:
        return [];
    }
  } catch (error) {
    console.error(
      `Ошибка при получении списка тикеров для ${exchange}:`,
      error instanceof Error ? error.message : "Unknown Error"
    );
    return [];
  }
}

// Заглушка для получения списка тикеров (поскольку нет простого API для всех фьючей)
export const DUMMY_TICKERS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "LINKUSDT"];
