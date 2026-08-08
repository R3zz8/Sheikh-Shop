
import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { redirect } from 'next/navigation';
import { generateProductSlug } from '@/lib/utils/slug';
import { cache } from 'react';
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
  const result = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      basePrice: true,
      baseUnitId: true,
      quantity: true,
      status: true,
      isNew: true,
      isBestSeller: true,
      isAmazing: true,
      createdAt: true,
      updatedAt: true,
      categoryId: true,
      categoryType: true,
      slug: true,
      excerpt: true,
      brand: true,
      sku: true,
      tags: true,
      allowFreeShipping: true,
      shippingCost: true,
      images: {
        select: {
          id: true,
          image: true,
          secureUrl: true,
          publicId: true,
          sortOrder: true,
          isFeatured: true,
          isVisible: true,
          createdAt: true,
        }
      }
    }
  });
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
export const getProductById = cache(async (id: string) => {
  try {
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      console.error('Invalid product ID:', id);
      return null;
    }

    const result = await prisma.product.findFirst({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        basePrice: true,
        baseUnitId: true,
        quantity: true,
        status: true,
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        categoryType: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        ogImage: true,
        h1Override: true,
        excerpt: true,
        ogTitle: true,
        ogDescription: true,
        schemaMarkup: true,
        brand: true,
        sku: true,
        features: true,
        technicalSpecs: true,
        tags: true,
        weight: true,
        weightUnit: true,
        dimensions: true,
        materials: true,
        warranty: true,
        origin: true,
        color: true,
        scent: true,
        flavor: true,
        shippingCost: true,
        shippingMode: true,
        shippingDescription: true,
        allowFreeShipping: true,
        shippingPriority: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            publicId: true,
            width: true,
            height: true,
            format: true,
            bytes: true,
            productId: true,
            createdAt: true,
            sortOrder: true,
            isFeatured: true,
            isVisible: true,
          }
        },
        videos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            productId: true,
            sortOrder: true,
            isFeatured: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            multiplier: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            productId: true,
            discountType: true,
            value: true,
            startDate: true,
            endDate: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        units: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            oldPrice: true,
            sku: true,
            stock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            values: {
              select: {
                attributeValueId: true,
                attributeValue: {
                  select: {
                    id: true,
                    value: true,
                    unit: true,
                    hex: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        displayName: true,
                        type: true,
                      }
                    }
                  }
                }
              }
            }
          }
        },
        productAttributes: {
          select: {
            id: true,
            attribute: {
              select: {
                id: true,
                name: true,
                displayName: true,
                type: true,
                values: {
                  select: {
                    id: true,
                    value: true,
                    unit: true,
                    hex: true,
                  }
                }
              }
            }
          }
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
    throw error;
  }
});

/**
 * Get product by slug (SEO-friendly lookup)
 */
export const getProductBySlug = cache(async (slug: string) => {
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
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        basePrice: true,
        baseUnitId: true,
        quantity: true,
        status: true,
        isNew: true,
        isBestSeller: true,
        isAmazing: true,
        createdAt: true,
        updatedAt: true,
        categoryId: true,
        categoryType: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        metaKeywords: true,
        canonicalUrl: true,
        ogImage: true,
        h1Override: true,
        excerpt: true,
        ogTitle: true,
        ogDescription: true,
        schemaMarkup: true,
        brand: true,
        sku: true,
        features: true,
        technicalSpecs: true,
        tags: true,
        weight: true,
        weightUnit: true,
        dimensions: true,
        materials: true,
        warranty: true,
        origin: true,
        color: true,
        scent: true,
        flavor: true,
        shippingCost: true,
        shippingMode: true,
        shippingDescription: true,
        allowFreeShipping: true,
        shippingPriority: true,
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            publicId: true,
            width: true,
            height: true,
            format: true,
            bytes: true,
            productId: true,
            createdAt: true,
            sortOrder: true,
            isFeatured: true,
            isVisible: true,
          }
        },
        videos: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            productId: true,
            sortOrder: true,
            isFeatured: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        baseUnit: {
          select: {
            id: true,
            name: true,
            symbol: true,
            multiplier: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            productId: true,
            discountType: true,
            value: true,
            startDate: true,
            endDate: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        units: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            productId: true,
            name: true,
            price: true,
            oldPrice: true,
            sku: true,
            stock: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            values: {
              select: {
                attributeValueId: true,
                attributeValue: {
                  select: {
                    id: true,
                    value: true,
                    unit: true,
                    hex: true,
                    attribute: {
                      select: {
                        id: true,
                        name: true,
                        displayName: true,
                        type: true,
                      }
                    }
                  }
                }
              }
            }
          }
        },
        productAttributes: {
          select: {
            id: true,
            attribute: {
              select: {
                id: true,
                name: true,
                displayName: true,
                type: true,
                values: {
                  select: {
                    id: true,
                    value: true,
                    unit: true,
                    hex: true,
                  }
                }
              }
            }
          }
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
    throw error;
  }
});

/**
 * Get product by ID or slug (supports both for backward compatibility)
 */
export const getProductByIdOrSlug = cache(async (identifier: string) => {
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
    throw error;
  }
});

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

  const toNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'toNumber' in value) {
      return (value as any).toNumber();
    }
    return Number(value);
  };

  const toISOString = (value: any): string | null => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
    return String(value);
  };

  return {
    ...product,
    createdAt: toISOString(product.createdAt),
    updatedAt: toISOString(product.updatedAt),
    basePrice: toNumber(product.basePrice),
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          ...img,
          createdAt: toISOString(img.createdAt),
        }))
      : [],
    videos: Array.isArray(product.videos)
      ? product.videos.map((vid: any) => ({
          ...vid,
          createdAt: toISOString(vid.createdAt),
          updatedAt: toISOString(vid.updatedAt),
        }))
      : [],
    baseUnit: product.baseUnit ? { ...product.baseUnit } : null,
    units: Array.isArray(product.units)
      ? product.units.map((u: any) => ({
          ...u,
          price: toNumber(u.price),
          oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
          createdAt: toISOString(u.createdAt),
          updatedAt: toISOString(u.updatedAt),
          values: Array.isArray(u.values)
            ? u.values.map((v: any) => ({
                ...v,
                attributeValue: v.attributeValue ? {
                  ...v.attributeValue,
                  attribute: v.attributeValue.attribute ? { ...v.attributeValue.attribute } : null
                } : null
              }))
            : [],
        }))
      : [],
    productAttributes: Array.isArray(product.productAttributes)
      ? product.productAttributes.map((pa: any) => pa.attribute).filter(Boolean)
      : [],
    discounts: Array.isArray(product.discounts)
      ? product.discounts.map((d: any) => ({
          ...d,
          startDate: toISOString(d.startDate),
          endDate: toISOString(d.endDate),
          createdAt: toISOString(d.createdAt),
          updatedAt: toISOString(d.updatedAt),
        }))
      : [],
  };
}
