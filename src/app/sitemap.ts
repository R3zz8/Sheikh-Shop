import { getProducts } from '@/modules/products/services';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
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
  } catch (error) {
    // During build, if database is not available, return empty sitemap
    console.warn('Sitemap generation failed, returning empty sitemap:', error);
    return [];
  }
}
