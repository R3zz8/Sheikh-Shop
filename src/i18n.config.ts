// Internationalization configuration for Sheikh-Shop
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', locale: 'en_US' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', locale: 'ar_SA' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl', locale: 'fa_IR' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr', locale: 'tr_TR' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

export const defaultLanguage: SupportedLanguage = 'en';

// Language-specific routing configuration
export const languageConfig = {
  en: {
    path: '',
    locale: 'en_US',
    articlePath: '/article',
    categoryPath: '/categories',
    productPath: '/products',
  },
  ar: {
    path: '/ar',
    locale: 'ar_SA',
    articlePath: '/ar/maghalat',
    categoryPath: '/ar/asnaf',
    productPath: '/ar/muntajat',
  },
  fa: {
    path: '/fa',
    locale: 'fa_IR',
    articlePath: '/fa/maghalat',
    categoryPath: '/fa/gorohha',
    productPath: '/fa/mahsolat',
  },
  tr: {
    path: '/tr',
    locale: 'tr_TR',
    articlePath: '/tr/makaleler',
    categoryPath: '/tr/kategoriler',
    productPath: '/tr/urunler',
  },
} as const;

// SEO-friendly slug mappings for different languages
export const slugMappings = {
  // Article-related terms
  article: {
    en: 'article',
    ar: 'maghalat',
    fa: 'maghalat',
    tr: 'makaleler',
  },
  category: {
    en: 'category',
    ar: 'asnaf',
    fa: 'gorohha',
    tr: 'kategoriler',
  },
  product: {
    en: 'product',
    ar: 'muntajat',
    fa: 'mahsolat',
    tr: 'urunler',
  },
  // Common terms
  health: {
    en: 'health',
    ar: 'sihha',
    fa: 'salamat',
    tr: 'saglik',
  },
  nutrition: {
    en: 'nutrition',
    ar: 'taghdia',
    fa: 'taghziyeh',
    tr: 'beslenme',
  },
  honey: {
    en: 'honey',
    ar: 'asal',
    fa: 'asal',
    tr: 'bal',
  },
  saffron: {
    en: 'saffron',
    ar: 'zaafran',
    fa: 'zaferan',
    tr: 'safran',
  },
  dates: {
    en: 'dates',
    ar: 'tamr',
    fa: 'khorma',
    tr: 'hurma',
  },
} as const;

// Helper functions
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  const language = supportedLanguages.find(lang => lang.code === firstSegment);
  return language ? language.code : defaultLanguage;
}

export function getLocalizedPath(pathname: string, targetLanguage: SupportedLanguage): string {
  const currentLanguage = getLanguageFromPath(pathname);
  
  // Remove current language prefix if exists
  const pathWithoutLang = pathname.replace(`/${currentLanguage}`, '') || '/';
  
  // Add target language prefix if not default
  if (targetLanguage === defaultLanguage) {
    return pathWithoutLang;
  }
  
  return `/${targetLanguage}${pathWithoutLang}`;
}

export function generateLocalizedSlug(title: string, language: SupportedLanguage): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // For RTL languages, ensure proper handling
  if (['ar', 'fa'].includes(language)) {
    return baseSlug;
  }
  
  return baseSlug;
}

// Hreflang generation for SEO
export function generateHreflangPaths(pathname: string): Record<string, string> {
  const hreflang: Record<string, string> = {};
  
  supportedLanguages.forEach(({ code }) => {
    const localizedPath = getLocalizedPath(pathname, code);
    hreflang[code] = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sheikhshops.com'}${localizedPath}`;
  });
  
  return hreflang;
}

// Language detection from headers
export function detectLanguageFromHeaders(acceptLanguage?: string): SupportedLanguage {
  if (!acceptLanguage) return defaultLanguage;
  
  const languages = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0]?.trim().toLowerCase() || '');
  
  // Check for exact matches first
  for (const lang of languages) {
    if (supportedLanguages.some(supported => supported.code === lang)) {
      return lang as SupportedLanguage;
    }
  }
  
  // Check for partial matches (e.g., 'ar-SA' -> 'ar')
  for (const lang of languages) {
    const code = lang.split('-')[0];
    if (supportedLanguages.some(supported => supported.code === code)) {
      return code as SupportedLanguage;
    }
  }
  
  return defaultLanguage;
}


