import {
  fetchTipaxToken,
  getValidTipaxToken,
  clearTipaxTokenCache,
} from '../auth';
import { resolveTipaxCityId, normalizePersianText } from '../cities';
import {
  TipaxClient,
  getTipaxShippingQuote,
  createTipaxOrderServer,
  getTipaxTrackingServer,
  mapTipaxStatusToPersian,
} from '../client';

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

  describe('Authentication, Mutex & Token Caching', () => {
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

    it('prevents concurrent duplicate token requests using single-flight mutex', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    accessToken: 'single_flight_token_999',
                    expiresIn: 3600,
                  }),
                }),
              20
            )
          )
      );

      // Trigger concurrent fetches simultaneously
      const [p1, p2, p3] = await Promise.all([
        fetchTipaxToken(),
        fetchTipaxToken(),
        fetchTipaxToken(),
      ]);

      expect(p1?.accessToken).toBe('single_flight_token_999');
      expect(p2?.accessToken).toBe('single_flight_token_999');
      expect(p3?.accessToken).toBe('single_flight_token_999');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Metadata & Reference APIs', () => {
    it('returns payment types with correct Persian titles and descriptions', async () => {
      const paymentTypes = await TipaxClient.getPaymentTypes();
      expect(paymentTypes.length).toBeGreaterThanOrEqual(3);
      expect(paymentTypes[0].id).toBe(1);
      expect(paymentTypes[0].title).toContain('نقدی');
    });

    it('returns default packing price profiles when API is offline', async () => {
      const packingPrices = await TipaxClient.getPackingPrices();
      expect(packingPrices.length).toBeGreaterThan(0);
      expect(packingPrices.some((p) => p.id === 20)).toBe(true);
    });
  });

  describe('Dynamic Pricing Calculation & Fallbacks', () => {
    it('returns dynamic Tipax shipping cost when API call succeeds', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'mock_token', expiresIn: 3600 }),
        } as Response)
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

  describe('Order Creation & Idempotency', () => {
    it('submits order payload and returns tracking code on success', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'auth_token', expiresIn: 3600 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isSuccess: true,
            data: {
              orderId: 'TPX-987654',
              trackingCode: '100200300400',
              price: 2800000,
            },
          }),
        } as Response);

      const result = await createTipaxOrderServer({
        orderId: 'ord_12345',
        recipientName: 'رضا دهقانی',
        recipientPhone: '09178769556',
        province: 'فارس',
        city: 'شیراز',
        address: 'خیابان ملاصدرا، پلاک ۱۰',
        postalCode: '7134567890',
        totalValueToman: 1500000,
        items: [
          { productName: 'زعفران ممتاز شیخ', quantity: 2, weightKg: 0.5, priceToman: 750000 },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.trackingCode).toBe('100200300400');
      expect(result.tipaxOrderId).toBe('TPX-987654');
    });

    it('handles auth token missing error gracefully without throwing', async () => {
      const result = await createTipaxOrderServer({
        orderId: 'ord_99999',
        recipientName: 'علی محمدی',
        recipientPhone: '09121111111',
        province: 'تهران',
        city: 'تهران',
        address: 'خیابان آزادی',
        postalCode: '1234567890',
        totalValueToman: 2000000,
        items: [{ quantity: 1 }],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Tracking API & Persian Status Translations', () => {
    it('maps English status strings to Persian status titles', () => {
      expect(mapTipaxStatusToPersian('REGISTERED')).toBe('ثبت شده در سیستم تیپاکس');
      expect(mapTipaxStatusToPersian('COLLECTED')).toBe('جمع‌آوری شده توسط نماینده تیپاکس');
      expect(mapTipaxStatusToPersian('IN_TRANSIT')).toBe('در حال ارسال و هاب پردازش');
      expect(mapTipaxStatusToPersian('OUT_FOR_DELIVERY')).toBe('تحویل به موزع جهت توزیع');
      expect(mapTipaxStatusToPersian('DELIVERED')).toBe('تحویل داده شد به گیرنده');
    });

    it('returns formatted tracking details from Tipax Client', async () => {
      process.env.TIPAX_USERNAME = 'test_user';
      process.env.TIPAX_PASSWORD = 'test_password';

      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ accessToken: 'auth_token', expiresIn: 3600 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            isSuccess: true,
            data: {
              trackingCode: '100200300400',
              currentStatus: 'IN_TRANSIT',
              currentStatusTitle: 'در حال ارسال و هاب پردازش',
              senderName: 'فروشگاه شیخ',
              receiverName: 'رضا دهقانی',
              originCity: 'تهران',
              destinationCity: 'شیراز',
              events: [
                {
                  status: 'REGISTERED',
                  title: 'ثبت شده در سیستم',
                  timestamp: '2026-03-01T10:00:00Z',
                },
              ],
            },
          }),
        } as Response);

      const res = await getTipaxTrackingServer('100200300400');

      expect(res.success).toBe(true);
      expect(res.trackingCode).toBe('100200300400');
      expect(res.status).toBe('IN_TRANSIT');
      expect(res.statusTitlePersian).toBe('در حال ارسال و هاب پردازش');
      expect(res.events.length).toBeGreaterThan(0);
    });
  });
});
