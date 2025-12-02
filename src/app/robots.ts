import type { MetadataRoute } from 'next';
import { getBaseUrl, normalizePath } from '@/lib/seo/sitemapUtils';

const SENSITIVE_DIRECTORIES = [
  '/api',
  '/admin',
  '/dashboard',
  '/affiliate/dashboard',
  '/system',
  '/user',
  '/cart',
  '/checkout',
];

const SENSITIVE_SINGLE_PAGES = [
  '/system-login',
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/test-userbadge',
];

function buildDisallowList(): string[] {
  const directoryRules = SENSITIVE_DIRECTORIES.flatMap((dir) => {
    const clean = normalizePath(dir);
    return [`${clean}/`, `${clean}/*`];
  });

  const pageRules = SENSITIVE_SINGLE_PAGES.map((page) => normalizePath(page));

  return Array.from(new Set([...directoryRules, ...pageRules]));
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl().replace(/\/$/, '');
  const disallow = buildDisallowList();

  return {
    rules: [
      {
        userAgent: '*',
        disallow,
      },
      {
        userAgent: 'AdsBot-Google',
        disallow,
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl,
  };
}
