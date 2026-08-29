import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';

export interface WebDesignShowcaseItem {
  id: string;
  title: string;
  description: string;
  services: string[];
  imageUrl: string | null;
  imagePublicId: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CACHE_KEY = 'web_design_showcase_active';
const CACHE_TTL_SECONDS = 300; // 5 minutes

export async function getWebDesignShowcase(): Promise<WebDesignShowcaseItem | null> {
  try {
    const cached = await cacheService.get<WebDesignShowcaseItem>(CACHE_KEY);
    if (cached) {
      return cached;
    }

    const item = await prisma.webDesignShowcase.findFirst({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!item) {
      return null;
    }

    const typedItem = item as WebDesignShowcaseItem;
    await cacheService.set(CACHE_KEY, typedItem, CACHE_TTL_SECONDS);
    return typedItem;
  } catch (error) {
    console.error('[GET_WEB_DESIGN_SHOWCASE_ERROR]', error);
    return null;
  }
}
