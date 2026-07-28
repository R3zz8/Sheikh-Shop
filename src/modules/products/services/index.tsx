
import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { redirect } from 'next/navigation';
import { generateProductSlug } from '@/lib/utils/slug';
import {
  sanitizeProductName,
  sanitizeProductDescription,
  sanitizeSeoField,
  sanitizeExcerpt,
  sanitizeBrand,
  sanitizeSku,
  sanitizeWarranty,
  sanitizeOrigin,
  validateProductData,
} from '@/lib/seo/sanitize';

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

    // Try ID lookup as a final fallback (e.g. for mock non-UUID IDs like pd_speaker_1)
    const byIdFallback = await getProductById(identifier);
    if (byIdFallback) return byIdFallback;
    
    // Product not found by either ID or slug
    console.error('Product not found by ID or slug:', identifier);
    return null;
  } catch (error) {
    console.error('Error fetching product by ID or slug:', identifier, error);
    return null;
  }
};

export const upsertProduct = async (
  product: Product & { 
    name?: string; 
    slug?: string | null;
    description?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    h1Override?: string | null;
    excerpt?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    brand?: string | null;
    sku?: string | null;
    features?: string[];
    technicalSpecs?: any;
    tags?: string[];
    weight?: number | null;
    weightUnit?: string | null;
    dimensions?: any;
    materials?: string[];
    warranty?: string | null;
    origin?: string | null;
    color?: string | null;
    scent?: string | null;
    flavor?: string | null;
  }
) => {
  const { id } = product;
  
  // Validate and sanitize product data
  const validation = validateProductData({
    name: product.name,
    description: product.description,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    h1Override: product.h1Override,
    excerpt: product.excerpt,
    ogTitle: product.ogTitle,
    ogDescription: product.ogDescription,
    brand: product.brand,
    sku: product.sku,
    warranty: product.warranty,
    origin: product.origin,
  });
  
  if (!validation.isValid) {
    throw new Error(`Product data validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Prepare product data with sanitization
  const productData: any = { ...product };
  
  // Sanitize all text fields
  if (productData.name) {
    productData.name = sanitizeProductName(productData.name);
  }
  
  if (productData.description !== undefined) {
    productData.description = sanitizeProductDescription(productData.description);
  }
  
  if (productData.seoTitle !== undefined) {
    productData.seoTitle = sanitizeSeoField(productData.seoTitle, 60);
  }
  
  if (productData.seoDescription !== undefined) {
    productData.seoDescription = sanitizeSeoField(productData.seoDescription, 160);
  }
  
  if (productData.h1Override !== undefined) {
    productData.h1Override = sanitizeSeoField(productData.h1Override, 100);
  }
  
  if (productData.excerpt !== undefined) {
    productData.excerpt = sanitizeExcerpt(productData.excerpt);
  }
  
  if (productData.ogTitle !== undefined) {
    productData.ogTitle = sanitizeSeoField(productData.ogTitle, 60);
  }
  
  if (productData.ogDescription !== undefined) {
    productData.ogDescription = sanitizeSeoField(productData.ogDescription, 160);
  }
  
  // Sanitize new e-commerce fields
  if (productData.brand !== undefined) {
    productData.brand = sanitizeBrand(productData.brand);
  }
  if (productData.sku !== undefined) {
    productData.sku = sanitizeSku(productData.sku);
  }
  if (productData.warranty !== undefined) {
    productData.warranty = sanitizeWarranty(productData.warranty);
  }
  if (productData.origin !== undefined) {
    productData.origin = sanitizeOrigin(productData.origin);
  }
  
  // Auto-generate slug if not provided and name exists
  if (productData.name && !productData.slug) {
    // Get all existing slugs to ensure uniqueness
    const existingProducts = await prisma.product.findMany({
      select: { slug: true, id: true },
    });
    const existingSlugs = existingProducts
      .map((p: any) => p.slug)
      .filter((slug: any): slug is string => slug !== null && slug !== undefined);
    
    productData.slug = generateProductSlug(
      productData.name,
      existingSlugs,
      id || undefined
    );
    
    // Ensure slug uniqueness - check if generated slug already exists for another product
    const existingProductWithSlug = existingProducts.find(
      (p: any) => p.slug === productData.slug && p.id !== id
    );
    
    if (existingProductWithSlug) {
      // Generate a unique slug by appending a number
      let counter = 1;
      let uniqueSlug = `${productData.slug}-${counter}`;
      
      while (existingSlugs.includes(uniqueSlug)) {
        counter++;
        uniqueSlug = `${productData.slug}-${counter}`;
        
        if (counter > 1000) {
          // Fallback to timestamp if too many attempts
          uniqueSlug = `${productData.slug}-${Date.now()}`;
          break;
        }
      }
      
      productData.slug = uniqueSlug;
    }
  } else if (productData.slug) {
    // Validate slug uniqueness if provided
    const existingProductWithSlug = await prisma.product.findFirst({
      where: {
        slug: productData.slug,
        ...(id ? { id: { not: id } } : {}),
      },
    });
    
    if (existingProductWithSlug) {
      throw new Error(`Slug "${productData.slug}" already exists for another product`);
    }
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
