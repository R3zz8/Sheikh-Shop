// Temporary types until Prisma client is generated with new schema
export * from './temp';

// Extended types for enhanced functionality
export interface ProductPricing {
  basePrice: number;
  selectedUnit: Unit;
  selectedQuantity: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  originalPrice: number;
  hasDiscount: boolean;
}

export interface DiscountInfo {
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  amount: number;
  percentage: number;
  endDate: Date;
  isActive: boolean;
}
