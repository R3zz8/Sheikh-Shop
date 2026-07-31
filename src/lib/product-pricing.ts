
import type { ProductsWithImages, ProductUnit } from '@/types';
import { toNumber } from './currency';

/**
 * @typedef {object} ResolvedPrice
 * @property {number} price - The final display price.
 * @property {number | null} oldPrice - The original price before discounts, if applicable.
 * @property {boolean} hasDiscount - True if a discount is applied.
 * @property {number} discountPercentage - The discount percentage.
 */
export interface ResolvedPrice {
  price: number;
  oldPrice: number | null;
  hasDiscount: boolean;
  discountPercentage: number;
}

/**
 * A centralized price resolver for products.
 *
 * This function provides a single source of truth for product pricing,
 * handling products with and without variations (ProductUnits).
 *
 * @param {ProductsWithImages} product - The product object.
 * @param {ProductUnit | null} [selectedUnit=null] - The selected product variation, if any.
 *
 * @returns {ResolvedPrice} An object containing the resolved price, old price, and discount info.
 *
 * @example
 * // For a product with variations
 * const priceInfo = resolveProductPrice(product, selectedVariation);
 *
 * // For a product without variations
 * const priceInfo = resolveProductPrice(product);
 */
export function resolveProductPrice(
  product: ProductsWithImages,
  selectedUnit: ProductUnit | null = null,
  quantity: number = 1
): ResolvedPrice {
  let basePrice: number;
  let baseOldPrice: number | null = null;

  const hasVariations = product.units && product.units.length > 0;

  if (selectedUnit) {
    // If a specific variation is selected, use its price.
    basePrice = toNumber(selectedUnit.price);
    baseOldPrice = selectedUnit.oldPrice ? toNumber(selectedUnit.oldPrice) : null;
  } else if (hasVariations) {
    // If there are variations but none is selected, find the lowest price among them.
    const lowestPriceUnit = product.units.reduce((lowest, unit) => {
      if (!lowest) return unit;
      return toNumber(unit.price) < toNumber(lowest.price) ? unit : lowest;
    });
    if (lowestPriceUnit) {
      basePrice = toNumber(lowestPriceUnit.price);
      baseOldPrice = lowestPriceUnit.oldPrice ? toNumber(lowestPriceUnit.oldPrice) : null;
    } else {
      // Fallback if all units are invalid for some reason
      basePrice = toNumber(product.basePrice);
      baseOldPrice = product.oldPrice ? toNumber(product.oldPrice) : null;
    }
  } else {
    // If there are no variations, use the product's base price.
    basePrice = toNumber(product.basePrice);
    baseOldPrice = product.oldPrice ? toNumber(product.oldPrice) : null;
  }

  // Ensure oldPrice is only considered if it's higher than the current price.
  const isValidOldPrice = baseOldPrice !== null && baseOldPrice > basePrice;
  const price = basePrice * quantity;
  const oldPrice = baseOldPrice !== null && baseOldPrice > basePrice ? baseOldPrice * quantity : null;
  const hasDiscount = isValidOldPrice;

  let discountPercentage = 0;
  if (hasDiscount && oldPrice) {
    discountPercentage = Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  return {
    price,
    oldPrice,
    hasDiscount,
    discountPercentage,
  };
}
