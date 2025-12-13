// src/app/api/proxy/tickers/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { ExchangeName } from "@/lib/api"; // Импортируем типы

// Объявляем внешние URL-адреса только здесь (на сервере)
const EXTERNAL_TICKER_ENDPOINTS: Record<ExchangeName, string> = {
  Binance: "https://fapi.binance.com/fapi/v1/exchangeInfo",
  Bybit: "https://api.bybit.com/v5/market/tickers?category=linear&quoteCoin=USDT",
  Mexc: "https://contract.mexc.com/api/v1/contract/detail",
  BingX: "https://open-api.bingx.com/openApi/swap/v2/quote/contracts",
  Gate: "https://api.gateio.ws/api/v4/futures/usdt/contracts",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exchange = searchParams.get("exchange") as ExchangeName;

    if (!exchange || !EXTERNAL_TICKER_ENDPOINTS[exchange]) {
      return NextResponse.json({ error: "Missing exchange" }, { status: 400 });
    }

    const url = EXTERNAL_TICKER_ENDPOINTS[exchange];

    // Выполняем запрос с сервера
    const response = await axios.get(url, { timeout: 10000 });

    // Возвращаем сырой ответ
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("SERVER TICKER PROXY ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch tickers list" }, { status: 500 });
  }
}
