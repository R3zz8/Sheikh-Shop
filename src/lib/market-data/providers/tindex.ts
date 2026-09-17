import type { ProviderFetchResult, RawMarketQuote } from '../types';
import { CORE_MARKET_ASSETS } from '../symbols';

const TINDEX_API_BASE_URL = process.env.TINDEX_API_BASE_URL || 'https://tindex.app';
const TINDEX_API_TOKEN = process.env.TINDEX_API_TOKEN;
const TINDEX_TIMEOUT_MS = parseInt(process.env.TINDEX_API_TIMEOUT_MS || '8000', 10);

/**
 * Symbol mapping dictionary from Sheikh canonical symbols to Tindex provider keys.
 */
const TINDEX_SYMBOL_MAP: Record<string, string[]> = {
  USD: ['USD', 'usd', 'price_dollar_rl', 'usd_free'],
  EUR: ['EUR', 'eur', 'price_eur'],
  GBP: ['GBP', 'gbp', 'price_gbp'],
  AED: ['AED', 'aed', 'price_aed'],
  TRY: ['TRY', 'try', 'price_try'],
  CNY: ['CNY', 'cny', 'price_cny'],
  RUB: ['RUB', 'rub', 'price_rub'],
  GOLD_18K: ['GOLD-18K', 'gold_18k', 'geram18', 'gold_18'],
  GOLD_24K: ['GOLD-24K', 'gold_24k', 'geram24'],
  COIN_EMAMI: ['emami-coin', 'sekke_emami', 'coin_emami'],
  COIN_BAHAR: ['bahar-coin', 'sekke_bahar'],
  COIN_HALF: ['half-coin', 'sekke_nim'],
  COIN_QUARTER: ['quarter-coin', 'sekke_rob'],
  XAU_USD: ['xauusd', 'XAUUSD', 'gold_ounce'],
  BRENT_OIL: ['brent-oil', 'BRENT', 'oil_brent'],
  WTI_OIL: ['WTI-OIL', 'WTI', 'oil_wti'],
  BTC: ['BTC', 'btc', 'bitcoin'],
  ETH: ['ETH', 'eth', 'ethereum'],
  SOL: ['SOL', 'sol', 'solana'],
};

/**
 * Fetches market data from Tindex API with strict token authorization, timeout protection,
 * and robust normalization mapping.
 */
export async function fetchTindexMarketData(): Promise<ProviderFetchResult> {
  const startTime = Date.now();
  const quotes: Record<string, RawMarketQuote> = {};

  if (!TINDEX_API_TOKEN) {
    return {
      provider: 'TINDEX_API',
      success: false,
      quotes: {},
      error: 'TINDEX_API_TOKEN environment variable not configured',
      latencyMs: 0,
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TINDEX_TIMEOUT_MS);

    const url = `${TINDEX_API_BASE_URL.replace(/\/$/, '')}/api/public/boards`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TINDEX_API_TOKEN}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      return {
        provider: 'TINDEX_API',
        success: false,
        quotes: {},
        error: `Tindex API returned status ${response.status}`,
        latencyMs,
      };
    }

    const json = await response.json();
    const rawItems: any[] = Array.isArray(json) ? json : json?.data || json?.boards || json?.items || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return {
        provider: 'TINDEX_API',
        success: false,
        quotes: {},
        error: 'Tindex API returned empty board items',
        latencyMs,
      };
    }

    // Index board items by lowercase symbol/key
    const boardIndex = new Map<string, any>();
    rawItems.forEach((item) => {
      const key = (item.symbol || item.key || item.slug || item.id || '').toString().toLowerCase();
      if (key) boardIndex.set(key, item);
    });

    CORE_MARKET_ASSETS.forEach((asset) => {
      const aliases = TINDEX_SYMBOL_MAP[asset.symbol] || [asset.symbol.toLowerCase()];
      let foundItem: any = null;

      for (const alias of aliases) {
        if (boardIndex.has(alias.toLowerCase())) {
          foundItem = boardIndex.get(alias.toLowerCase());
          break;
        }
      }

      if (foundItem) {
        const price = parseFloat(foundItem.price || foundItem.last_price || foundItem.p || foundItem.value || asset.basePriceFallback);
        const buyPrice = foundItem.buy_price || foundItem.buy ? parseFloat(foundItem.buy_price || foundItem.buy) : undefined;
        const sellPrice = foundItem.sell_price || foundItem.sell ? parseFloat(foundItem.sell_price || foundItem.sell) : undefined;
        const priceChange = parseFloat(foundItem.change || foundItem.price_change || foundItem.d || '0');
        const percentChange = parseFloat(foundItem.percent_change || foundItem.change_percent || foundItem.dp || '0');

        quotes[asset.symbol] = {
          symbol: asset.symbol,
          price: Number.isNaN(price) ? asset.basePriceFallback : price,
          buyPrice: buyPrice && !Number.isNaN(buyPrice) ? buyPrice : undefined,
          sellPrice: sellPrice && !Number.isNaN(sellPrice) ? sellPrice : undefined,
          priceChange: Number.isNaN(priceChange) ? 0 : priceChange,
          percentChange: Number.isNaN(percentChange) ? 0 : percentChange,
          unit: asset.unit,
          provider: 'TINDEX_API',
          timestamp: foundItem.updated_at ? new Date(foundItem.updated_at) : new Date(),
        };
      }
    });

    const success = Object.keys(quotes).length > 0;
    return {
      provider: 'TINDEX_API',
      success,
      quotes,
      latencyMs,
      error: success ? undefined : 'No matching symbols mapped from Tindex response',
    };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return {
      provider: 'TINDEX_API',
      success: false,
      quotes: {},
      error: error.message || 'Tindex network fetch error',
      latencyMs,
    };
  }
}
