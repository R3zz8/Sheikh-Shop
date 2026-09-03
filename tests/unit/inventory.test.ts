import { getEffectiveInventoryStatus, validateProductPurchasable } from '@/lib/inventory';
import { InventoryStatus } from '@prisma/client';

describe('Inventory Domain Logic Unit Tests', () => {
  test('AVAILABLE product with stock > 0 can be purchased', () => {
    const product = {
      id: 'prod-1',
      quantity: 10,
      inventoryStatus: InventoryStatus.AVAILABLE,
      lowStockThreshold: 3,
    };

    const status = getEffectiveInventoryStatus(product);
    expect(status).toBe(InventoryStatus.AVAILABLE);

    const validation = validateProductPurchasable(product, 2);
    expect(validation.purchasable).toBe(true);
    expect(validation.reason).toBeUndefined();
  });

  test('LOW_STOCK product with quantity <= threshold remains purchasable', () => {
    const product = {
      id: 'prod-2',
      quantity: 2,
      inventoryStatus: InventoryStatus.AVAILABLE,
      lowStockThreshold: 3,
    };

    const status = getEffectiveInventoryStatus(product);
    expect(status).toBe(InventoryStatus.LOW_STOCK);

    const validation = validateProductPurchasable(product, 1);
    expect(validation.purchasable).toBe(true);
    expect(validation.reason).toBeUndefined();
  });

  test('OUT_OF_STOCK product with stock = 0 cannot be purchased', () => {
    const product = {
      id: 'prod-3',
      quantity: 0,
      inventoryStatus: InventoryStatus.AVAILABLE,
      lowStockThreshold: 3,
    };

    const status = getEffectiveInventoryStatus(product);
    expect(status).toBe(InventoryStatus.OUT_OF_STOCK);

    const validation = validateProductPurchasable(product, 1);
    expect(validation.purchasable).toBe(false);
    expect(validation.reason).toBe('این محصول در حال حاضر ناموجود است.');
  });

  test('Insufficient quantity is rejected', () => {
    const product = {
      id: 'prod-4',
      quantity: 2,
      inventoryStatus: InventoryStatus.AVAILABLE,
      lowStockThreshold: 3,
    };

    const validation = validateProductPurchasable(product, 5);
    expect(validation.purchasable).toBe(false);
    expect(validation.reason).toBe('موجودی کافی نیست (تنها 2 عدد موجود است).');
  });

  test('DISCONTINUED product cannot be purchased even if stock > 0', () => {
    const product = {
      id: 'prod-5',
      quantity: 5,
      inventoryStatus: InventoryStatus.DISCONTINUED,
      lowStockThreshold: 3,
    };

    const status = getEffectiveInventoryStatus(product);
    expect(status).toBe(InventoryStatus.DISCONTINUED);

    const validation = validateProductPurchasable(product, 1);
    expect(validation.purchasable).toBe(false);
    expect(validation.reason).toBe('فروش این محصول توقف یافته است.');
  });
});
