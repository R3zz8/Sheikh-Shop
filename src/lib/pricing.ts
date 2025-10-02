import type { Unit, Discount, ProductPricing, DiscountInfo, ProductUnit, ProductUnitResponse } from '@/types';

/**
 * Calculate the final price for a product based on unit and quantity
 */
export function calculateProductPrice(
  basePrice: number,
  selectedUnit: Unit,
  selectedQuantity: number = 1
): number {
  return basePrice * selectedUnit.multiplier * selectedQuantity;
}

/**
 * Get active discount information for a product
 */
export function getActiveDiscount(discounts: Discount[]): DiscountInfo | null {
  if (!discounts || discounts.length === 0) return null;

  const now = new Date();
  const activeDiscount = discounts.find(discount => 
    discount.isActive && 
    discount.startDate <= now && 
    discount.endDate >= now
  );

  if (!activeDiscount) return null;

  return {
    type: activeDiscount.discountType,
    value: activeDiscount.value,
    amount: 0, // Will be calculated based on price
    percentage: 0, // Will be calculated based on price
    endDate: activeDiscount.endDate,
    isActive: true,
  };
}

/**
 * Calculate discount amount and percentage
 */
export function calculateDiscount(
  originalPrice: number,
  discount: DiscountInfo
): { amount: number; percentage: number } {
  if (discount.type === 'PERCENTAGE') {
    const amount = (originalPrice * discount.value) / 100;
    return { amount, percentage: discount.value };
  } else {
    const percentage = (discount.value / originalPrice) * 100;
    return { amount: discount.value, percentage };
  }
}

/**
 * Calculate final pricing for a product with all factors
 */
export function calculateFinalPricing(
  basePrice: number,
  selectedUnit: Unit,
  selectedQuantity: number = 1,
  discounts: Discount[] = []
): ProductPricing {
  const originalPrice = calculateProductPrice(basePrice, selectedUnit, selectedQuantity);
  const activeDiscount = getActiveDiscount(discounts);
  
  if (!activeDiscount) {
    return {
      basePrice,
      selectedUnit,
      selectedQuantity,
      finalPrice: originalPrice,
      discountAmount: 0,
      discountPercentage: 0,
      originalPrice,
      hasDiscount: false,
    };
  }

  const { amount: discountAmount, percentage: discountPercentage } = calculateDiscount(originalPrice, activeDiscount);
  const finalPrice = originalPrice - discountAmount;

  return {
    basePrice,
    selectedUnit,
    selectedQuantity,
    finalPrice: Math.max(0, finalPrice), // Ensure price doesn't go negative
    discountAmount,
    discountPercentage,
    originalPrice,
    hasDiscount: true,
  };
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format unit display
 */
export function formatUnit(unit: Unit, quantity: number = 1): string {
  if (quantity === 1) {
    return unit.symbol;
  }
  return `${quantity}${unit.symbol}`;
}

/**
 * Get time remaining for discount
 */
export function getDiscountTimeRemaining(endDate: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

/**
 * Check if discount is expiring soon (within 24 hours)
 */
export function isDiscountExpiringSoon(endDate: Date): boolean {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  const hoursRemaining = diff / (1000 * 60 * 60);
  
  return hoursRemaining <= 24 && hoursRemaining > 0;
}

// New ProductUnit pricing functions

/**
 * Calculate price for a ProductUnit with quantity
 */
export function calculateProductUnitPrice(
  unitPrice: number,
  quantity: number = 1
): number {
  return unitPrice * quantity;
}

/**
 * Check if ProductUnit has sufficient stock
 */
export function hasSufficientStock(
  unitStock: number,
  requestedQuantity: number
): boolean {
  return unitStock >= requestedQuantity;
}

/**
 * Get the cheapest available ProductUnit
 */
export function getCheapestAvailableUnit(units: ProductUnit[]): ProductUnit | null {
  const activeUnits = units.filter(unit => unit.isActive && unit.stock > 0);
  
  if (activeUnits.length === 0) return null;
  
  return activeUnits.reduce((cheapest, current) => 
    current.price < cheapest.price ? current : cheapest
  );
}

/**
 * Get the most expensive available ProductUnit
 */
export function getMostExpensiveAvailableUnit(units: ProductUnit[]): ProductUnit | null {
  const activeUnits = units.filter(unit => unit.isActive && unit.stock > 0);
  
  if (activeUnits.length === 0) return null;
  
  return activeUnits.reduce((mostExpensive, current) => 
    current.price > mostExpensive.price ? current : mostExpensive
  );
}

/**
 * Calculate total cart value using ProductUnits
 */
export function calculateCartTotalWithUnits(cartItems: Array<{
  unitPrice: number;
  quantity: number;
}>): number {
  return cartItems.reduce((total, item) => 
    total + calculateProductUnitPrice(item.unitPrice, item.quantity), 0
  );
}

/**
 * Format ProductUnit for API response
 */
export function formatProductUnitResponse(unit: ProductUnit): ProductUnitResponse {
  return {
    id: unit.id,
    name: unit.name,
    price: Number(unit.price), // Convert Decimal to number
    stock: unit.stock,
    isActive: unit.isActive,
  };
}

/**
 * Get stock status for ProductUnit
 */
export function getProductUnitStockStatus(stock: number, threshold: number = 10): {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  message: string;
} {
  if (stock === 0) {
    return { status: 'out-of-stock', message: 'Out of Stock' };
  }
  
  if (stock <= threshold) {
    return { status: 'low-stock', message: 'Low Stock' };
  }
  
  return { status: 'in-stock', message: 'In Stock' };
}
