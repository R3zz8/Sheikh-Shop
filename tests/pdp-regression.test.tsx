import { getProductByIdOrSlug } from '@/modules/products/services';
import { resolveProductPrice } from '@/lib/product-pricing';
import { prisma } from '@/lib/prisma';

// Mock the prisma client for testing
jest.mock('@/lib/prisma', () => {
  const mockUnits = [
    { id: 'u1', name: 'Gram', symbol: 'g', multiplier: 0.001, sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u2', name: 'Kilogram', symbol: 'kg', multiplier: 1.0, sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 'u3', name: 'Piece', symbol: 'pcs', multiplier: 1.0, sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  const simpleProduct = {
    id: 'p_simple',
    name: 'Simple Honey',
    category: 'HONEY',
    categoryId: '2',
    description: 'Product with no variants.',
    basePrice: 100000,
    baseUnitId: 'u2',
    quantity: 50,
    status: 'ACTIVE',
    isNew: false,
    isBestSeller: false,
    isAmazing: false,
    categoryType: 'SheikhFood',
    baseUnit: mockUnits[1],
    images: [],
    discounts: [],
    units: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const multiAttributeProduct = {
    id: 'p_smartwatch',
    slug: 'royal-watch-v2',
    name: 'Royal Watch V2',
    category: 'OTHERS',
    categoryId: '4',
    description: 'Smartwatch with multiple combinations.',
    basePrice: 30000000,
    baseUnitId: 'u3',
    quantity: 20,
    status: 'ACTIVE',
    isNew: true,
    isBestSeller: true,
    isAmazing: false,
    categoryType: 'SheikhDigital',
    baseUnit: mockUnits[2],
    images: [],
    discounts: [],
    units: [
      {
        id: 'pud_black_64',
        productId: 'p_smartwatch',
        name: 'Black / 64GB',
        price: 30000000,
        oldPrice: 33000000,
        sku: 'SH-W-BLK-64',
        isActive: true,
        stock: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        values: [
          {
            productUnitId: 'pud_black_64',
            attributeValueId: 'val_black',
            attributeValue: { id: 'val_black', attributeId: 'attr_color', value: 'Black', hex: '#000000', attribute: { id: 'attr_color', name: 'Color', displayName: 'رنگ', type: 'COLOR' } }
          }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    prisma: {
      product: {
        findFirst: jest.fn().mockImplementation((args) => {
          const { where } = args;
          if (where.id === 'db_error' || where.slug === 'db_error') {
            throw new Error('Database connection failed');
          }
          if (where.id === 'p_simple') {
            return Promise.resolve(simpleProduct);
          }
          if (where.id === 'p_smartwatch' || where.slug === 'royal-watch-v2') {
            return Promise.resolve(multiAttributeProduct);
          }
          return Promise.resolve(null);
        }),
      },
    },
  };
});

describe('Product Detail Page PDP Regression Tests', () => {
  test('1. Valid product slug → resolves correctly', async () => {
    const product = await getProductByIdOrSlug('royal-watch-v2');
    expect(product).toBeDefined();
    expect(product?.name).toBe('Royal Watch V2');
  });

  test('2. Invalid slug → returns null (correctly mapped to 404 validation)', async () => {
    const product = await getProductByIdOrSlug('non-existent-product-slug');
    expect(product).toBeNull();
  });

  test('3. Database failure ≠ 404 (propagates exception so Next.js renders error boundary)', async () => {
    await expect(getProductByIdOrSlug('db_error')).rejects.toThrow('Database connection failed');
  });

  test('4. Product without variants → PDP can resolve price correctly', async () => {
    const product = await getProductByIdOrSlug('p_simple');
    expect(product).toBeDefined();
    if (product) {
      const pricing = resolveProductPrice(product as any, null);
      expect(pricing.price).toBe(100000);
      expect(pricing.hasDiscount).toBeFalsy();
    }
  });

  test('5. Product with variants → resolves correctly with all units', async () => {
    const product = await getProductByIdOrSlug('p_smartwatch');
    expect(product).toBeDefined();
    expect(product?.units).toBeDefined();
    expect(product?.units.length).toBe(1);
  });

  test('6. Variant pricing remains fully functional', async () => {
    const product = await getProductByIdOrSlug('p_smartwatch');
    expect(product).toBeDefined();
    if (product) {
      const selectedVariant = product.units[0];
      const pricing = resolveProductPrice(product as any, selectedVariant);
      expect(pricing.price).toBe(30000000);
      expect(pricing.oldPrice).toBe(33000000);
    }
  });
});
