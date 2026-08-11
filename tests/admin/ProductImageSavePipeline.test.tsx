/**
 * @jest-environment node
 */

process.env.MOCK_DB = 'true';
(global as any).prisma = undefined;

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue({ value: 'mocked-jwt-token' }),
  })),
}));

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      id: 'mock-admin-id',
      role: 'SUPERADMIN',
    },
  }),
}));

// Mock cache
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

let upsertProduct: any;
let prisma: any;

describe('Product Image Save Pipeline Comprehensive Regression Tests (Phase 10)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.MOCK_DB = 'true';
    (global as any).prisma = undefined;

    const actionModule = await import('@/modules/products/actions');
    upsertProduct = actionModule.upsertProduct;

    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.prisma;
  });

  beforeEach(async () => {
    // Reset databases / collections before each test to a clean initial state
    await prisma.product.deleteMany({});
    await prisma.image.deleteMany({});
    jest.clearAllMocks();
  });

  // TEST 1: Delete two images → Save All → Reload → images remain deleted.
  test('TEST 1: Delete two images -> Save All -> Reload -> images remain deleted', async () => {
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

    // Final intended state from UI has only imgA
    const finalImagesFromUI = [imgA];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    // Verify after reload
    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(1);
    expect(fetched.images[0].id).toBe('img-A');
  });

  // TEST 2: Delete one image → Save All → Reload.
  test('TEST 2: Delete one image -> Save All -> Reload', async () => {
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

    // Intend to keep imgB
    const finalImagesFromUI = [imgB];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(1);
    expect(fetched.images[0].id).toBe('img-B');
  });

  // TEST 3: Delete image + modify description → Save All → both changes persist.
  test('TEST 3: Delete image + modify description -> Save All -> both changes persist', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-3',
        name: 'Product 3',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        description: 'Original description',
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });

    const finalImagesFromUI = [imgA];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');
    formData.append('description', 'Updated description');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.description).toBe('Updated description');
    expect(fetched.images).toHaveLength(1);
    expect(fetched.images[0].id).toBe('img-A');
  });

  // TEST 4: Delete image + change price → Save All → both persist.
  test('TEST 4: Delete image + change price -> Save All -> both persist', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-4',
        name: 'Product 4',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        basePrice: 1000,
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });

    const finalImagesFromUI = [imgA];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '5000');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.basePrice).toBe(5000);
    expect(fetched.images).toHaveLength(1);
    expect(fetched.images[0].id).toBe('img-A');
  });

  // TEST 5: Upload image + delete another image → Save All → exact final state persists.
  test('TEST 5: Upload image + delete another image -> Save All -> exact final state persists', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-5',
        name: 'Product 5',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });

    // Uploaded new image C
    const imgC = await prisma.image.create({ data: { id: 'img-C', secureUrl: '/C.png', productId: product.id, sortOrder: 2 } });

    // Intend to keep imgA and imgC (deleting imgB)
    const finalImagesFromUI = [imgA, imgC];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.images).toHaveLength(2);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-C']);
  });

  // TEST 6: Modify product without touching images → images must remain unchanged.
  test('TEST 6: Modify product without touching images -> images must remain unchanged', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-6',
        name: 'Product 6',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        description: 'No touch',
      }
    });

    const imgA = await prisma.image.create({ data: { id: 'img-A', secureUrl: '/A.png', productId: product.id, sortOrder: 0 } });
    const imgB = await prisma.image.create({ data: { id: 'img-B', secureUrl: '/B.png', productId: product.id, sortOrder: 1 } });

    const finalImagesFromUI = [imgA, imgB];

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');
    formData.append('description', 'Touched');
    formData.append('imagesJson', JSON.stringify(finalImagesFromUI));

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.description).toBe('Touched');
    expect(fetched.images).toHaveLength(2);
    expect(fetched.images.map((i: any) => i.id)).toEqual(['img-A', 'img-B']);
  });

  // TEST 7: Existing product with variants → save must preserve variants.
  test('TEST 7: Existing product with variants -> save must preserve variants', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-7',
        name: 'Product 7',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        units: [
          { id: 'variant-A', name: 'Var A', price: 1000, stock: 5 },
          { id: 'variant-B', name: 'Var B', price: 2000, stock: 2 }
        ]
      }
    });

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', 'Product 7 Updated');
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.name).toBe('Product 7 Updated');
    expect(fetched.units).toHaveLength(2);
  });

  // TEST 8: Existing product without variants → save must remain backward compatible.
  test('TEST 8: Existing product without variants -> save must remain backward compatible', async () => {
    const product = await prisma.product.create({
      data: {
        id: 'p-test-8',
        name: 'Product 8',
        category: 'OTHERS',
        baseUnitId: 'u3',
        quantity: 10,
        status: 'ACTIVE',
        units: []
      }
    });

    const formData = new FormData();
    formData.append('id', product.id);
    formData.append('name', 'Product 8 Updated');
    formData.append('category', product.category);
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', product.baseUnitId);
    formData.append('quantity', String(product.quantity));
    formData.append('price', '100000');

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: product.id } });
    expect(fetched.units).toHaveLength(0);
  });

  // TEST 9: Create new product → save successfully.
  test('TEST 9: Create new product -> save successfully', async () => {
    const formData = new FormData();
    formData.append('id', 'p-test-new');
    formData.append('name', 'New Test Product');
    formData.append('category', 'OTHERS');
    formData.append('categoryType', 'SheikhFood');
    formData.append('baseUnitId', 'u3');
    formData.append('quantity', '100');
    formData.append('price', '250000');

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeNull();

    const fetched = await prisma.product.findUnique({ where: { id: 'p-test-new' } });
    expect(fetched).toBeDefined();
    expect(fetched.name).toBe('New Test Product');
  });

  // TEST 10: Intentional server/database failure → UI must report failure and MUST NOT claim success.
  test('TEST 10: Intentional server/database failure -> UI must report failure and MUST NOT claim success', async () => {
    // Cause a validation or database error (e.g., negative basePrice in validation, or missing required fields)
    const formData = new FormData();
    formData.append('id', 'p-error-test');
    formData.append('name', ''); // invalid name to trigger validation error
    formData.append('category', 'OTHERS');
    formData.append('categoryType', 'SheikhFood');

    const result = await upsertProduct({ data: null, error: null }, formData);
    expect(result.error).toBeDefined();
    expect(result.error.name).toBeDefined();
  });
});
