import { normalizeQuote, sanitizeNumber, calculateDirection, toPersianDigits, formatMarketValue } from '@/lib/market-data/normalize';
import { CORE_MARKET_ASSETS } from '@/lib/market-data/symbols';
import { convertMarketAsset } from '@/lib/market-data/service';
import { fetchTindexMarketData } from '@/lib/market-data/providers/tindex';

describe('Market Subsystem Unit Tests', () => {
  test('sanitizeNumber cleans corrupted or missing values', () => {
    expect(sanitizeNumber(null, 10)).toBe(10);
    expect(sanitizeNumber(undefined, 5)).toBe(5);
    expect(sanitizeNumber('123.45', 0)).toBe(123.45);
    expect(sanitizeNumber('invalid', 99)).toBe(99);
  });

  test('calculateDirection identifies price movements accurately', () => {
    expect(calculateDirection(150)).toBe('UP');
    expect(calculateDirection(-20)).toBe('DOWN');
    expect(calculateDirection(0)).toBe('NEUTRAL');
  });

  test('toPersianDigits converts digits and separators', () => {
    expect(toPersianDigits('12,345')).toBe('۱۲٬۳۴۵');
    expect(toPersianDigits(94800)).toBe('۹۴۸۰۰');
  });

  test('normalizeQuote normalizes asset quotes correctly', () => {
    const usdAsset = CORE_MARKET_ASSETS[0]!;
    const normalized = normalizeQuote(usdAsset, {
      symbol: 'USD',
      price: 95000,
      priceChange: 500,
      percentChange: 0.53,
      unit: 'تومان',
      provider: 'TINDEX_API',
    });

    expect(normalized.symbol).toBe('USD');
    expect(normalized.slug).toBe('usd');
    expect(normalized.currentPrice).toBe(95000);
    expect(normalized.direction).toBe('UP');
    expect(normalized.provider).toBe('TINDEX_API');
    expect(normalized.sparkline).toHaveLength(7);
  });

  test('formatMarketValue formats values with Persian digits and unit', () => {
    const formatted = formatMarketValue(94800, 'تومان');
    expect(formatted).toContain('۹۴٬۸۰۰ تومان');
  });

  test('convertMarketAsset performs conversions between assets', async () => {
    const conversion = await convertMarketAsset('USD', 'USD', 100);
    expect(conversion).not.toBeNull();
    if (conversion) {
      expect(conversion.amount).toBe(100);
      expect(conversion.convertedAmount).toBe(100);
    }
  });

  test('fetchTindexMarketData returns graceful error when TINDEX_API_TOKEN is unconfigured', async () => {
    const result = await fetchTindexMarketData();
    expect(result.provider).toBe('TINDEX_API');
    expect(result.success).toBe(false);
    expect(result.error).toContain('TINDEX_API_TOKEN');
  });
});
