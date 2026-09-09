import { normalizePersianDigits, normalizeIranianMobile, isValidIranianMobile, isValidIranianPostalCode } from '@/lib/validation';
import { getTipaxShippingQuoteServer } from '@/lib/tipax/pricing';

describe('Checkout Mobile & Postal Code Validation & Tipax Fallback', () => {
  it('normalizes Persian and Arabic numerals to ASCII digits and strips unicode ZWNJs', () => {
    const inputWithPersianAndZwnj = '۰۹۱۲۳۴۵۶۷۸۹\u200c';
    const normalized = normalizePersianDigits(inputWithPersianAndZwnj);
    expect(normalized).toBe('09123456789');
  });

  it('validates standard 11-digit Iranian mobile numbers', () => {
    expect(isValidIranianMobile('09123456789')).toBe(true);
    expect(isValidIranianMobile('۰۹۱۲۳۴۵۶۷۸۹')).toBe(true);
    expect(isValidIranianMobile('+989123456789')).toBe(true);
    expect(isValidIranianMobile('00989123456789')).toBe(true);
    expect(isValidIranianMobile('9123456789')).toBe(true);
  });

  it('rejects invalid mobile numbers', () => {
    expect(isValidIranianMobile('08123456789')).toBe(false);
    expect(isValidIranianMobile('091234567')).toBe(false);
    expect(isValidIranianMobile('091234567890')).toBe(false);
    expect(isValidIranianMobile('abc')).toBe(false);
  });

  it('validates 10-digit Iranian postal codes', () => {
    expect(isValidIranianPostalCode('1234567890')).toBe(true);
    expect(isValidIranianPostalCode('۱۲۳۴۵۶۷۸۹۰')).toBe(true);
    expect(isValidIranianPostalCode('12345')).toBe(false);
  });

  it('returns clean user-friendly fallback shipping quote when Tipax auth/network is unavailable', async () => {
    const quote = await getTipaxShippingQuoteServer({
      destinationCityName: 'بوشهر',
      destinationProvinceName: 'بوشهر',
      totalValueToman: 500000,
    });

    expect(quote.isFallback).toBe(true);
    expect(quote.shippingCostToman).toBeGreaterThan(0);
    expect(quote.message).toBe('تعرفه عمومی ارسال');
    expect(quote.message).not.toContain('auth unavailable');
  });
});
