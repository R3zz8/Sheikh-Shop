import { CORE_MARKET_ASSETS, MARKET_CATEGORIES } from './symbols';
import type { ConversionResult, HistoryPoint, MarketCategory, MarketOverview, NormalizedQuote } from './types';
import { normalizeQuote, sanitizeNumber, toPersianDigits } from './normalize';
import { fetchFallbackMarketData, fetchPrimaryMarketData } from './providers/primary';
import { getCachedData, setCachedData } from './cache';

const OVERVIEW_CACHE_KEY = 'market:overview:latest';
const HISTORY_CACHE_PREFIX = 'market:history:';

/**
 * Single-flight promise guard against request stampedes during concurrent market refreshes.
 */
let pendingOverviewPromise: Promise<MarketOverview> | null = null;

/**
 * Service function fetching and normalizing market overview with Stale-While-Revalidate caching.
 */
export async function getMarketOverview(forceRefresh = false): Promise<MarketOverview> {
  if (!forceRefresh) {
    const cached = getCachedData<MarketOverview>(OVERVIEW_CACHE_KEY, 60 * 1000);
    if (cached.data && !cached.isStale) {
      return cached.data;
    }
  }

  if (pendingOverviewPromise) {
    return pendingOverviewPromise;
  }

  pendingOverviewPromise = (async () => {
    try {
      const providerResult = await fetchPrimaryMarketData();
      const rawQuotes = providerResult.success ? providerResult.quotes : fetchFallbackMarketData().quotes;

      const normalizedQuotes: NormalizedQuote[] = CORE_MARKET_ASSETS.map((asset) => {
        const raw = rawQuotes[asset.symbol];
        return normalizeQuote(asset, raw, !providerResult.success);
      });

      const featured = normalizedQuotes.filter((q) => {
        const def = CORE_MARKET_ASSETS.find((a) => a.symbol === q.symbol);
        return def?.isFeatured;
      });

      const categoriesWithCount = MARKET_CATEGORIES.filter((c) => c.key !== 'ALL').map((cat) => ({
        key: cat.key as MarketCategory,
        labelFa: cat.labelFa,
        count: normalizedQuotes.filter((q) => q.category === cat.key).length,
      }));

      const overview: MarketOverview = {
        quotes: normalizedQuotes,
        featured,
        categories: categoriesWithCount,
        lastUpdated: new Date().toISOString(),
        providerStatus: [
          {
            providerName: providerResult.provider,
            status: providerResult.success ? 'HEALTHY' : 'DEGRADED',
            lastSuccessFetch: new Date().toISOString(),
            latencyMs: providerResult.latencyMs || 0,
          },
        ],
      };

      setCachedData(OVERVIEW_CACHE_KEY, overview);
      return overview;
    } catch (error) {
      // Last-known good fallback
      const staleCached = getCachedData<MarketOverview>(OVERVIEW_CACHE_KEY, 24 * 60 * 60 * 1000);
      if (staleCached.data) {
        return {
          ...staleCached.data,
          quotes: staleCached.data.quotes.map((q) => ({ ...q, isStale: true })),
        };
      }

      // Zero-network fallback
      const fallback = fetchFallbackMarketData();
      const fallbackQuotes = CORE_MARKET_ASSETS.map((asset) =>
        normalizeQuote(asset, fallback.quotes[asset.symbol], true)
      );

      return {
        quotes: fallbackQuotes,
        featured: fallbackQuotes.filter((q) => ['USD', 'GOLD_18K', 'COIN_EMAMI', 'BRENT_OIL'].includes(q.symbol)),
        categories: MARKET_CATEGORIES.filter((c) => c.key !== 'ALL').map((cat) => ({
          key: cat.key as MarketCategory,
          labelFa: cat.labelFa,
          count: fallbackQuotes.filter((q) => q.category === cat.key).length,
        })),
        lastUpdated: new Date().toISOString(),
        providerStatus: [
          {
            providerName: 'SHEIKH_FALLBACK_INDEX',
            status: 'DEGRADED',
            lastSuccessFetch: null,
            latencyMs: 1,
          },
        ],
      };
    } finally {
      pendingOverviewPromise = null;
    }
  })();

  return pendingOverviewPromise;
}

/**
 * Retrieves a single asset quote with surrounding canonical metadata and related market assets.
 */
export async function getAssetBySlug(slug: string): Promise<{ quote: NormalizedQuote; related: NormalizedQuote[] } | null> {
  const overview = await getMarketOverview();
  const quote = overview.quotes.find((q) => q.slug.toLowerCase() === slug.toLowerCase());

  if (!quote) return null;

  const related = overview.quotes
    .filter((q) => q.category === quote.category && q.slug !== quote.slug)
    .slice(0, 4);

  return { quote, related };
}

/**
 * Generates historical trend data points (1D, 7D, 1M, 1Y) for asset charts.
 */
export async function getAssetHistory(slug: string, timeframe: '1D' | '7D' | '1M' | '1Y' = '7D'): Promise<HistoryPoint[]> {
  const cacheKey = `${HISTORY_CACHE_PREFIX}${slug}:${timeframe}`;
  const cached = getCachedData<HistoryPoint[]>(cacheKey, 5 * 60 * 1000);
  if (cached.data) return cached.data;

  const assetData = await getAssetBySlug(slug);
  if (!assetData) return [];

  const currentPrice = assetData.quote.currentPrice;
  const pointsCount = timeframe === '1D' ? 24 : timeframe === '7D' ? 7 : timeframe === '1M' ? 30 : 52;
  const volatility = timeframe === '1D' ? 0.005 : timeframe === '7D' ? 0.015 : timeframe === '1M' ? 0.04 : 0.12;

  const points: HistoryPoint[] = [];
  const now = Date.now();
  const intervalMs =
    timeframe === '1D'
      ? 3600 * 1000
      : timeframe === '7D'
      ? 24 * 3600 * 1000
      : timeframe === '1M'
      ? 24 * 3600 * 1000
      : 7 * 24 * 3600 * 1000;

  let simulatedPrice = currentPrice * (1 - (assetData.quote.percentChange / 100 || 0));

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs).toISOString();
    const noise = (Math.random() - 0.49) * (simulatedPrice * volatility);
    simulatedPrice = Math.max(1, simulatedPrice + noise);

    const open = Math.round(simulatedPrice * 0.998 * 100) / 100;
    const high = Math.round(simulatedPrice * 1.005 * 100) / 100;
    const low = Math.round(simulatedPrice * 0.992 * 100) / 100;

    points.push({
      timestamp,
      price: Math.round(simulatedPrice * 100) / 100,
      open,
      high,
      low,
      close: Math.round(simulatedPrice * 100) / 100,
    });
  }

  // Ensure last point aligns with current price
  if (points.length > 0) {
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      lastPoint.price = currentPrice;
    }
  }

  setCachedData(cacheKey, points);
  return points;
}

/**
 * Converts financial values between any two supported market assets.
 */
export async function convertMarketAsset(
  fromSymbol: string,
  toSymbol: string,
  amount: number
): Promise<ConversionResult | null> {
  const safeAmount = sanitizeNumber(amount, 1);
  const overview = await getMarketOverview();

  const fromQuote = overview.quotes.find((q) => q.symbol.toUpperCase() === fromSymbol.toUpperCase() || q.slug === fromSymbol);
  const toQuote = overview.quotes.find((q) => q.symbol.toUpperCase() === toSymbol.toUpperCase() || q.slug === toSymbol);

  if (!fromQuote || !toQuote) return null;

  // Convert source to Toman base equivalent
  let sourceInToman = fromQuote.currentPrice;
  if (fromQuote.market !== 'DOMESTIC') {
    const usdQuote = overview.quotes.find((q) => q.symbol === 'USD');
    const usdToman = usdQuote?.currentPrice || 94800;
    sourceInToman = fromQuote.currentPrice * usdToman;
  }

  // Convert target to Toman base equivalent
  let targetInToman = toQuote.currentPrice;
  if (toQuote.market !== 'DOMESTIC') {
    const usdQuote = overview.quotes.find((q) => q.symbol === 'USD');
    const usdToman = usdQuote?.currentPrice || 94800;
    targetInToman = toQuote.currentPrice * usdToman;
  }

  const rate = sourceInToman / targetInToman;
  const convertedAmount = Math.round(safeAmount * rate * 100) / 100;

  const formattedResult = `${toPersianDigits(new Intl.NumberFormat('en-US').format(safeAmount))} ${fromQuote.nameFa} = ${toPersianDigits(
    new Intl.NumberFormat('en-US').format(convertedAmount)
  )} ${toQuote.nameFa}`;

  return {
    fromSymbol: fromQuote.symbol,
    toSymbol: toQuote.symbol,
    amount: safeAmount,
    convertedAmount,
    rate,
    formattedResult,
    lastUpdated: overview.lastUpdated,
  };
}
