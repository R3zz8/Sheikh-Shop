
import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { redirect } from 'next/navigation';
import { generateProductSlug } from '@/lib/utils/slug';

export const getProducts = async () => {
  const result = await prisma.product.findMany({ include: { images: true } });
  return result;
};

export const getProductsAPI = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.category) searchParams.append('category', params.category);
  if (params?.search) searchParams.append('search', params.search);
  if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const result = await fetch(`/api/product?${searchParams.toString()}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  const response = await result.json();
  return response;
};

/**
 * Get product by ID (for backward compatibility)
 */
export const getProductById = async (id: string) => {
  try {
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      console.error('Invalid product ID:', id);
      return null;
    }

    const result = await prisma.product.findFirst({
      where: { id },
      include: { 
        images: true,
        baseUnit: true,
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
        units: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!result) {
      console.error('Product not found:', id);
      return null;
    }

    // Validate required fields
    if (!result.baseUnit) {
      console.error('Product missing baseUnit:', id);
      return null;
    }

    return serializeProduct(result);
  } catch (error) {
    console.error('Error fetching product by ID:', id, error);
    return null;
  }
};

/**
 * Get product by slug (SEO-friendly lookup)
 */
export const getProductBySlug = async (slug: string) => {
  try {
    // Validate slug format
    if (!slug || typeof slug !== 'string' || slug.length === 0) {
      console.error('Invalid product slug:', slug);
      return null;
    }

    const result = await prisma.product.findFirst({
      where: { 
        slug: slug,
      },
      include: { 
        images: true,
        baseUnit: true,
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
        units: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!result) {
      console.error('Product not found by slug:', slug);
      return null;
    }

    // Validate required fields
    if (!result.baseUnit) {
      console.error('Product missing baseUnit:', slug);
      return null;
    }

    return serializeProduct(result);
  } catch (error) {
    console.error('Error fetching product by slug:', slug, error);
    return null;
  }
};

/**
 * Get product by ID or slug (supports both for backward compatibility)
 */
export const getProductByIdOrSlug = async (identifier: string) => {
  try {
    if (!identifier || typeof identifier !== 'string' || identifier.length === 0) {
      console.error('Invalid product identifier:', identifier);
      return null;
    }

    // Try slug first (more common for SEO-friendly URLs)
    // If it looks like a UUID, try ID lookup
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUUID) {
      // Try ID lookup first for UUIDs
      const byId = await getProductById(identifier);
      if (byId) return byId;
    }
    
    // Try slug lookup (for both UUIDs and slugs)
    const bySlug = await getProductBySlug(identifier);
    if (bySlug) return bySlug;
    
    // Product not found by either ID or slug
    console.error('Product not found by ID or slug:', identifier);
    return null;
  } catch (error) {
    console.error('Error fetching product by ID or slug:', identifier, error);
    return null;
  }
};

export const upsertProduct = async (product: Product & { name?: string; slug?: string | null }) => {
  const { id } = product;
  
  // Prepare product data
  const productData: any = { ...product };
  
  // Auto-generate slug if not provided and name exists
  if (product.name && !product.slug) {
    // Get all existing slugs to ensure uniqueness
    const existingProducts = await prisma.product.findMany({
      select: { slug: true },
    });
    const existingSlugs = existingProducts
      .map(p => p.slug)
      .filter((slug): slug is string => slug !== null && slug !== undefined);
    
    productData.slug = generateProductSlug(
      product.name,
      existingSlugs,
      id || undefined
    );
  }
  
  let result;
  if (id) {
    result = await prisma.product.update({
      where: {
        id,
      },
      data: productData,
    });
  } else {
    result = await prisma.product.create({
      data: productData,
    });
  }

  return result;
};

export const deleteProduct = async (id: string) => {
  await prisma.product.delete({ where: { id } });
  redirect('/dashboard/products');
};

// Helper: convert Prisma Decimal/Date fields to JSON-serializable primitives
function serializeProduct(product: any) {
  if (!product) return product;
  return {
    ...product,
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
    basePrice: typeof product.basePrice === 'object' && product.basePrice !== null && 'toNumber' in product.basePrice
      ? (product.basePrice as any).toNumber()
      : product.basePrice,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          ...img,
          createdAt: img.createdAt ? img.createdAt.toISOString() : null,
        }))
      : [],
    baseUnit: product.baseUnit ? { ...product.baseUnit } : null,
    units: Array.isArray(product.units)
      ? product.units.map((u: any) => ({
          ...u,
          price: typeof u.price === 'object' && u.price !== null && 'toNumber' in u.price
            ? (u.price as any).toNumber()
            : Number(u.price),
          createdAt: u.createdAt ? u.createdAt.toISOString() : null,
          updatedAt: u.updatedAt ? u.updatedAt.toISOString() : null,
        }))
      : [],
    discounts: Array.isArray(product.discounts)
      ? product.discounts.map((d: any) => ({
          ...d,
          startDate: d.startDate ? d.startDate.toISOString() : null,
          endDate: d.endDate ? d.endDate.toISOString() : null,
          createdAt: d.createdAt ? d.createdAt.toISOString() : null,
          updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
        }))
      : [],
  };
}
