import { prisma } from '@/lib/prisma';
import type { ProductCategoryType } from '@prisma/client';
import { cacheService } from '@/lib/cache/redis';

export async function getProductsByCategory(category: ProductCategoryType) {
  const cacheKey = `products:categoryType:${category}`;
  try {
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        categoryType: category,
      },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        basePrice: true,
        baseUnitId: true,
        quantity: true,
        status: true,
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        categoryType: true,
        slug: true,
        excerpt: true,
        brand: true,
        sku: true,
        features: true,
        tags: true,
        allowFreeShipping: true,
        shippingCost: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            publicId: true,
            width: true,
            height: true,
            format: true,
            bytes: true,
            productId: true,
            createdAt: true,
          },
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            multiplier: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        units: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            stock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            productId: true,
            discountType: true,
            value: true,
            startDate: true,
            endDate: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!products || !Array.isArray(products)) {
      console.error('Invalid data received from Prisma query');
      throw new Error('Invalid data format received');
    }

    await cacheService.set(cacheKey, products, 300); // Cache for 5 minutes
    return products;
  } catch (error) {
    console.error('Failed to fetch products by category:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to fetch products');
  }
}
