import { getProducts } from '@/modules/products/services';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  if (products.length < 1) return [];
  const sitemapLink = products.map((item) => {
    return {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    };
  });

  return sitemapLink;
}
