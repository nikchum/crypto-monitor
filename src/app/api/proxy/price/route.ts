// src/app/api/proxy/price/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { ExchangeName } from "@/lib/api"; // Импортируем типы

// Объявляем внешние URL-адреса только здесь (на сервере)
const EXTERNAL_PRICE_ENDPOINTS: Record<ExchangeName, (ticker: string) => string> = {
  Binance: (ticker) => `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${ticker}`,
  Bybit: (ticker) => `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${ticker}`,
  Mexc: (ticker) => `https://api.mexc.com/api/v3/ticker/price?symbol=${ticker}`,
  BingX: (ticker) => `https://open-api.bingx.com/openApi/swap/v2/quote/price?symbol=${ticker}`,
  Gate: (ticker) => `https://api.gateio.ws/api/v4/futures/usdt/contracts/${ticker}`,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exchange = searchParams.get("exchange") as ExchangeName;
    const ticker = searchParams.get("ticker")?.toUpperCase();

    if (!exchange || !ticker || !EXTERNAL_PRICE_ENDPOINTS[exchange]) {
      return NextResponse.json({ error: "Missing exchange or ticker" }, { status: 400 });
    }

    const url = EXTERNAL_PRICE_ENDPOINTS[exchange](ticker);

    // Выполняем запрос с сервера
    const response = await axios.get(url, { timeout: 5000 });

    // Возвращаем сырой ответ
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("SERVER PRICE PROXY ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
