import type { MetadataRoute } from 'next';

const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheikhshops.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/_next/',
          '/private/',
          '/temp/',
          '*.json$',
          '*.xml$',
          '/search?*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/private/',
        ],
      },
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
    host: getBaseUrl(),
  };
}
