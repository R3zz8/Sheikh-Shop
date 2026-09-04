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

describe('Linear Quantity-Based Shipping Cost Calculations', () => {
  // TEST 1: Product A x 1 -> shipping = DEFAULT_SHIPPING_COST
  test('TEST 1: Product A x 1 should yield 1x base shipping', () => {
    const cartItems = [{ product: null, quantity: 1 }];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 1);
  });

  // TEST 2: Product A x 2 -> shipping = DEFAULT_SHIPPING_COST x 2
  test('TEST 2: Product A x 2 should yield 2x base shipping', () => {
    const cartItems = [{ product: null, quantity: 2 }];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 2);
  });

  // TEST 3: Product A x 3 -> shipping = DEFAULT_SHIPPING_COST x 3
  test('TEST 3: Product A x 3 should yield 3x base shipping', () => {
    const cartItems = [{ product: null, quantity: 3 }];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 3);
  });

  // TEST 4: Product A x 10 -> shipping = DEFAULT_SHIPPING_COST x 10
  test('TEST 4: Product A x 10 should yield 10x base shipping', () => {
    const cartItems = [{ product: null, quantity: 10 }];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 10);
  });

  // TEST 5: Product A x 2, Product B x 3 -> totalQuantity = 5, shipping = DEFAULT_SHIPPING_COST x 5
  test('TEST 5: Product A x 2 and Product B x 3 should yield 5x base shipping', () => {
    const cartItems = [
      { product: null, quantity: 2 },
      { product: null, quantity: 3 },
    ];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 5);
  });

  // TEST 6: Product A x 1, Product B x 1 -> totalQuantity = 2, shipping = DEFAULT_SHIPPING_COST x 2
  test('TEST 6: Product A x 1 and Product B x 1 should yield 2x base shipping', () => {
    const cartItems = [
      { product: null, quantity: 1 },
      { product: null, quantity: 1 },
    ];
    expect(calculateCartShipping(cartItems)).toBe(DEFAULT_SHIPPING_COST * 2);
  });

  // TEST 7: Empty cart -> 0 shipping
  test('TEST 7: Empty cart should yield 0 shipping', () => {
    expect(calculateCartShipping([])).toBe(0);
    expect(getShippingCost(0)).toBe(0);
  });

  // TEST 8: Existing discount / subtotal rules remain uncorrupted
  test('TEST 8: Shipping calculation should not corrupt subtotal calculations', () => {
    const subtotal = 500000;
    const cartItems = [{ product: null, quantity: 2 }];
    const shipping = calculateCartShipping(cartItems);
    expect(subtotal).toBe(500000);
    expect(shipping).toBe(DEFAULT_SHIPPING_COST * 2);
    expect(subtotal + shipping).toBe(500000 + DEFAULT_SHIPPING_COST * 2);
  });

  test('Custom product shipping cost scaling', () => {
    const cartItems = [{ product: { shippingCost: 150000 }, quantity: 2 }];
    expect(calculateCartShipping(cartItems)).toBe(300000);
  });

  test('Free shipping products scale to 0 regardless of quantity', () => {
    const cartItems = [{ product: { allowFreeShipping: true }, quantity: 10 }];
    expect(calculateCartShipping(cartItems)).toBe(0);
  });
});
