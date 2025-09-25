export const locales = ['en', 'ar'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇦🇪',
};

export const currencyConfig: Record<Locale, { code: string; symbol: string; region: string }> = {
  en: { code: 'USD', symbol: '$', region: 'US' },
  ar: { code: 'AED', symbol: 'د.إ', region: 'AE' },
};

export const dateConfig: Record<Locale, Intl.Locale> = {
  en: new Intl.Locale('en-US'),
  ar: new Intl.Locale('ar-AE'),
};

export const rtlLocales: Locale[] = ['ar'];

export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

export function formatCurrency(amount: number, locale: Locale): string {
  const config = currencyConfig[locale];
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: config.code,
  }).format(amount);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatNumber(number: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(number);
}


