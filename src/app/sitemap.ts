import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import {
  buildAbsoluteUrl,
  dedupeKeepNewest,
  enforceSitemapUrlLimit,
  getBaseUrl,
  normalizePath,
} from '@/lib/seo/sitemapUtils';

export const revalidate = 3600; // 1 hour

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface StaticRouteConfig {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}

const STATIC_ROUTES: StaticRouteConfig[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about-us', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/article', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/categories', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/affiliate', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/leaderboard', priority: 0.5, changeFrequency: 'weekly' },
  { path: '/mobile-demo', priority: 0.4, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/products', priority: 0.9, changeFrequency: 'daily' },
  { path: '/products/catalog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/search', priority: 0.4, changeFrequency: 'weekly' },
  { path: '/success', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/tech-products', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/vr-store', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/payment/callback', priority: 0.4, changeFrequency: 'monthly' },
];

const LANGUAGE_ALIASES: Array<{ code: string; prefix: string }> = [
  { code: 'en', prefix: '' },
  { code: 'ar', prefix: '/ar' },
];

function buildAlternates(path: string, baseUrl: string) {
  const normalized = normalizePath(path);
  const base = baseUrl.replace(/\/$/, '');
  const defaultUrl = `${base}${normalized}`;

  const languages: Record<string, string> = {
    'x-default': defaultUrl,
  };

  for (const { code, prefix } of LANGUAGE_ALIASES) {
    const localizedPath = normalized === '/' ? prefix || '/' : `${prefix}${normalized}`;
    languages[code] = `${base}${localizedPath || '/'}`;
  }

  return { languages };
}

function createEntry(
  path: string,
  lastModified: Date,
  priority: number,
  changeFrequency: ChangeFrequency,
  baseUrl: string
): MetadataRoute.Sitemap[number] {
  return {
    url: buildAbsoluteUrl(baseUrl, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: buildAlternates(path, baseUrl),
  };
}

async function getCategoryEntries(baseUrl: string, fallbackDate: Date): Promise<MetadataRoute.Sitemap> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 2000,
  });

  return categories
    .filter((category) => category.slug)
    .map((category) =>
      createEntry(
        `/categories/${category.slug!.toLowerCase()}`,
        category.updatedAt ?? fallbackDate,
        0.8,
        'weekly',
        baseUrl
      )
    );
}

async function getProductEntries(baseUrl: string, fallbackDate: Date): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  return products
    .filter((product) => product.slug || product.id)
    .map((product) =>
      createEntry(
        `/products/${product.slug ?? product.id}`,
        product.updatedAt ?? fallbackDate,
        0.7,
        'weekly',
        baseUrl
      )
    );
}

async function getArticleEntries(baseUrl: string, fallbackDate: Date): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });

  return articles
    .filter((article) => article.slug)
    .map((article) =>
      createEntry(`/article/${article.slug}`, article.updatedAt ?? fallbackDate, 0.6, 'monthly', baseUrl)
    );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = getBaseUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) =>
    createEntry(route.path, now, route.priority, route.changeFrequency, baseUrl)
  );

  const [categoriesResult, productsResult, articlesResult] = await Promise.allSettled([
    getCategoryEntries(baseUrl, now),
    getProductEntries(baseUrl, now),
    getArticleEntries(baseUrl, now),
  ]);

  const dynamicEntries: MetadataRoute.Sitemap = [];

  if (categoriesResult.status === 'fulfilled') {
    dynamicEntries.push(...categoriesResult.value);
  } else if (process.env.NEXT_PHASE !== 'phase-production-build') {
    console.warn('Sitemap: category query failed', categoriesResult.reason);
  }

  if (productsResult.status === 'fulfilled') {
    dynamicEntries.push(...productsResult.value);
  } else if (process.env.NEXT_PHASE !== 'phase-production-build') {
    console.warn('Sitemap: product query failed', productsResult.reason);
  }

  if (articlesResult.status === 'fulfilled') {
    dynamicEntries.push(...articlesResult.value);
  } else if (process.env.NEXT_PHASE !== 'phase-production-build') {
    console.warn('Sitemap: article query failed', articlesResult.reason);
  }

  const ordered = [...staticEntries, ...dynamicEntries].sort((a, b) => a.url.localeCompare(b.url));
  const deduped = dedupeKeepNewest(ordered);

  return enforceSitemapUrlLimit(deduped);
}