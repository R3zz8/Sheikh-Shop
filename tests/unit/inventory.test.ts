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

  test('OUT_OF_STOCK admin status override with stock > 0 cannot be purchased', () => {
    const product = {
      id: 'prod-6',
      quantity: 10,
      inventoryStatus: InventoryStatus.OUT_OF_STOCK,
      lowStockThreshold: 3,
    };

    const status = getEffectiveInventoryStatus(product);
    expect(status).toBe(InventoryStatus.OUT_OF_STOCK);

    const validation = validateProductPurchasable(product, 1);
    expect(validation.purchasable).toBe(false);
    expect(validation.reason).toBe('این محصول در حال حاضر ناموجود است.');
  });

  test('Status transition from OUT_OF_STOCK back to AVAILABLE restores purchase availability', () => {
    const product: {
      id: string;
      quantity: number;
      inventoryStatus: InventoryStatus;
      lowStockThreshold: number;
    } = {
      id: 'prod-7',
      quantity: 5,
      inventoryStatus: InventoryStatus.OUT_OF_STOCK,
      lowStockThreshold: 3,
    };

    expect(getEffectiveInventoryStatus(product)).toBe(InventoryStatus.OUT_OF_STOCK);
    expect(validateProductPurchasable(product, 1).purchasable).toBe(false);

    // Admin updates status back to AVAILABLE
    product.inventoryStatus = InventoryStatus.AVAILABLE;

    expect(getEffectiveInventoryStatus(product)).toBe(InventoryStatus.AVAILABLE);
    expect(validateProductPurchasable(product, 1).purchasable).toBe(true);
  });

  test('Multiple products maintain independent inventory states', () => {
    const productA = { id: 'a', quantity: 10, inventoryStatus: InventoryStatus.OUT_OF_STOCK };
    const productB = { id: 'b', quantity: 0, inventoryStatus: InventoryStatus.AVAILABLE };
    const productC = { id: 'c', quantity: 5, inventoryStatus: InventoryStatus.AVAILABLE };

    expect(getEffectiveInventoryStatus(productA)).toBe(InventoryStatus.OUT_OF_STOCK);
    expect(getEffectiveInventoryStatus(productB)).toBe(InventoryStatus.OUT_OF_STOCK);
    expect(getEffectiveInventoryStatus(productC)).toBe(InventoryStatus.AVAILABLE);

    expect(validateProductPurchasable(productA, 1).purchasable).toBe(false);
    expect(validateProductPurchasable(productB, 1).purchasable).toBe(false);
    expect(validateProductPurchasable(productC, 1).purchasable).toBe(true);
  });
});
