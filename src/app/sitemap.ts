// app/sitemap.ts
import { getProducts } from '@/modules/products/services';
import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/sitemapUtils';

// نوع‌های دقیق
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

interface SitemapEntry {
  url: string;
  lastModified: Date | string;
  changeFrequency: ChangeFrequency;
  priority: number;
  alternates?: {
    languages: Record<string, string>;
  };
}

const LANGUAGES = ['en', 'ar'] as const;
const DEFAULT_LANG = 'en';

// تابع کمکی
function createHreflangEntries(
  path: string,
  lastmod: Date,
  priority: number,
  freq: ChangeFrequency
): SitemapEntry[] {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const entries: SitemapEntry[] = [];

  for (const lang of LANGUAGES) {
    const localizedPath = lang === DEFAULT_LANG ? path : `/${lang}${path}`;
    const url = `${baseUrl}${localizedPath}`;

    const alternates: Record<string, string> = {};
    for (const altLang of LANGUAGES) {
      const altPath = altLang === DEFAULT_LANG ? path : `/${altLang}${path}`;
      alternates[altLang] = `${baseUrl}${altPath}`;
    }
    alternates['x-default'] = `${baseUrl}${path}`;

    entries.push({
      url,
      lastModified: lastmod,
      changeFrequency: freq,
      priority,
      alternates: { languages: alternates },
    });
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: SitemapEntry[] = [];

  try {
    // === 1. Static Pages ===
    const staticPages: Array<{
      path: string;
      priority: number;
      freq: ChangeFrequency;
    }> = [
      { path: '/', priority: 1.0, freq: 'daily' },
      { path: '/products', priority: 0.9, freq: 'daily' },
      { path: '/about-us', priority: 0.8, freq: 'monthly' },
      { path: '/article', priority: 0.8, freq: 'weekly' },
      { path: '/faq', priority: 0.7, freq: 'monthly' },
      { path: '/affiliate', priority: 0.7, freq: 'monthly' },
      { path: '/contact', priority: 0.8, freq: 'monthly' },
      { path: '/privacy', priority: 0.3, freq: 'yearly' },
      { path: '/terms', priority: 0.3, freq: 'yearly' },
      { path: '/checkout', priority: 0.5, freq: 'weekly' },
      { path: '/register', priority: 0.4, freq: 'monthly' },
      { path: '/login', priority: 0.4, freq: 'monthly' },
    ];

    for (const { path, priority, freq } of staticPages) {
      entries.push(...createHreflangEntries(path, now, priority, freq));
    }

    // === 2. Categories (بدون status — فقط slug و updatedAt) ===
    try {
      const categories = await prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        take: 1000,
      });

      for (const cat of categories) {
        if (!cat.slug) continue;
        const lastmod = cat.updatedAt ? new Date(cat.updatedAt) : now;
        entries.push(...createHreflangEntries(`/categories/${cat.slug}`, lastmod, 0.9, 'weekly'));
      }
    } catch (error) {
      // Database may not be available during build - continue with static pages
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.warn('Failed to fetch categories for sitemap:', error);
      }
    }

    // === 3. Products ===
    try {
      const products = await getProducts();
      if (Array.isArray(products)) {
        for (const p of products) {
          if (!p?.id) continue;
          const lastmod = p.updatedAt ? new Date(p.updatedAt) : now;
          entries.push(...createHreflangEntries(`/products/${p.id}`, lastmod, 0.7, 'weekly'));
        }
      }
    } catch (error) {
      // Database may not be available during build - continue with static pages
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.warn('Failed to fetch products for sitemap:', error);
      }
    }

    // === 4. Articles ===
    try {
      const articles = await prisma.article.findMany({
        where: { status: 'PUBLISHED' }, // این احتمالاً درسته
        select: { slug: true, updatedAt: true },
        take: 5000,
      });

      for (const a of articles) {
        if (!a?.slug) continue;
        const lastmod = a.updatedAt ? new Date(a.updatedAt) : now;
        entries.push(...createHreflangEntries(`/article/${a.slug}`, lastmod, 0.6, 'monthly'));
      }
    } catch (error) {
      // Database may not be available during build - continue with static pages
      if (process.env.NEXT_PHASE !== 'phase-production-build') {
        console.warn('Failed to fetch articles for sitemap:', error);
      }
    }

    // === 5. Dedupe ===
    const seen = new Set<string>();
    const deduped: SitemapEntry[] = [];
    for (const entry of entries) {
      if (!seen.has(entry.url)) {
        seen.add(entry.url);
        deduped.push(entry);
      }
    }

    // === 6. Limit to 50k ===
    return deduped.slice(0, 50000);

  } catch (error) {
    // Fallback to static pages only if everything fails
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('Sitemap generation failed:', error);
    }
    return createHreflangEntries('/', now, 1.0, 'daily');
  }
}