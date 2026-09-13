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

export interface BestSellerProductData {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  basePrice: number;
  oldPrice?: number | null;
  quantity?: number;
  inventoryStatus?: string;
  lowStockThreshold?: number | null;
  status: string;
  isBestSeller: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  images: Array<{
    id: string;
    image: string;
    secureUrl: string | null;
    isFeatured: boolean;
    isVisible: boolean;
    sortOrder: number;
    createdAt: string | null;
  }>;
}

export function serializeBestSellerProduct(product: any): BestSellerProductData | null {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    basePrice: toNumber(product.basePrice),
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    quantity: product.quantity ?? 0,
    inventoryStatus: product.inventoryStatus || 'AVAILABLE',
    lowStockThreshold: product.lowStockThreshold ?? 3,
    status: product.status,
    isBestSeller: !!product.isBestSeller,
    createdAt: toISOString(product.createdAt),
    updatedAt: toISOString(product.updatedAt),
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          id: img.id,
          image: img.image,
          secureUrl: img.secureUrl,
          isFeatured: !!img.isFeatured,
          isVisible: img.isVisible !== false,
          sortOrder: img.sortOrder ?? 0,
          createdAt: toISOString(img.createdAt),
        }))
      : [],
  };
}

/**
 * Server-side service function to retrieve BEST SELLER products from the database.
 * Strictly queries `isBestSeller: true` and `status: 'ACTIVE'`.
 * If fewer than `limit` products are found, it supplements with other active products to ensure a complete showcase.
 */
export const getBestSellers = cache(async (limit: number = 15): Promise<BestSellerProductData[]> => {
  const cacheKey = `best_sellers_limit_${limit}`;

  try {
    const cachedData = await cacheService.get<BestSellerProductData[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      return cachedData;
    }

    // 1. Fetch primary best seller products
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
        basePrice: true,
        quantity: true,
        inventoryStatus: true,
        lowStockThreshold: true,
        status: true,
        isBestSeller: true,
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
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // 2. Fallback if fewer than limit best sellers exist
    if (rawProducts.length < limit) {
      const existingIds = rawProducts.map((p) => p.id);
      const supplementaryProducts = await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          id: { notIn: existingIds },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          basePrice: true,
          quantity: true,
          inventoryStatus: true,
          lowStockThreshold: true,
          status: true,
          isBestSeller: true,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit - rawProducts.length,
      });

      rawProducts = [...rawProducts, ...supplementaryProducts];
    }

    const serializedProducts = rawProducts
      .map(serializeBestSellerProduct)
      .filter((p: BestSellerProductData | null): p is BestSellerProductData => p !== null);

    if (serializedProducts.length > 0) {
      await cacheService.set(cacheKey, serializedProducts, CACHE_TTL.PRODUCTS || 300);
    }

    return serializedProducts;
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
});
