import { SHIPPING_CONFIG, toPersianDigits, getFormattedEstimatedDelivery } from '@/lib/shipping';

describe('Centralized Shipping Estimated Delivery System', () => {
  test('should have a centralized shipping configuration with minDays and maxDays', () => {
    expect(SHIPPING_CONFIG).toBeDefined();
    expect(SHIPPING_CONFIG.estimatedDelivery).toBeDefined();
    expect(SHIPPING_CONFIG.estimatedDelivery.minDays).toBe(3);
    expect(SHIPPING_CONFIG.estimatedDelivery.maxDays).toBe(7);
  });

  test('should correctly convert English digits to Persian digits', () => {
    expect(toPersianDigits(3)).toBe('۳');
    expect(toPersianDigits(7)).toBe('۷');
    expect(toPersianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰');
    expect(toPersianDigits('3-7')).toBe('۳-۷');
  });

  test('should return formatted estimated delivery text in Persian', () => {
    const expectedText = `${toPersianDigits(SHIPPING_CONFIG.estimatedDelivery.minDays)} تا ${toPersianDigits(SHIPPING_CONFIG.estimatedDelivery.maxDays)} روز کاری`;
    expect(getFormattedEstimatedDelivery()).toBe(expectedText);
    expect(getFormattedEstimatedDelivery()).toBe('۳ تا ۷ روز کاری');
  });
});
