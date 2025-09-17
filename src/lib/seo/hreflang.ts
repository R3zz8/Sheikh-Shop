export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheikhshops.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export type Locale = 'en' | 'ar';

export function detectLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  return seg === 'ar' ? 'ar' : 'en';
}

// Build alternates.languages object for Next.js metadata based on a canonical pathname
// pathname should start with '/'
export function buildLanguageAlternates(pathname: string): Record<string, string> {
  const base = getBaseUrl();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  return {
    en: `${base}${cleanPath.replace(/^\/ar/, '') || '/'}`,
    ar: `${base}/ar${cleanPath.replace(/^\/en/, '')}`,
  };
}

// Return array of { hrefLang, href } pairs for manual link tags if needed
export function buildHrefLangLinks(pathname: string): Array<{ hrefLang: string; href: string }> {
  const langs = buildLanguageAlternates(pathname);
  return Object.entries(langs).map(([hrefLang, href]) => ({ hrefLang, href }));
}
