export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheikhshops.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export type Locale = 'en' | 'ar' | 'fa';

export function detectLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (seg === 'ar') return 'ar';
  if (seg === 'fa') return 'fa';
  return 'en';
}

// Build alternates.languages object for Next.js metadata based on a canonical pathname
// pathname should start with '/'
// Supports fa (Persian), en (English), and ar (Arabic)
export function buildLanguageAlternates(pathname: string): Record<string, string> {
  const base = getBaseUrl();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Remove any existing language prefix to get the base path
  const basePath = cleanPath.replace(/^\/(en|ar|fa)/, '') || '/';

  return {
    'fa': `${base}${basePath === '/' ? '/' : basePath}`,
    'en': `${base}${basePath === '/' ? '/en' : `/en${basePath}`}`,
    'ar': `${base}${basePath === '/' ? '/ar' : `/ar${basePath}`}`,
    'x-default': `${base}${basePath}`,
  };
}

// Return array of { hrefLang, href } pairs for manual link tags if needed
export function buildHrefLangLinks(pathname: string): Array<{ hrefLang: string; href: string }> {
  const langs = buildLanguageAlternates(pathname);
  return Object.entries(langs).map(([hrefLang, href]) => ({ hrefLang, href }));
}
