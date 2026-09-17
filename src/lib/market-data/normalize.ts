import type { MarketAssetDefinition, NormalizedQuote, PriceDirection, RawMarketQuote } from './types';

/**
 * Safely converts any value to a valid number with fallback.
 */
export function sanitizeNumber(value: any, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) || !Number.isFinite(parsed) ? fallback : parsed;
}

/**
 * Determines price direction based on change value.
 */
export function calculateDirection(priceChange: number): PriceDirection {
  if (priceChange > 0.0001) return 'UP';
  if (priceChange < -0.0001) return 'DOWN';
  return 'NEUTRAL';
}

/**
 * Converts English digits and standard separators to Persian digits.
 */
export function toPersianDigits(text: string | number): string {
  const str = String(text);
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str
    .replace(/,/g, '٬')
    .replace(/\d/g, (d) => farsiDigits[parseInt(d, 10)] || d);
}

/**
 * Generates a realistic 7-point sparkline array for asset trend display when historical ticks are missing.
 */
export function generateSparkline(currentPrice: number, percentChange: number): number[] {
  const points: number[] = [];
  const startPrice = currentPrice / (1 + (percentChange / 100 || 0));
  const step = (currentPrice - startPrice) / 6;

  for (let i = 0; i < 7; i++) {
    const noise = (Math.random() - 0.5) * (currentPrice * 0.002);
    const val = startPrice + step * i + noise;
    points.push(Math.round(val * 100) / 100);
  }
  points[6] = currentPrice;
  return points;
}

/**
 * Normalizes raw quote payload from external/fallback providers into canonical internal NormalizedQuote representation.
 */
export function normalizeQuote(
  asset: MarketAssetDefinition,
  rawQuote?: RawMarketQuote,
  isStale = false
): NormalizedQuote {
  const fallbackPrice = asset.basePriceFallback;
  const currentPrice = sanitizeNumber(rawQuote?.price, fallbackPrice);
  const buyPrice = rawQuote?.buyPrice ? sanitizeNumber(rawQuote.buyPrice, asset.buyPriceFallback || currentPrice) : null;
  const sellPrice = rawQuote?.sellPrice ? sanitizeNumber(rawQuote.sellPrice, asset.sellPriceFallback || currentPrice) : null;

  let priceChange = sanitizeNumber(rawQuote?.priceChange, 0);
  let percentChange = sanitizeNumber(rawQuote?.percentChange, 0);

  if (priceChange === 0 && percentChange !== 0) {
    priceChange = (currentPrice * percentChange) / 100;
  } else if (percentChange === 0 && priceChange !== 0 && currentPrice > 0) {
    percentChange = (priceChange / (currentPrice - priceChange)) * 100;
  }

  const direction = calculateDirection(priceChange);
  const nowIso = new Date().toISOString();
  const providerTimestamp = rawQuote?.timestamp ? new Date(rawQuote.timestamp).toISOString() : nowIso;

  return {
    symbol: asset.symbol,
    slug: asset.slug,
    nameFa: asset.nameFa,
    nameEn: asset.nameEn,
    category: asset.category,
    market: asset.market,
    currentPrice: Math.round(currentPrice * 100) / 100,
    buyPrice: buyPrice ? Math.round(buyPrice * 100) / 100 : null,
    sellPrice: sellPrice ? Math.round(sellPrice * 100) / 100 : null,
    priceChange: Math.round(priceChange * 100) / 100,
    percentChange: Math.round(percentChange * 100) / 100,
    direction,
    unit: asset.unit,
    provider: rawQuote?.provider || 'SYSTEM',
    isStale,
    providerTimestamp,
    fetchedAt: nowIso,
    sparkline: generateSparkline(currentPrice, percentChange),
    seoTitle: asset.seoTitle,
    seoDescription: asset.seoDescription,
  };
}

/**
 * Formats market price with correct unit and Persian digits.
 */
export function formatMarketValue(value: number, unit: string): string {
  const safeVal = sanitizeNumber(value, 0);

  if (unit.includes('دلار') || unit.includes('USD')) {
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: safeVal > 1000 ? 2 : 4,
      minimumFractionDigits: safeVal > 1000 ? 2 : 2,
    }).format(safeVal);
    return `${toPersianDigits(formatted)} ${unit}`;
  }

  // Toman or Iranian domestic
  const rounded = Math.round(safeVal);
  const formatted = new Intl.NumberFormat('en-US', { useGrouping: true }).format(rounded);
  return `${toPersianDigits(formatted)} ${unit}`;
}
