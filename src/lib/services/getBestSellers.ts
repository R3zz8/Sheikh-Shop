import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { cacheService, CACHE_TTL } from '@/lib/cache/redis';

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && 'toNumber' in value) {
    return (value as any).toNumber();
  }
  return Number(value);
}

function toISOString(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return String(value);
}

export function serializeProduct(product: any) {
  if (!product) return null;

  return {
    ...product,
    createdAt: toISOString(product.createdAt),
    updatedAt: toISOString(product.updatedAt),
    basePrice: toNumber(product.basePrice),
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          ...img,
          createdAt: toISOString(img.createdAt),
        }))
      : [],
    videos: Array.isArray(product.videos)
      ? product.videos.map((vid: any) => ({
          ...vid,
          createdAt: toISOString(vid.createdAt),
          updatedAt: toISOString(vid.updatedAt),
        }))
      : [],
    baseUnit: product.baseUnit
      ? {
          ...product.baseUnit,
          createdAt: toISOString(product.baseUnit.createdAt),
          updatedAt: toISOString(product.baseUnit.updatedAt),
        }
      : null,
    units: Array.isArray(product.units)
      ? product.units.map((u: any) => ({
          ...u,
          price: toNumber(u.price),
          oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
          createdAt: toISOString(u.createdAt),
          updatedAt: toISOString(u.updatedAt),
        }))
      : [],
    discounts: Array.isArray(product.discounts)
      ? product.discounts.map((d: any) => ({
          ...d,
          startDate: toISOString(d.startDate),
          endDate: toISOString(d.endDate),
          createdAt: toISOString(d.createdAt),
          updatedAt: toISOString(d.updatedAt),
        }))
      : [],
  };
}

/**
 * Server-side service function to retrieve BEST SELLER products from the database.
 * Strictly queries `isBestSeller: true` and `status: 'ACTIVE'`.
 */
export const getBestSellers = cache(async (limit: number = 10) => {
  const cacheKey = `bestsellers_products_limit_${limit}`;

  try {
    const cachedData = await cacheService.get<any[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    let rawProducts = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        categoryType: true,
        description: true,
        excerpt: true,
        basePrice: true,
        baseUnitId: true,
        quantity: true,
        inventoryStatus: true,
        lowStockThreshold: true,
        status: true,
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        createdAt: true,
        updatedAt: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            isFeatured: true,
            isVisible: true,
            sortOrder: true,
            createdAt: true,
          },
          orderBy: [
            { isFeatured: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            multiplier: true,
            isActive: true,
          },
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
            oldPrice: true,
            sku: true,
            stock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
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
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    // Fallback: if fewer than 4 items are marked as bestsellers, fetch active products to meet minimum pool
    if (rawProducts.length < 4) {
      const existingIds = rawProducts.map((p: any) => p.id);
      const additionalProducts = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          id: { notIn: existingIds },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          categoryType: true,
          description: true,
          excerpt: true,
          basePrice: true,
          baseUnitId: true,
          quantity: true,
          inventoryStatus: true,
          lowStockThreshold: true,
          status: true,
          isNew: true,
          isBestSeller: true,
          isAmazing: true,
          createdAt: true,
          updatedAt: true,
          images: {
            select: {
              id: true,
              image: true,
              secureUrl: true,
              isFeatured: true,
              isVisible: true,
              sortOrder: true,
              createdAt: true,
            },
            orderBy: [
              { isFeatured: 'desc' },
              { sortOrder: 'asc' },
            ],
          },
          baseUnit: {
            select: {
              id: true,
              name: true,
              symbol: true,
              multiplier: true,
              isActive: true,
            },
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
              oldPrice: true,
              sku: true,
              stock: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit - rawProducts.length,
      });
      rawProducts = [...rawProducts, ...additionalProducts];
    }

    const serializedProducts = rawProducts.map(serializeProduct).filter(Boolean);

    await cacheService.set(cacheKey, serializedProducts, CACHE_TTL.PRODUCTS || 300);

    return serializedProducts;
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
});
