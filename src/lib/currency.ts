export type CurrencyCode = 'USD' | 'AED' | 'SAR';

const FALLBACK: CurrencyCode = 'USD';

export function getDefaultCurrency(): CurrencyCode {
  const env = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || process.env.SHOP_DEFAULT_CURRENCY || '').toUpperCase();
  if (env === 'USD' || env === 'AED' || env === 'SAR') return env as CurrencyCode;
  if (process.env.NODE_ENV === 'production') return 'AED';
  return FALLBACK;
}

export function getCurrencyForLocale(locale: 'en' | 'ar'): CurrencyCode {
  const envEn = (process.env.NEXT_PUBLIC_CURRENCY_EN || '').toUpperCase();
  const envAr = (process.env.NEXT_PUBLIC_CURRENCY_AR || '').toUpperCase();

  if (locale === 'en') {
    if (envEn === 'USD' || envEn === 'AED' || envEn === 'SAR') return envEn as CurrencyCode;
    return 'USD';
  }
  if (envAr === 'AED' || envAr === 'SAR' || envAr === 'USD') return envAr as CurrencyCode;
  return 'AED';
}

export function formatPrice(amount: number, currency?: CurrencyCode) {
  const code = currency || getDefaultCurrency();
  const locale = code === 'AED' ? 'ar-AE' : code === 'SAR' ? 'ar-SA' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
