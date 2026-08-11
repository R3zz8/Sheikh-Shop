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

describe('Product Upsert Action Tests Matrix', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.MOCK_DB = 'true';
    (global as any).prisma = undefined;

    const actionModule = await import('@/modules/products/actions');
    upsertProduct = actionModule.upsertProduct;

    const prismaModule = await import('@/lib/prisma');
    prisma = prismaModule.prisma;
  });

  test('Matrix 1: Save standard fields with ProductCategory ENUM (capitalized category from client)', async () => {
    const formData = new FormData();
    formData.append('id', 'p1');
    formData.append('name', 'Premium Iranian Honey - Updated');
    formData.append('category', 'HONEY'); // Capitalized as sent by client dropdown
    formData.append('categoryType', 'SheikhFood');
    formData.append('description', 'Updated description.');
    formData.append('price', '1250000');
    formData.append('baseUnitId', 'u2');
    formData.append('quantity', '75');
    formData.append('status', 'ACTIVE');

    const result = await upsertProduct({ data: null, error: null }, formData);
    console.log('Result for capitalized category:', result);
    expect(result.error).toBeNull();
  });

  test('Matrix 2: Save product with custom Persian/Farsi slug', async () => {
    const formData = new FormData();
    formData.append('id', 'p1');
    formData.append('name', 'عسل ممتاز کوهستان');
    formData.append('category', 'honey');
    formData.append('categoryType', 'SheikhFood');
    formData.append('slug', 'عسل-طبیعی-بکر'); // Persian slug
    formData.append('description', 'Updated description.');
    formData.append('price', '1250000');
    formData.append('baseUnitId', 'u2');
    formData.append('quantity', '75');
    formData.append('status', 'ACTIVE');

    const result = await upsertProduct({ data: null, error: null }, formData);
    console.log('Result for Persian slug:', result);
    expect(result.error).toBeNull();
  });

  test('Matrix 3: Save product with slug containing capital letters', async () => {
    const formData = new FormData();
    formData.append('id', 'p1');
    formData.append('name', 'Organic Saffron');
    formData.append('category', 'saffron');
    formData.append('categoryType', 'SheikhFood');
    formData.append('slug', 'Organic-Saffron-Premium'); // Capital letters slug
    formData.append('description', 'Updated description.');
    formData.append('price', '1250000');
    formData.append('baseUnitId', 'u2');
    formData.append('quantity', '75');
    formData.append('status', 'ACTIVE');

    const result = await upsertProduct({ data: null, error: null }, formData);
    console.log('Result for Capital Letters slug:', result);
    expect(result.error).toBeNull();
  });
});

export {};
