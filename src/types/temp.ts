// Temporary type definitions until Prisma client is generated
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  multiplier: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Discount {
  id: string;
  productId: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  baseUnitId: string;
  quantity: number;
  status: string;
  isNew: boolean;
  isBestSeller: boolean;
  createdAt: Date;
  updatedAt: Date;
  baseUnit: Unit;
  discounts: Discount[];
}

export interface Image {
  id: string;
  image: string;
  productId?: string;
  createdAt: Date;
}

export interface ProductsWithImages extends Product {
  images: Image[];
}

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
