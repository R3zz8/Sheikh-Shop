import { prisma } from '@/lib/prisma';
import { cacheService } from '@/lib/cache/redis';

export interface PublicCategoryItem {
  name: string;
  image: string;
  slug: string;
  url: string;
}

const DEFAULT_CATEGORIES: PublicCategoryItem[] = [
  {
    name: 'شیخ نوا',
    image: '/sheikhgajet.webp',
    slug: 'tech-products',
    url: '/tech-products'
  },
  {
    name: 'لوازم دیجیتال شیخ',
    image: '/sheikhdigital.webp',
    slug: 'sheikh-digital',
    url: '/sheikh-digital'
  },
  {
    name: 'لوازم خانگی شیخ',
    image: '/sheikhhome.webp',
    slug: 'sheikh-home',
    url: '/sheikh-home'
  },
  {
    name: 'مواد غذایی شیخ',
    image: '/food.webp',
    slug: 'products',
    url: '/products'
  },
  {
    name: 'شیخ نیکوتین',
    image: '/nicotine.webp',
    slug: 'sheikh-nicotine',
    url: '/sheikh-nicotine'
  },
  {
    name: 'شیخ گرومینگ',
    image: '/grooming.webp',
    slug: 'sheikh-grooming',
    url: '/sheikh-grooming'
  }
];

export async function getActiveMainCategories(): Promise<PublicCategoryItem[]> {
  const cacheKey = 'public_active_main_categories';
  try {
    const cached = await cacheService.get<PublicCategoryItem[]>(cacheKey);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached;
    }

    const categoriesFromDb = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    });

    if (!categoriesFromDb || categoriesFromDb.length === 0) {
      return DEFAULT_CATEGORIES;
    }

    const mapped: PublicCategoryItem[] = categoriesFromDb.map((cat: any) => {
      // Map slug to canonical URLs if necessary
      let url = `/categories/${cat.slug}`;
      if (cat.slug === 'sheikh-home') url = '/sheikh-home';
      else if (cat.slug === 'sheikh-digital') url = '/sheikh-digital';
      else if (cat.slug === 'tech-products') url = '/tech-products';
      else if (cat.slug === 'products') url = '/products';
      else if (cat.slug === 'sheikh-nicotine') url = '/sheikh-nicotine';
      else if (cat.slug === 'sheikh-grooming') url = '/sheikh-grooming';

      // Fallback image mapping if image is null
      let img = cat.image;
      if (!img) {
        if (cat.slug === 'sheikh-home') img = '/sheikhhome.webp';
        else if (cat.slug === 'sheikh-digital') img = '/sheikhdigital.webp';
        else if (cat.slug === 'tech-products') img = '/sheikhgajet.webp';
        else if (cat.slug === 'sheikh-nicotine') img = '/nicotine.webp';
        else if (cat.slug === 'sheikh-grooming') img = '/grooming.webp';
        else img = '/food.webp';
      }

      return {
        name: cat.name,
        image: img,
        slug: cat.slug,
        url,
      };
    });

    await cacheService.set(cacheKey, mapped, 300); // 5 minutes TTL
    return mapped;
  } catch (err) {
    console.error('[getCategoriesService] Database/Cache error, returning defaults:', err);
    return DEFAULT_CATEGORIES;
  }
}
