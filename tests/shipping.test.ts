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

import { resolveShipping, calculateCartShipping, getShippingCost, DEFAULT_SHIPPING_COST } from '@/lib/shipping';

describe('Per-Product Shipping Engine Resolver', () => {
  test('should resolve DEFAULT_SHIPPING_COST if product is null', () => {
    expect(resolveShipping(null)).toBe(DEFAULT_SHIPPING_COST);
  });

  test('should resolve custom shippingCost if specified', () => {
    const product = { shippingCost: 150000, allowFreeShipping: false };
    expect(resolveShipping(product)).toBe(150000);
  });

  test('should resolve 0 if allowFreeShipping is true', () => {
    const product = { shippingCost: 150000, allowFreeShipping: true };
    expect(resolveShipping(product)).toBe(0);
  });

  test('should resolve DEFAULT_SHIPPING_COST if shippingCost is null/undefined', () => {
    const product = { shippingCost: null, allowFreeShipping: false };
    expect(resolveShipping(product)).toBe(DEFAULT_SHIPPING_COST);
  });

  test('should calculate correct cumulative cart shipping total', () => {
    const cartItems = [
      { product: { shippingCost: 100000 }, quantity: 2 },
      { product: { allowFreeShipping: true }, quantity: 1 },
      { product: null, quantity: 1 }, // Fallback to 200,000
    ];
    // 100,000 * 2 + 0 * 1 + 200,000 * 1 = 400,000 Toman
    expect(calculateCartShipping(cartItems)).toBe(400000);
  });

  test('should integrate perProductShippingTotal options in getShippingCost', () => {
    const subtotal = 1000000;
    const options = { perProductShippingTotal: 300000 };
    expect(getShippingCost(subtotal, options)).toBe(300000);
  });
});
