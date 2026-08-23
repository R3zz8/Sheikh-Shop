import { prisma } from '@/utils/prisma';
import { cache } from 'react';
import { cacheService, CACHE_TTL } from '@/lib/cache/redis';

export interface MarketingShowcaseSlideData {
  id: string;
  title: string;
  imageUrl: string;
  imagePublicId: string | null;
  productId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  product: {
    id: string;
    name: string;
    slug: string | null;
    status: string;
  };
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

export function serializeMarketingShowcaseSlide(slide: any): MarketingShowcaseSlideData | null {
  if (!slide || !slide.product) return null;

  return {
    id: slide.id,
    title: slide.title,
    imageUrl: slide.imageUrl,
    imagePublicId: slide.imagePublicId || null,
    productId: slide.productId,
    sortOrder: Number(slide.sortOrder || 0),
    isActive: Boolean(slide.isActive),
    createdAt: toISOString(slide.createdAt),
    updatedAt: toISOString(slide.updatedAt),
    product: {
      id: slide.product.id,
      name: slide.product.name,
      slug: slide.product.slug || null,
      status: slide.product.status,
    },
  };
}

/**
 * Server-side service function to retrieve active marketing showcase slides.
 * Returns only active slides (`isActive: true`), sorted by `sortOrder asc`.
 */
export const getMarketingShowcaseSlides = cache(async (): Promise<MarketingShowcaseSlideData[]> => {
  const cacheKey = 'marketing_showcase_slides_active';

  try {
    const cachedData = await cacheService.get<MarketingShowcaseSlideData[]>(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      return cachedData;
    }

    const rawSlides = await prisma.marketingShowcaseSlide.findMany({
      where: {
        isActive: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const serializedSlides = rawSlides
      .map(serializeMarketingShowcaseSlide)
      .filter((s: MarketingShowcaseSlideData | null): s is MarketingShowcaseSlideData => s !== null);

    if (serializedSlides.length > 0) {
      await cacheService.set(cacheKey, serializedSlides, CACHE_TTL.PRODUCTS || 300);
    }

    return serializedSlides;
  } catch (error) {
    console.error('Error fetching marketing showcase slides:', error);
    return [];
  }
});
