import { getBestSellers, serializeProduct } from '@/lib/services/getBestSellers';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
  },
  CACHE_TTL: {
    PRODUCTS: 300,
  },
}));

describe('Best Sellers Service & Serialization', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('serializeProduct correctly formats dates and prices', () => {
    const rawProduct = {
      id: 'p-1',
      name: 'عسل طبیعی شیخ',
      basePrice: 500000,
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      updatedAt: new Date('2025-01-02T00:00:00.000Z'),
      images: [
        {
          id: 'img-1',
          image: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
          createdAt: new Date('2025-01-01T00:00:00.000Z'),
        },
      ],
    };

    const serialized = serializeProduct(rawProduct);
    expect(serialized).not.toBeNull();
    expect(serialized?.basePrice).toBe(500000);
    expect(serialized?.createdAt).toBe('2025-01-01T00:00:00.000Z');
    expect(serialized?.images[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
  });

  it('getBestSellers retrieves products with isBestSeller: true and status: ACTIVE', async () => {
    const mockProducts = [
      {
        id: 'p-1',
        name: 'محصول ۱',
        slug: 'p-1',
        category: 'HONEY',
        basePrice: 300000,
        status: 'ACTIVE',
        isBestSeller: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
      },
      {
        id: 'p-2',
        name: 'محصول ۲',
        slug: 'p-2',
        category: 'SAFFRON',
        basePrice: 400000,
        status: 'ACTIVE',
        isBestSeller: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
      },
      {
        id: 'p-3',
        name: 'محصول ۳',
        slug: 'p-3',
        category: 'DATES',
        basePrice: 200000,
        status: 'ACTIVE',
        isBestSeller: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
      },
      {
        id: 'p-4',
        name: 'محصول ۴',
        slug: 'p-4',
        category: 'OTHERS',
        basePrice: 600000,
        status: 'ACTIVE',
        isBestSeller: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
      },
    ];

    (prisma.product.findMany as jest.Mock).mockResolvedValueOnce(mockProducts);

    const result = await getBestSellers(10);
    expect(result).toHaveLength(4);
    expect(result[0].name).toBe('محصول ۱');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isBestSeller: true,
          status: 'ACTIVE',
        },
      })
    );
  });
});
