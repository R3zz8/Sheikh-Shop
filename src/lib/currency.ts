import { 
  type CurrencyCode, 
  type Locale, 
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
 * Format any numeric value directly as Persian Toman.
 * Treats the amount as native Toman value (no conversion rate multiplication).
 * @param amount - Amount in native Toman to format
 * @returns Beautiful Persian Toman formatted string (e.g., ۱٬۲۵۰٬۰۰۰ تومان)
 */
export function formatToToman(amount: number): string {
  const safeAmount = typeof amount === 'number' && !Number.isNaN(amount) ? amount : 0;

  // Treat amount as native Toman value directly
  const tomanValue = Math.round(safeAmount);

  // Format with thousands separator using English formatting first
  const formattedEnglish = new Intl.NumberFormat('en-US', {
    useGrouping: true,
  }).format(tomanValue);

  // Convert English digits and commas to Persian
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const formattedPersian = formattedEnglish
    .replace(/,/g, '٬') // Persian thousands separator
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)] || x);

  return `${formattedPersian} تومان`;
}

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
  return formatToToman(amount);
}

/**
 * Format price with currency symbol only
 */
export function formatPriceWithSymbol(amount: number, currency?: CurrencyCode): string {
  return formatToToman(amount);
}

/**
 * Lightweight helper to ensure EUR formatting in UI grids
 */
export function formatEUR(value: number): string {
  return formatToToman(value);
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

/**
 * Safely convert a Decimal-like object to a number.
 * Handles null, undefined, and various object structures.
 * @param value - The value to convert.
 * @returns The converted number, or 0 if conversion is not possible.
 */
export function toNumber(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  // Handle Prisma Decimal objects
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return value.toNumber();
  }
  // Handle string representations of numbers
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}
