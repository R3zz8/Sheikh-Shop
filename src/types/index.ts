// Temporary types until Prisma client is generated with new schema
export * from './temp';

// Import types from temp to make them available
import type { Unit, Product } from './temp';

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

// Additional types for components
export interface CartWithProduct {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

export interface ArticleWithAuthor {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string | null;
  featured: boolean;
  allowComments: boolean;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string | undefined;
    email: string;
  };
}
