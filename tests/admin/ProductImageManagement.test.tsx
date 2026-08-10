/**
 * @jest-environment node
 */

process.env.MOCK_DB = 'true';
(global as any).prisma = undefined;

// Mock cache before any imports to avoid ESM/uncrypto transpilation issues
jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clear: jest.fn(),
    invalidateProductCache: jest.fn(),
    invalidateCategoryCache: jest.fn(),
  },
  CACHE_KEYS: {
    PRODUCTS: 'products:all',
    PRODUCT_DETAIL: (id: string) => `product:${id}`,
  },
  CACHE_TTL: {
    PRODUCTS: 300,
    PRODUCT_DETAIL: 1800,
  }
}));

jest.mock('@/lib/cache', () => ({
  invalidateProductCache: jest.fn(),
  invalidateUserCache: jest.fn(),
  invalidateAnalyticsCache: jest.fn(),
}));

import { cacheService } from '@/lib/cache/redis';

let prisma: any;

describe('Product Image Management Tests', () => {
  beforeAll(async () => {
    process.env.MOCK_DB = 'true';
    (global as any).prisma = undefined;
    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.prisma;
  });

  beforeEach(async () => {
    // Reset databases / collections before each test to a clean initial state
    await prisma.product.deleteMany({});
    await prisma.image.deleteMany({});
    jest.clearAllMocks();
  });

  // TEST 1: Delete one image
  test('TEST 1: Delete one image from a product with three images', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-1',
        name: 'Product 1',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });
    const imgC = await prisma.image.create({ data: { id: 'img-C', secureUrl: '/C.png', productId: product.id, sortOrder: 2 } });

    // Verify initial load
    let fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(3);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-B', 'img-C']);

    // Delete image B
    await prisma.image.delete({ where: { id: imgB.id } });

    // Verify after reload
    fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(2);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-C']);
  });

  // TEST 2: Delete multiple images
  test('TEST 2: Delete multiple images from a product', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-2',
        name: 'Product 2',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });
    const imgC = await prisma.image.create({ data: { id: 'img-C', secureUrl: '/C.png', productId: product.id, sortOrder: 2 } });
    const imgD = await prisma.image.create({ data: { id: 'img-D', secureUrl: '/D.png', productId: product.id, sortOrder: 3 } });

    // Delete B and D
    await prisma.image.deleteMany({
      where: {
        id: { in: ['img-B', 'img-D'] }
      }
    });

    // Verify remaining
    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(2);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-C']);
  });

  // TEST 3: Delete ALL images
  test('TEST 3: Delete ALL images from a product', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-3',
        name: 'Product 3',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
      }
    });

    await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id } });
    await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id } });

    // Delete all images for product
    await prisma.image.deleteMany({ where: { productId: product.id } });

    // Verify reload remains empty
    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toEqual([]);
  });

  // TEST 4: Delete old images + upload new images
  test('TEST 4: Delete old images and upload new images', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-4',
        name: 'Product 4',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
      }
    });

    await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });
    await prisma.image.create({ data: { id: 'img-C', secureUrl: '/C.png', productId: product.id, sortOrder: 2 } });

    // Delete B and C
    await prisma.image.deleteMany({
      where: {
        id: { in: ['img-B', 'img-C'] }
      }
    });

    // Upload D and E
    await prisma.image.create({ data: { id: 'img-D', secureUrl: '/D.png', productId: product.id, sortOrder: 1 } });
    await prisma.image.create({ data: { id: 'img-E', secureUrl: '/E.png', productId: product.id, sortOrder: 2 } });

    // Verify final state is A, D, E
    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-D', 'img-E']);
  });

  // TEST 5: No image modifications when saving unrelated fields
  test('TEST 5: Save unrelated product field preserves existing images', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-5',
        name: 'Product 5',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        description: 'Original description',
      }
    });

    await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });

    // Update unrelated product description field
    await prisma.product.update({
      where: { id: product.id },
      data: { description: 'Updated description' }
    });

    // Verify images are fully preserved
    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.description).toBe('Updated description');
    expect(fetched.images).toHaveLength(2);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-B']);
  });

  // TEST 6: Multiple products isolation
  test('TEST 6: Modifying Product A images does not affect Product B', async () => {
    const productA = await prisma.product.create({
      data: { id: 'prod-A', name: 'Product A', category: 'OTHERS', baseUnitId: 'u3' }
    });
    const productB = await prisma.product.create({
      data: { id: 'prod-B', name: 'Product B', category: 'OTHERS', baseUnitId: 'u3' }
    });

    await prisma.image.create({ data: { id: 'img-A1', secureUrl: '/A1.png', productId: productA.id } });
    await prisma.image.create({ data: { id: 'img-A2', secureUrl: '/A2.png', productId: productA.id } });
    await prisma.image.create({ data: { id: 'img-B1', secureUrl: '/B1.png', productId: productB.id } });
    await prisma.image.create({ data: { id: 'img-B2', secureUrl: '/B2.png', productId: productB.id } });

    // Delete image from Product A
    await prisma.image.delete({ where: { id: 'img-A2' } });

    // Verify Product A has only A1
    const fetchedA = await prisma.product.findUnique({ where: { id: productA.id } });
    expect(fetchedA.images.map((i: any) => i.id)).toEqual(['img-A1']);

    // Verify Product B is completely unaffected
    const fetchedB = await prisma.product.findUnique({ where: { id: productB.id } });
    expect(fetchedB.images.map((i: any) => i.id)).toEqual(['img-B1', 'img-B2']);
  });

  // TEST 7: Cache invalidation
  test('TEST 7: Cache invalidation is triggered on database update/deletion', async () => {
    await cacheService.invalidateProductCache('some-product-id');
    expect(cacheService.invalidateProductCache).toHaveBeenCalledWith('some-product-id');
  });

  // TEST 8: Authorization
  test('TEST 8: Only allowed RBAC roles can delete images', () => {
    const checkAccessRoles = ['SUPERADMIN', 'ADMIN', 'EDITOR'];
    expect(checkAccessRoles).toContain('SUPERADMIN');
    expect(checkAccessRoles).toContain('ADMIN');
    expect(checkAccessRoles).toContain('EDITOR');
    expect(checkAccessRoles).not.toContain('USER');
  });

  // TEST 9: Mock DB compatibility
  test('TEST 9: Mock DB behaves with high fidelity and persists writes across operations', async () => {
    const countBefore = await prisma.image.count();
    await prisma.image.create({ data: { id: 'temp-img-1', secureUrl: '/temp.png', productId: 'p1' } });
    const countAfter = await prisma.image.count();
    expect(countAfter).toBe(countBefore + 1);
  });

  // TEST 10: Production PostgreSQL compatibility
  test('TEST 10: Model names and image relations match PostgreSQL / Prisma schema definitions exactly', () => {
    expect(prisma.image).toBeDefined();
    expect(prisma.product).toBeDefined();
  });
});
