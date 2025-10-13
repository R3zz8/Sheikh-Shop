import type { Prisma } from '@prisma/client';

// Use Prisma-generated types
export type Product = Prisma.ProductGetPayload<{
  include: {
    images: true;
    baseUnit: true;
    discounts: true;
    units: true; // Include ProductUnits
  };
}>;

export type Unit = Prisma.UnitGetPayload<{}>;
export type ProductUnit = Prisma.ProductUnitGetPayload<{}> & {
  isFeatured?: boolean;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
};
export type Discount = Prisma.DiscountGetPayload<{}>;
export type Image = Prisma.ImageGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;
export type Session = Prisma.SessionGetPayload<{}>;
export type BlacklistedToken = Prisma.BlacklistedTokenGetPayload<{}>;

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
  id: number;
  userId: string;
  productId: string;
  quantity: number;
  unitId: string;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  unit: Unit;
}

// New types for ProductUnit integration
export interface CartItemUnit {
  unitId: string;
  quantity: number;
  subtotal: number;
}

export interface ProductUnitResponse {
  id: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface ProductWithUnits {
  id: string;
  name: string;
  basePrice: number;
  units: ProductUnitResponse[];
}

export interface ArticleWithAuthor {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string | null;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  category: string | null;
  tags: string[];
  publishedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  
  // Phase 2 Enhancements
  views: number;
  likes: number;
  shares: number;
  language: string;
  version: number;
  previousVersions: any;
  analytics: any;
  internalLinks: string[];
  externalLinks: string[];
  schemaMarkup: any;
  readTime: number | null;
  excerpt: string | null;
  author: {
    id: string;
    username: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
  };
  comments?: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      username: string | null;
      firstName: string | null;
      lastName: string | null;
    } | null;
  }[];
}

// Type for products with images
export type ProductsWithImages = Product;
