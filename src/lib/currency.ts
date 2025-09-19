import { 
  CurrencyCode, 
  Locale, 
  CURRENCY_MAP, 
  CURRENCY_DISPLAY, 
  EXCHANGE_RATES,
  getCurrencyForLocale as getConfigCurrencyForLocale,
  getDefaultCurrency as getConfigDefaultCurrency,
  isSupportedCurrency
} from './currencyConfig';

// Re-export types and config for backward compatibility
export type { CurrencyCode, Locale };

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  
  // Convert to EUR first (base currency)
  const amountInEUR = amount / EXCHANGE_RATES[from];
  // Convert from EUR to target currency
  return amountInEUR * EXCHANGE_RATES[to];
}

/**
 * Get the default currency (EUR)
 */
export function getDefaultCurrency(): CurrencyCode {
  return getConfigDefaultCurrency();
}

/**
 * Get currency for a specific locale
 */
export function getCurrencyForLocale(locale: Locale): CurrencyCode {
  return getConfigCurrencyForLocale(locale);
}

/**
 * Get user's preferred currency from cookies/localStorage
 * Falls back to locale-based currency, then EUR
 */
export function getUserPreferredCurrency(locale: Locale, cookieValue?: string): CurrencyCode {
  // 1. Check user's manual choice (cookie/localStorage)
  if (cookieValue && isSupportedCurrency(cookieValue)) {
    return cookieValue;
  }
  
  // 2. Use locale-based mapping
  const localeCurrency = getCurrencyForLocale(locale);
  
  // 3. Fallback to EUR (default)
  return localeCurrency || getDefaultCurrency();
}

/**
 * Format price with proper currency display
 */
export function formatPrice(amount: number, currency?: CurrencyCode): string {
  const code = currency || getDefaultCurrency();
  const display = CURRENCY_DISPLAY[code];
  
  try {
    return new Intl.NumberFormat(display.locale, { 
      style: 'currency', 
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${display.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format price with currency symbol only
 */
export function formatPriceWithSymbol(amount: number, currency?: CurrencyCode): string {
  const code = currency || getDefaultCurrency();
  const display = CURRENCY_DISPLAY[code];
  return `${display.symbol}${amount.toFixed(2)}`;
}

/**
 * Get multiple currency prices for a given EUR amount
 */
export function getMultiCurrencyPrices(eurAmount: number): Record<CurrencyCode, number> {
  return {
    EUR: eurAmount,
    USD: convertCurrency(eurAmount, 'EUR', 'USD'),
    AED: convertCurrency(eurAmount, 'EUR', 'AED'),
  };
}

/**
 * Parse currency from string (for cookie/localStorage values)
 */
export function parseCurrency(value: string | null | undefined): CurrencyCode | null {
  if (!value) return null;
  const upperValue = value.toUpperCase();
  return isSupportedCurrency(upperValue) ? upperValue : null;
}
