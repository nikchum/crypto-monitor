// lib/api.ts
import axios from "axios";

// ---------------------- Эндпоинты для ЦЕНЫ (fetchPrice) ----------------------
export const EXCHANGES = {
  Binance: (ticker: string) => `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${ticker.toUpperCase()}`,
  Bybit: (ticker: string) =>
    `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${ticker.toUpperCase()}`,
  Mexc: (ticker: string) => `https://api.mexc.com/api/v3/ticker/price?symbol=${ticker.toUpperCase()}`,
  BingX: (ticker: string) =>
    `https://open-api.bingx.com/openApi/swap/v2/quote/price?symbol=${ticker.toUpperCase()}`,
  Gate: (ticker: string) =>
    `https://api.gateio.ws/api/v4/futures/usdt/tickers?currency_pair=${ticker.toUpperCase()}`,
};

export type ExchangeName = keyof typeof EXCHANGES;

export async function fetchPrice(exchange: ExchangeName, ticker: string): Promise<number | null> {
  const urlGetter = EXCHANGES[exchange];
  if (!urlGetter) return null;

  const url = urlGetter(ticker);

  try {
    const response = await axios.get(url, { timeout: 5000 });
    let price: string | number | undefined;

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
        price = response.data?.[0]?.last;
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

// ---------------------- Эндпоинты для СПИСКА ТИКЕРОВ (fetchAllTickers) ----------------------
export const TICKET_LIST_ENDPOINTS: Record<ExchangeName, string> = {
  Binance: "https://fapi.binance.com/fapi/v1/exchangeInfo",
  Bybit: "https://api.bybit.com/v5/market/tickers?category=linear&quoteCoin=USDT",
  Mexc: "https://api.mexc.com/api/v3/defaultSymbols",
  BingX: "https://open-api.bingx.com/openApi/swap/v2/quote/contracts",
  Gate: "https://api.gateio.ws/api/v4/futures/usdt/contracts",
};

export async function fetchAllTickers(exchange: ExchangeName): Promise<string[]> {
  const url = TICKET_LIST_ENDPOINTS[exchange];
  if (!url) return [];

  try {
    const response = await axios.get(url, { timeout: 10000 });

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
        return response.data.filter((s: any) => s.endsWith("USDT")).map((s: any) => s);
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
      `Ошибка при получении списка тикеров для ${exchange}:`,
      error instanceof Error ? error.message : "Unknown Error"
    );
    return [];
  }
}
