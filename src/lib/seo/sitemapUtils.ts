import type { MetadataRoute } from 'next';

export type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

export function getBaseUrl(): string {
	if (process.env.NODE_ENV === 'production') {
		return 'https://sheikhshops.com';
	}
	return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export function normalizePath(path: string): string {
	const raw = (path || '').trim();
	const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
	// Collapse duplicate slashes
	let cleaned = withLeading.replace(/\/+/, '/');
	// Remove trailing slash except for root
	if (cleaned.length > 1 && cleaned.endsWith('/')) {
		cleaned = cleaned.slice(0, -1);
	}
	return cleaned;
}

export function buildAbsoluteUrl(baseUrl: string, path: string): string {
	const base = baseUrl.replace(/\/$/, '');
	const p = normalizePath(path);
	return `${base}${p}`;
}

export function isValidAbsoluteUrl(urlString: string, allowedHost: string): boolean {
	try {
		const parsed = new URL(urlString);
		if (!parsed.protocol.startsWith('http')) return false;
		// Only allow URLs from our own host
		return parsed.hostname === new URL(allowedHost).hostname;
	} catch {
		return false;
	}
}

export function buildLocalizedEntries(
	urlPath: string,
	lastModified: Date,
	priority: number,
	changeFrequency: ChangeFreq,
): MetadataRoute.Sitemap {
	const baseUrl = getBaseUrl();
	const base = baseUrl.replace(/\/$/, '');
	const clean = normalizePath(urlPath);

	// English URL (default, no locale prefix)
	const enPath = clean.replace(/^\/ar(\/|$)/, '/');
	const enUrl = `${base}${enPath}`;

	// Arabic URL (/ar prefix)
	const arPathCore = clean.replace(/^\/en(\/|$)/, '') || '/';
	const arPath = arPathCore === '/' ? '/ar' : `/ar${arPathCore}`;
	const arUrl = `${base}${arPath}`;

	const entries: MetadataRoute.Sitemap = [
		{ url: enUrl, lastModified, changeFrequency, priority },
		{ url: arUrl, lastModified, changeFrequency, priority },
	];

	// Filter invalid/duplicate
	const host = baseUrl;
	const seen = new Set<string>();
	return entries.filter((e) => {
		if (!e?.url) return false;
		if (!isValidAbsoluteUrl(e.url, host)) return false;
		if (seen.has(e.url)) return false;
		seen.add(e.url);
		return true;
	});
}

export function dedupeKeepNewest(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
	const map = new Map<string, MetadataRoute.Sitemap[number]>();
	for (const entry of entries) {
		if (!entry?.url) continue;
		const existing = map.get(entry.url);
		if (!existing) {
			map.set(entry.url, entry);
			continue;
		}
		if (entry.lastModified && existing.lastModified && entry.lastModified > existing.lastModified) {
			map.set(entry.url, entry);
		}
	}
	return Array.from(map.values());
}

export function enforceSitemapUrlLimit(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
	// Google limit is 50,000 URLs per file
	if (entries.length <= 50000) return entries;
	return entries.slice(0, 50000);
}


