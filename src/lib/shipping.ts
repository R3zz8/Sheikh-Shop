/**
 * Centralized Shipping Cost System - Sheikh Shop
 *
 * This system serves as the single source of truth for all shipping-related calculations.
 * It is fully production-ready, scalable, and engineered to support future enterprise features.
 *
 * Future Requirements Built into the Architecture:
 * - Free Shipping (Threshold-based or Coupon-based)
 * - Multiple Shipping Methods (Standard, Express, Overnight, Pickup)
 * - Province-based Shipping (Dynamic costs based on destination)
 * - Product-specific Shipping (Flat-rates, weight-based, or bulk items)
 * - Discount Coupons (Free shipping coupons or flat reductions)
 * - Dynamic Shipping APIs (Direct carrier integrations)
 */

/**
 * Single source of truth for default shipping cost (in Persian Toman)
 */
export const DEFAULT_SHIPPING_COST = 200000;

/**
 * Centralized shipping configuration including estimated delivery times
 */
export const SHIPPING_CONFIG = {
  estimatedDelivery: {
    minDays: 3,
    maxDays: 7
  }
};

/**
 * Convert any number or string of English digits to Persian digits
 */
export function toPersianDigits(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)] || x);
}

/**
 * Returns the formatted estimated delivery text in Persian.
 * e.g., "۳ تا ۷ روز کاری"
 */
export function getFormattedEstimatedDelivery(): string {
  const { minDays, maxDays } = SHIPPING_CONFIG.estimatedDelivery;
  return `${toPersianDigits(minDays)} تا ${toPersianDigits(maxDays)} روز کاری`;
}

/**
 * Supported shipping methods for future expansion
 */
export type ShippingMethod = 'STANDARD' | 'EXPRESS' | 'PICKUP' | 'OVERNIGHT';

/**
 * Interface representing shipping calculation options for future extension
 */
export interface ShippingOptions {
  method?: ShippingMethod;
  province?: string;
  city?: string;
  couponCode?: string;
  weight?: number; // in kg
  itemsCount?: number;
  productIds?: string[];
  perProductShippingTotal?: number;
  items?: Array<{
    product: {
      shippingCost?: number | null;
      allowFreeShipping?: boolean | null;
    } | null;
    quantity: number;
  }>;
}

/**
 * Single source of truth shipping resolver for per-product shipping cost
 */
export function resolveShipping(product: {
  shippingCost?: number | null;
  allowFreeShipping?: boolean | null;
} | null): number {
  if (!product) {
    return DEFAULT_SHIPPING_COST;
  }
  if (product.allowFreeShipping) {
    return 0;
  }
  if (product.shippingCost !== undefined && product.shippingCost !== null) {
    return product.shippingCost;
  }
  return DEFAULT_SHIPPING_COST;
}

/**
 * Sums the shipping costs of all cart items using the per-product resolver
 */
export function calculateCartShipping(
  items: Array<{
    product: {
      shippingCost?: number | null;
      allowFreeShipping?: boolean | null;
    } | null;
    quantity: number;
  }>
): number {
  if (!items || items.length === 0) {
    return 0;
  }
  return items.reduce((acc, item) => {
    const cost = resolveShipping(item.product);
    return acc + (cost * item.quantity);
  }, 0);
}

/**
 * Dynamic configuration for shipping rates (for future expansion)
 */
export const SHIPPING_RATES: Record<ShippingMethod, number> = {
  STANDARD: DEFAULT_SHIPPING_COST,
  EXPRESS: 350000,   // Express shipping rate
  PICKUP: 0,         // Self-pickup is free
  OVERNIGHT: 500000  // Premium overnight delivery
};

/**
 * Free shipping subtotal threshold (for future expansion)
 * Currently set to null or disabled to keep the default cost active
 */
export const FREE_SHIPPING_THRESHOLD: number | null = null; // e.g. 1500000 for 1.5M Toman

/**
 * Retrieves shipping cost based on subtotal and dynamic options
 * @param subtotal - The order subtotal in Toman
 * @param options - Future scalability options (methods, location, weights, coupons)
 * @returns Final shipping cost in Toman
 */
export function getShippingCost(
  subtotal: number = 0,
  options?: ShippingOptions
): number {
  if (subtotal <= 0) {
    return 0;
  }

  // 0. Per-product shipping total priority if provided
  if (options?.perProductShippingTotal !== undefined) {
    return options.perProductShippingTotal;
  }

  if (options?.items && options.items.length > 0) {
    return calculateCartShipping(options.items);
  }

  // 1. Future Coupon Code Integration
  if (options?.couponCode === 'FREESHIP') {
    return 0;
  }

  // 2. Future Pickup Selection
  if (options?.method === 'PICKUP') {
    return 0;
  }

  // 3. Future Free Shipping Threshold Check
  if (FREE_SHIPPING_THRESHOLD !== null && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  const quantityMultiplier = typeof options?.itemsCount === 'number' && options.itemsCount > 0
    ? options.itemsCount
    : 1;

  // 4. Future Shipping Method Rate Matching
  if (options?.method && SHIPPING_RATES[options.method] !== undefined) {
    let cost = SHIPPING_RATES[options.method];

    // Future Province-based modifiers can be applied here
    if (options.province) {
      cost = applyProvinceModifiers(cost, options.province);
    }

    return cost * quantityMultiplier;
  }

  // 5. Default Fallback
  return DEFAULT_SHIPPING_COST * quantityMultiplier;
}

/**
 * Server-safe calculation of item subtotal
 * @param items - List of items with their price and quantity
 * @returns Total subtotal in Toman
 */
export function calculateSubtotal(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((acc, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
    return acc + (price * quantity);
  }, 0);
}

/**
 * Calculates total order amount (subtotal + shipping cost)
 * @param subtotal - Order subtotal in Toman
 * @param options - Optional parameters for dynamic shipping cost
 * @returns Grand total in Toman
 */
export function calculateOrderTotal(
  subtotal: number,
  options?: ShippingOptions
): number {
  if (subtotal <= 0) {
    return 0;
  }
  const shippingCost = getShippingCost(subtotal, options);
  return subtotal + shippingCost;
}

/**
 * Private helper to simulate dynamic province rate calculation (for future expansion)
 */
function applyProvinceModifiers(baseCost: number, province: string): number {
  const remoteProvinces = ['سیستان و بلوچستان', 'هرمزگان', 'بوشهر', 'خوزستان'];
  const localProvinces = ['تهران', 'البرز'];

  const normalizedProvince = province.trim();

  if (remoteProvinces.includes(normalizedProvince)) {
    return baseCost + 50000; // Extra charge for remote areas
  }

  if (localProvinces.includes(normalizedProvince)) {
    return baseCost - 30000; // Discounted rate for local delivery
  }

  return baseCost;
}
