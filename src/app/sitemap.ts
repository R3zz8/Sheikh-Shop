import { getProducts } from '@/modules/products/services';
import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';
import {
	buildLocalizedEntries,
	dedupeKeepNewest,
	enforceSitemapUrlLimit,
	getBaseUrl,
} from '@/lib/seo/sitemapUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getBaseUrl().replace(/\/$/, '');
	const now = new Date();

	try {
		const entries: MetadataRoute.Sitemap = [];

		// Static pages
		entries.push(...buildLocalizedEntries('/', now, 1.0, 'daily'));
		entries.push(...buildLocalizedEntries('/about-us', now, 0.8, 'monthly'));
		entries.push(...buildLocalizedEntries('/contact', now, 0.8, 'monthly'));
		entries.push(...buildLocalizedEntries('/privacy', now, 0.3, 'yearly'));
		entries.push(...buildLocalizedEntries('/terms', now, 0.3, 'yearly'));
		entries.push(...buildLocalizedEntries('/article', now, 0.8, 'weekly'));

		// Category pages
		const categories = ['HONEY', 'SAFFRON', 'DATES', 'OTHERS'];
		for (const category of categories) {
			entries.push(
				...buildLocalizedEntries(`/categories/${category.toLowerCase()}`, now, 0.9, 'weekly'),
			);
		}

		// Product pages
		const products = await getProducts();
		if (Array.isArray(products)) {
			for (const p of products) {
				if (!p?.id) continue;
				const updated = p.updatedAt ? new Date(p.updatedAt) : now;
				entries.push(...buildLocalizedEntries(`/products/${p.id}`, updated, 0.7, 'weekly'));
			}
		}

		// Article pages
		const articles = await prisma.article.findMany({
			where: { status: 'PUBLISHED' },
			select: { slug: true, updatedAt: true },
		});
		if (Array.isArray(articles)) {
			for (const a of articles) {
				if (!a?.slug) continue;
				const updated = a.updatedAt ? new Date(a.updatedAt) : now;
				entries.push(...buildLocalizedEntries(`/article/${a.slug}`, updated, 0.6, 'monthly'));
			}
		}

		// Dedupe and enforce limits
		const deduped = dedupeKeepNewest(entries);
		const limited = enforceSitemapUrlLimit(deduped);
		return limited;
	} catch (error) {
		console.warn('Sitemap generation failed, returning fallback sitemap:', error);
		return [
			{ url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
			{ url: `${baseUrl}/ar`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
		];
	}
}


