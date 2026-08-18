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

export interface ArchProductData {
  id: string;
  name: string;
  slug: string | null;
  category: string;
  basePrice: number;
  status: string;
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

export function serializeArchProduct(product: any): ArchProductData | null {
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    basePrice: toNumber(product.basePrice),
    status: product.status,
    createdAt: toISOString(product.createdAt),
    updatedAt: toISOString(product.updatedAt),
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          id: img.id,
          image: img.image,
          secureUrl: img.secureUrl,
          isFeatured: img.isFeatured,
          isVisible: img.isVisible,
          sortOrder: img.sortOrder,
          createdAt: toISOString(img.createdAt),
        }))
      : [],
  };
}

/**
 * Server-side service function to retrieve products for the Luxury Arch Carousel.
 * Queries active products (`status: 'ACTIVE'`).
 */
export const getArchProducts = cache(async (limit: number = 10): Promise<ArchProductData[]> => {
  const cacheKey = `arch_products_limit_${limit}`;

  try {
    // Check Redis / In-Memory cache first
    const cachedData = await cacheService.get<ArchProductData[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      return cachedData;
    }

    const rawProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        basePrice: true,
        status: true,
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const serializedProducts = rawProducts
      .map(serializeArchProduct)
      .filter((p: ArchProductData | null): p is ArchProductData => p !== null);

    if (serializedProducts.length > 0) {
      await cacheService.set(cacheKey, serializedProducts, CACHE_TTL.PRODUCTS || 300);
    }

    return serializedProducts;
  } catch (error) {
    console.error('Error fetching arch carousel products:', error);
    return [];
  }
});
