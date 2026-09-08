import {
  fetchTipaxToken,
  getValidTipaxToken,
  clearTipaxTokenCache,
} from '../auth';
import { resolveTipaxCityId, normalizePersianText } from '../cities';
import { getTipaxShippingQuote } from '../client';

describe('Tipax Shipping Integration Unit Tests', () => {
  beforeEach(() => {
    clearTipaxTokenCache();
    delete process.env.TIPAX_USERNAME;
    delete process.env.TIPAX_PASSWORD;
    delete process.env.TIPAX_API_KEY;
  });

  describe('City Mapping & Persian Normalization', () => {
    it('normalizes Persian characters correctly', () => {
      expect(normalizePersianText('تهران‌')).toBe('تهران');
      expect(normalizePersianText('شيراز')).toBe('شیراز');
      expect(normalizePersianText('اصفهان‌کاشان')).toBe('اصفهان کاشان');
    });

    it('resolves city IDs for major Iranian cities', () => {
      expect(resolveTipaxCityId('تهران')).toBe(1);
      expect(resolveTipaxCityId('شیراز')).toBe(101);
      expect(resolveTipaxCityId('اصفهان')).toBe(201);
      expect(resolveTipaxCityId('مشهد')).toBe(301);
      expect(resolveTipaxCityId('تبریز')).toBe(401);
    });

    it('falls back to province capital or default origin ID for unknown city', () => {
      expect(resolveTipaxCityId('شهرنامشخص', 'فارس')).toBe(101); // Fars capital Shiraz = 101
      expect(resolveTipaxCityId('شهرنامشخص', 'استان‌نامشخص')).toBe(1); // Default Tehran = 1
    });
  });

  describe('Authentication & Token Caching', () => {
    it('returns null when environment variables are missing', async () => {
      const token = await fetchTipaxToken();
      expect(token).toBeNull();
    });

    it('caches valid token and reuses it before expiration', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accessToken: 'mock_access_token_123',
          expiresIn: 3600,
        }),
      } as Response);

      const token1 = await getValidTipaxToken();
      expect(token1).toBe('mock_access_token_123');

      // Second call should hit in-memory cache without calling fetch again
      const token2 = await getValidTipaxToken();
      expect(token2).toBe('mock_access_token_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dynamic Pricing Calculation & Fallbacks', () => {
    it('returns dynamic Tipax shipping cost when API call succeeds', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      // Mock auth token response
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'mock_token', expiresIn: 3600 }),
        } as Response)
        // Mock pricing response
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isSuccess: true,
            data: {
              finalPrice: 2500000, // 2,500,000 Rial = 250,000 Toman
            },
          }),
        } as Response);

      const quote = await getTipaxShippingQuote({
        destinationCityName: 'شیراز',
        destinationProvinceName: 'فارس',
        totalValueToman: 500000,
        items: [
          {
            quantity: 2,
            product: { weight: 1.5, shippingCost: null, allowFreeShipping: false },
          },
        ],
      });

      expect(quote.isFallback).toBe(false);
      expect(quote.provider).toBe('TIPAX');
      expect(quote.shippingCostToman).toBe(250000);
      expect(quote.currency).toBe('TOMAN');
    });

    it('safely falls back to default engine when Tipax fails or times out', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn().mockRejectedValue(new Error('Network Timeout'));

      const quote = await getTipaxShippingQuote({
        destinationCityName: 'اصفهان',
        totalValueToman: 300000,
        items: [
          {
            quantity: 1,
            product: { shippingCost: 180000, allowFreeShipping: false },
          },
        ],
      });

      expect(quote.isFallback).toBe(true);
      expect(quote.provider).toBe('DEFAULT_FALLBACK');
      expect(quote.shippingCostToman).toBe(180000);
    });
  });
});
