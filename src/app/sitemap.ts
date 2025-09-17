import { getProducts } from '@/modules/products/services';
import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheikhshops.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

function withLocales(urlPath: string, lastModified: Date, priority: number, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']) {
  const base = getBaseUrl();
  const clean = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const en = `${base}${clean.replace(/^\/ar/, '') || '/'}`;
  const ar = `${base}/ar${clean.replace(/^\/en/, '')}`;
  
  return [
    { url: en, lastModified, changeFrequency, priority },
    { url: ar, lastModified, changeFrequency, priority },
  ] as MetadataRoute.Sitemap;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();
  
  try {
    // Static pages (home handled via root entries)
    const staticPages: MetadataRoute.Sitemap = [
      ...withLocales('/', now, 1.0, 'daily'),
      ...withLocales('/about', now, 0.8, 'monthly'),
      ...withLocales('/contact', now, 0.8, 'monthly'),
      ...withLocales('/privacy', now, 0.3, 'yearly'),
      ...withLocales('/terms', now, 0.3, 'yearly'),
      ...withLocales('/shipping', now, 0.6, 'monthly'),
      ...withLocales('/returns', now, 0.6, 'monthly'),
      ...withLocales('/article', now, 0.8, 'weekly'),
    ];

    // Category pages
    const categories = ['HONEY', 'SAFFRON', 'DATES', 'OTHERS'];
    const categoryPages = categories.flatMap(category =>
      withLocales(`/categories/${category.toLowerCase()}`, now, 0.9, 'weekly')
    );

    // Product pages
    const products = await getProducts();
    const productPages = products.flatMap((product) =>
      withLocales(`/products/${product.id}`, product.updatedAt, 0.7, 'weekly')
    );

    // Article pages
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    const articlePages = articles.flatMap((article) =>
      withLocales(`/article/${article.slug}`, article.updatedAt, 0.6, 'monthly')
    );

    return [
      ...staticPages,
      ...categoryPages,
      ...productPages,
      ...articlePages,
    ];
  } catch (error) {
    console.warn('Sitemap generation failed, returning basic sitemap:', error);
    return [
      { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/ar/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    ];
  }
}
