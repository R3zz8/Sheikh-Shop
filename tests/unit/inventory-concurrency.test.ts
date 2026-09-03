import { atomicDecrementProductStock } from '@/lib/inventory';
import { prisma } from '@/utils/prisma';

describe('Inventory Concurrency Tests', () => {
  beforeEach(() => {
    process.env.MOCK_DB = 'true';
  });

  test('Concurrent purchase attempts with stock = 1 allows exactly 1 successful decrement', async () => {
    // Setup test product
    const productId = 'test-concurrent-prod-' + Date.now();
    const testProd = {
      id: productId,
      name: 'Concurrent Test Product',
      category: 'HONEY',
      categoryType: 'SheikhFood',
      description: 'Test',
      basePrice: 10000,
      quantity: 1,
      inventoryStatus: 'AVAILABLE',
      lowStockThreshold: 3,
      allowBackInStockNotification: true,
    };
    await prisma.product.create({ data: testProd as any });

    const results = await Promise.all([
      atomicDecrementProductStock(productId, 1),
      atomicDecrementProductStock(productId, 1),
    ]);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    const finalProduct = await prisma.product.findUnique({ where: { id: productId } });

    expect(successCount).toBe(1);
    expect(failCount).toBe(1);
    expect(finalProduct?.quantity).toBe(0);
  });
});
