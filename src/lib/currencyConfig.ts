/**
 * Central currency configuration for Sheikh Shop
 * This file contains the main currency mapping and settings
 */

export type CurrencyCode = 'EUR' | 'USD' | 'AED';

export type Locale = 'en' | 'ar';

/**
 * Main currency configuration mapping
 * - default: Global fallback currency (EUR)
 * - en: Currency for English locale (USD)
 * - ar: Currency for Arabic locale (AED)
 */
export const CURRENCY_MAP = {
  default: 'EUR' as CurrencyCode,
  en: 'USD' as CurrencyCode,
  ar: 'AED' as CurrencyCode,
} as const;

/**
 * Currency display configuration
 */
export const CURRENCY_DISPLAY = {
  EUR: {
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    region: 'EU',
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    region: 'US',
  },
  AED: {
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    region: 'AE',
  },
} as const;

/**
 * Exchange rates (hardcoded for now, can be extended to use API)
 * All rates are relative to EUR (base currency)
 */
export const EXCHANGE_RATES = {
  EUR: 1.0, // Base currency
  USD: 1.08, // 1 EUR = 1.08 USD (approximate)
  AED: 3.97, // 1 EUR = 3.97 AED (approximate)
} as const;

/**
 * Get currency for a specific locale
 */
export function getCurrencyForLocale(locale: Locale): CurrencyCode {
  return CURRENCY_MAP[locale];
}

/**
 * Get the default currency (EUR)
 */
export function getDefaultCurrency(): CurrencyCode {
  return CURRENCY_MAP.default;
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(EXCHANGE_RATES) as CurrencyCode[];
}

/**
 * Check if a currency code is supported
 */
export function isSupportedCurrency(currency: string): currency is CurrencyCode {
  return currency in EXCHANGE_RATES;
}

/**
 * Get currency display information
 */
export function getCurrencyDisplay(currency: CurrencyCode) {
  return CURRENCY_DISPLAY[currency];
}

