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

export function serializeSpecialProduct(product: any) {
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
    units: Array.isArray(product.units)
      ? product.units.map((u: any) => ({
          ...u,
          price: toNumber(u.price),
          oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
          createdAt: toISOString(u.createdAt),
          updatedAt: toISOString(u.updatedAt),
        }))
      : [],
  };
}

/**
 * Server-side service function to retrieve SPECIAL / ویژه products from the database.
 * Strictly queries `isBestSeller: true` and `status: 'ACTIVE'`.
 */
export const getSpecialProducts = cache(async (limit: number = 10) => {
  const cacheKey = `special_products_data_limit_${limit}`;

  try {
    // Check Redis / In-Memory cache first if available
    const cachedData = await cacheService.get<any[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      return cachedData;
    }

    const rawProducts = await prisma.product.findMany({
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const serializedProducts = rawProducts.map(serializeSpecialProduct).filter(Boolean);

    // Cache the serialized results
    await cacheService.set(cacheKey, serializedProducts, CACHE_TTL.PRODUCTS || 300);

    return serializedProducts;
  } catch (error) {
    console.error('Error fetching special products:', error);
    return [];
  }
});
