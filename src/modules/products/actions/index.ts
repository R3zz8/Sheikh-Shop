'use server';

import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { ProductCategory, ProductStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { checkAccess } from '@/lib/checkAccess';
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
  getOrGenerateExcerpt,
} from '@/lib/seo/sanitize';
import { generateProductSlug } from '@/lib/utils/slug';

// Enhanced validation schema with status and SEO fields
const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  basePrice: z.number()
    .min(0.01, 'Price must be at least $0.01')
    .max(999999999999.99, 'Price must be less than 1,000,000,000,000 Toman'),
  baseUnitId: z.string()
    .min(1, 'Base unit is required'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity must be less than 1,000,000'),
  category: z.enum(Object.values(ProductCategory) as [string, ...string[]]),
  status: z.enum(Object.values(ProductStatus) as [string, ...string[]]).optional(),
  categoryType: z.enum(['SheikhFood', 'SheikhTech', 'SheikhDigital']).optional(),
  // SEO fields
  slug: z.string()
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .nullable(),
  seoTitle: z.string()
    .max(60, 'SEO title must be less than 60 characters')
    .optional()
    .nullable(),
  seoDescription: z.string()
    .max(160, 'SEO description must be less than 160 characters')
    .optional()
    .nullable(),
  h1Override: z.string()
    .max(100, 'H1 override must be less than 100 characters')
    .optional()
    .nullable(),
  excerpt: z.string()
    .optional()
    .nullable(),
  ogTitle: z.string()
    .max(60, 'OG title must be less than 60 characters')
    .optional()
    .nullable(),
  ogDescription: z.string()
    .max(160, 'OG description must be less than 160 characters')
    .optional()
    .nullable(),
  ogImage: z.string()
    .max(500, 'OG image URL must be less than 500 characters')
    .url('OG image must be a valid URL')
    .optional()
    .nullable(),
  canonicalUrl: z.string()
    .max(500, 'Canonical URL must be less than 500 characters')
    .url('Canonical URL must be a valid URL')
    .optional()
    .nullable(),
  metaKeywords: z.array(z.string()).optional().default([]),
  schemaMarkup: z.any().optional().nullable(),
  // New e-commerce fields
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  technicalSpecs: z.any().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  weight: z.number().positive().optional().nullable(),
  weightUnit: z.string().max(10).optional().nullable(),
  dimensions: z.any().optional().nullable(),
  materials: z.array(z.string()).optional().default([]),
  warranty: z.string().max(200).optional().nullable(),
  origin: z.string().max(100).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  scent: z.string().max(50).optional().nullable(),
  flavor: z.string().max(50).optional().nullable(),
  shippingCost: z.number()
    .nonnegative('هزینه ارسال باید یک عدد مثبت یا صفر باشد')
    .optional()
    .nullable(),
  shippingMode: z.string().optional().nullable(),
  shippingDescription: z.string().optional().nullable(),
  allowFreeShipping: z.boolean().optional().default(false),
  shippingPriority: z.string().optional().nullable(),
});

// Bulk operations schema
const bulkOperationSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product must be selected'),
  action: z.enum(['delete', 'activate', 'deactivate', 'draft']),
});

// Security: Verify user has admin privileges using unified RBAC
async function verifyAdminAccess() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access-token')?.value || null;
  const sessionToken = cookieStore.get('session-token')?.value || null;
  const token = accessToken || sessionToken;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  // Verify JWT and extract role/id
  try {
    const JWT_SECRET = process.env.JWT_SECRET || '';
    if (!JWT_SECRET) throw new Error('Missing JWT secret');
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ['HS256'],
        issuer: 'sheikh-shop',
        audience: 'sheikh-shop-users',
      },
    );

    const userRole = String(payload.role || '').toUpperCase();
    const allowed = ['SUPERADMIN', 'ADMIN', 'EDITOR'];
    if (!allowed.includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    return { userId: String(payload.id || ''), userRole };
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

// Audit logging function
async function logAuditEvent(userId: string, action: string, details: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: details,
      },
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
}

export const upsertProduct = async (
  prevData: { data: Product | null; error: Record<string, string> | null },
  formData: FormData,
) => {
  try {
    // Security: Verify admin access
    const { userId, userRole } = await verifyAdminAccess();

    const id = formData.get('id') as string | null;

    // Extract Shipping settings
    const shippingCostStr = formData.get('shippingCost') as string | null;
    const shippingMode = formData.get('shippingMode') as string | null;
    const shippingDescription = formData.get('shippingDescription') as string | null;
    const allowFreeShipping = formData.get('allowFreeShipping') === 'true' || formData.get('allowFreeShipping') === 'on';
    const shippingPriority = formData.get('shippingPriority') as string | null;

    const shippingCost = shippingCostStr ? parseFloat(shippingCostStr) : null;

    // RBAC Permissions Enforcement for Shipping Settings
    if (userRole !== 'SUPERADMIN') {
      if (id) {
        // Fetch existing product from DB
        const existing = await prisma.product.findUnique({
          where: { id },
          select: {
            shippingCost: true,
            shippingMode: true,
            shippingDescription: true,
            allowFreeShipping: true,
            shippingPriority: true,
          }
        });
        if (existing) {
          const hasShippingChanges =
            shippingCost !== existing.shippingCost ||
            shippingMode !== existing.shippingMode ||
            shippingDescription !== existing.shippingDescription ||
            allowFreeShipping !== (existing.allowFreeShipping ?? false) ||
            shippingPriority !== existing.shippingPriority;

          if (hasShippingChanges) {
            return {
              data: prevData.data,
              error: { general: 'تنها مدیر ارشد (Super Admin) مجاز به تغییر تنظیمات ارسال است.' }
            };
          }
        }
      } else {
        const hasCustomShipping =
          shippingCost !== null ||
          shippingMode !== null ||
          shippingDescription !== null ||
          allowFreeShipping !== false ||
          shippingPriority !== null;

        if (hasCustomShipping) {
          return {
            data: prevData.data,
            error: { general: 'تنها مدیر ارشد (Super Admin) مجاز به تنظیم هزینه ارسال برای محصول جدید است.' }
          };
        }
      }
    }

    // Get baseUnitId from form or use default (kg unit)
    let baseUnitId = formData.get('baseUnitId') as string;
    if (!baseUnitId) {
      // Get the default kg unit
      const defaultUnit = await prisma.unit.findFirst({
        where: { symbol: 'kg' },
        select: { id: true }
      });
      if (!defaultUnit) {
        return {
          data: prevData.data,
          error: { general: 'Default unit not found. Please contact administrator.' }
        };
      }
      baseUnitId = defaultUnit.id;
    }

    const rawData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string, // This will be the slug
      description: formData.get('description') as string || '',
      basePrice: parseFloat(formData.get('price') as string),
      baseUnitId,
      quantity: parseInt(formData.get('quantity') as string),
      status: (formData.get('status') as string) || 'ACTIVE',
      categoryType: formData.get('categoryType') as 'SheikhFood' | 'SheikhTech' | 'SheikhDigital',
      // SEO fields
      slug: formData.get('slug') as string || null,
      seoTitle: formData.get('seoTitle') as string || null,
      seoDescription: formData.get('seoDescription') as string || null,
      h1Override: formData.get('h1Override') as string || null,
      excerpt: formData.get('excerpt') as string || null,
      ogTitle: formData.get('ogTitle') as string || null,
      ogDescription: formData.get('ogDescription') as string || null,
      ogImage: formData.get('ogImage') as string || null,
      canonicalUrl: formData.get('canonicalUrl') as string || null,
      metaKeywords: formData.get('metaKeywords') 
        ? (formData.get('metaKeywords') as string).split(',').map(k => k.trim()).filter(Boolean)
        : [],
      schemaMarkup: formData.get('schemaMarkup') 
        ? JSON.parse(formData.get('schemaMarkup') as string)
        : null,
      // New e-commerce fields
      brand: formData.get('brand') as string || null,
      sku: formData.get('sku') as string || null,
      features: (() => {
        const featuresStr = formData.get('features') as string;
        if (!featuresStr) return [];
        try {
          return JSON.parse(featuresStr);
        } catch {
          return [];
        }
      })(),
      technicalSpecs: (() => {
        const specsStr = formData.get('technicalSpecs') as string;
        if (!specsStr) return null;
        try {
          return JSON.parse(specsStr);
        } catch {
          return null;
        }
      })(),
      tags: (() => {
        const tagsStr = formData.get('tags') as string;
        if (!tagsStr) return [];
        try {
          return JSON.parse(tagsStr);
        } catch {
          return [];
        }
      })(),
      weight: (() => {
        const weightStr = formData.get('weight') as string;
        if (!weightStr) return null;
        const parsed = parseFloat(weightStr);
        return isNaN(parsed) ? null : parsed;
      })(),
      weightUnit: formData.get('weightUnit') as string || null,
      dimensions: (() => {
        const dimsStr = formData.get('dimensions') as string;
        if (!dimsStr) return null;
        try {
          return JSON.parse(dimsStr);
        } catch {
          return null;
        }
      })(),
      materials: (() => {
        const materialsStr = formData.get('materials') as string;
        if (!materialsStr) return [];
        try {
          return JSON.parse(materialsStr);
        } catch {
          return [];
        }
      })(),
      warranty: formData.get('warranty') as string || null,
      origin: formData.get('origin') as string || null,
      color: formData.get('color') as string || null,
      scent: formData.get('scent') as string || null,
      flavor: formData.get('flavor') as string || null,
      shippingCost,
      shippingMode,
      shippingDescription,
      allowFreeShipping,
      shippingPriority,
    };

    // Find category by slug and get both enum and ID
    let categoryEnum: ProductCategory = ProductCategory.OTHERS;
    let categoryId: string | null = null;

    if (rawData.category) {
      const category = await prisma.category.findUnique({
        where: { 
          slug: rawData.category,
          isActive: true 
        }
      });

      if (category) {
        categoryId = category.id;
        // Map category slug to enum
        const slugToEnumMap: Record<string, ProductCategory> = {
          'dates': ProductCategory.DATES,
          'honey': ProductCategory.HONEY,
          'saffron': ProductCategory.SAFFRON,
          'other': ProductCategory.OTHERS,
        };
        categoryEnum = slugToEnumMap[rawData.category] || ProductCategory.OTHERS;
      }
    }

    const processedData = {
      ...rawData,
      category: categoryEnum,
      categoryId,
    };

    // Enhanced validation
    const validationResult = productSchema.safeParse(processedData);
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        const path = err.path[0];
        if (typeof path === 'string') {
          errors[path] = err.message;
        }
      });
      return { data: prevData.data, error: errors };
    }

    const validatedData = validationResult.data;

    // Sanitize and process SEO fields
    const sanitizedData: any = {
      ...validatedData,
    };

    // Sanitize all text fields
    if (sanitizedData.name) {
      sanitizedData.name = sanitizeProductName(sanitizedData.name);
    }
    if (sanitizedData.description !== undefined) {
      sanitizedData.description = sanitizeProductDescription(sanitizedData.description);
    }
    if (sanitizedData.seoTitle !== undefined) {
      sanitizedData.seoTitle = sanitizeSeoField(sanitizedData.seoTitle, 60);
    }
    if (sanitizedData.seoDescription !== undefined) {
      sanitizedData.seoDescription = sanitizeSeoField(sanitizedData.seoDescription, 160);
    }
    if (sanitizedData.h1Override !== undefined) {
      sanitizedData.h1Override = sanitizeSeoField(sanitizedData.h1Override, 100);
    }
    if (sanitizedData.excerpt !== undefined) {
      sanitizedData.excerpt = sanitizeExcerpt(sanitizedData.excerpt);
    }
    if (sanitizedData.ogTitle !== undefined) {
      sanitizedData.ogTitle = sanitizeSeoField(sanitizedData.ogTitle, 60);
    }
    if (sanitizedData.ogDescription !== undefined) {
      sanitizedData.ogDescription = sanitizeSeoField(sanitizedData.ogDescription, 160);
    }

    // Auto-generate slug if not provided
    if (sanitizedData.name && !sanitizedData.slug) {
      const existingProducts = await prisma.product.findMany({
        select: { slug: true, id: true },
      });
      const existingSlugs = existingProducts
        .map((p: any) => p.slug)
        .filter((slug: any): slug is string => slug !== null && slug !== undefined);
      
      sanitizedData.slug = generateProductSlug(
        sanitizedData.name,
        existingSlugs,
        id || undefined
      );
    }

    // Sanitize new e-commerce fields
    if (sanitizedData.brand !== undefined) {
      sanitizedData.brand = sanitizeBrand(sanitizedData.brand);
    }
    if (sanitizedData.sku !== undefined) {
      sanitizedData.sku = sanitizeSku(sanitizedData.sku);
    }
    if (sanitizedData.warranty !== undefined) {
      sanitizedData.warranty = sanitizeWarranty(sanitizedData.warranty);
    }
    if (sanitizedData.origin !== undefined) {
      sanitizedData.origin = sanitizeOrigin(sanitizedData.origin);
    }
    
    // Auto-generate excerpt if not provided
    if (!sanitizedData.excerpt && sanitizedData.description) {
      sanitizedData.excerpt = getOrGenerateExcerpt(sanitizedData.description, null);
    }

    // Validate product data for HTML
    const htmlValidation = validateProductData({
      name: sanitizedData.name,
      description: sanitizedData.description,
      seoTitle: sanitizedData.seoTitle,
      seoDescription: sanitizedData.seoDescription,
      h1Override: sanitizedData.h1Override,
      excerpt: sanitizedData.excerpt,
      ogTitle: sanitizedData.ogTitle,
      ogDescription: sanitizedData.ogDescription,
      brand: sanitizedData.brand,
      sku: sanitizedData.sku,
      warranty: sanitizedData.warranty,
      origin: sanitizedData.origin,
    });

    if (!htmlValidation.isValid) {
      return {
        data: prevData.data,
        error: { general: `Validation failed: ${htmlValidation.errors.join(', ')}` }
      };
    }

    // Additional business logic validation
    if (id) {
      // Update existing product
      const existingProduct = await prisma.product.findUnique({
        where: { id },
        select: { id: true, name: true }
      });

      if (!existingProduct) {
        return {
          data: prevData.data,
          error: { general: 'Product not found' }
        };
      }

      const result = await prisma.product.update({
        where: { id },
        data: sanitizedData as any,
      });

      // Audit logging
      await logAuditEvent(userId, 'PRODUCT_UPDATED', {
        productId: id,
        productName: result.name,
        changes: sanitizedData,
      });

      revalidatePath('/dashboard/products');
      return { error: null, data: result };
    } else {
      // Create new product
      const result = await prisma.product.create({
        data: sanitizedData as any,
      });

      // Audit logging
      await logAuditEvent(userId, 'PRODUCT_CREATED', {
        productId: result.id,
        productName: result.name,
        data: sanitizedData,
      });

      revalidatePath('/dashboard/products');
      return { error: null, data: result };
    }

  } catch (error) {
    console.error('Product upsert error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication') || error.message.includes('permissions')) {
        return {
          data: prevData.data,
          error: { general: 'Access denied. Please log in with admin privileges.' }
        };
      }
    }

    return {
      data: prevData.data,
      error: { general: 'Failed to save product. Please try again.' }
    };
  }
};

// Enhanced delete product with security
export const deleteProduct = async (productId: string) => {
  try {
    // Security: Verify admin access
    const { userId } = await verifyAdminAccess();

    // Validate product ID
    if (!productId || typeof productId !== 'string') {
      throw new Error('Invalid product ID');
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true }
    });

    if (!existingProduct) {
      throw new Error('Product not found');
    }

    // Delete associated images from filesystem (only for local images)
    for (const image of existingProduct.images) {
      if (image.image && !image.image.startsWith('http')) {
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const imagePath = path.join(process.cwd(), 'public', image.image);
          await fs.unlink(imagePath);
        } catch (fileError) {
          // Continue even if file doesn't exist
          console.warn('Could not delete image file:', image.image);
        }
      }
    }

    // Delete product (cascades to images)
    await prisma.product.delete({
      where: { id: productId }
    });

    // Audit logging
    await logAuditEvent(userId, 'PRODUCT_DELETED', {
      productId,
      productName: existingProduct.name,
    });

    revalidatePath('/dashboard/products');
    return { success: true };

  } catch (error) {
    console.error('Product deletion error:', error);
    throw error;
  }
};

// Bulk operations
export const bulkProductOperation = async (formData: FormData) => {
  try {
    // Security: Verify admin access
    const { userId } = await verifyAdminAccess();

    const rawData = {
      productIds: JSON.parse(formData.get('productIds') as string),
      action: formData.get('action') as string,
    };

    // Validate bulk operation
    const validationResult = bulkOperationSchema.safeParse(rawData);
    if (!validationResult.success) {
      return { error: 'Invalid bulk operation data' };
    }

    const { productIds, action } = validationResult.data;

    // Verify all products exist
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, status: true }
    });

    if (products.length !== productIds.length) {
      return { error: 'Some products not found' };
    }

    let result;
    let auditAction = '';

    switch (action) {
      case 'delete':
        // Delete products and their images
        for (const product of products) {
          const images = await prisma.image.findMany({
            where: { productId: product.id }
          });

          // Delete image files (only for local images)
          for (const image of images) {
            if (image.image && !image.image.startsWith('http')) {
              try {
                const fs = await import('fs/promises');
                const path = await import('path');
                const imagePath = path.join(process.cwd(), 'public', image.image);
                await fs.unlink(imagePath);
              } catch (fileError) {
                console.warn('Could not delete image file:', image.image);
              }
            }
          }
        }

        result = await prisma.product.deleteMany({
          where: { id: { in: productIds } }
        });
        auditAction = 'BULK_PRODUCT_DELETED';
        break;

      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'ACTIVE' }
        });
        auditAction = 'BULK_PRODUCT_ACTIVATED';
        break;

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'INACTIVE' }
        });
        auditAction = 'BULK_PRODUCT_DEACTIVATED';
        break;

      case 'draft':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'DRAFT' }
        });
        auditAction = 'BULK_PRODUCT_DRAFTED';
        break;

      default:
        return { error: 'Invalid action' };
    }

    // Audit logging
    await logAuditEvent(userId, auditAction, {
      productIds,
      action,
      affectedCount: result.count,
    });

    revalidatePath('/dashboard/products');
    return { success: true, affectedCount: result.count };

  } catch (error) {
    console.error('Bulk operation error:', error);
    return { error: 'Bulk operation failed' };
  }
};

// Export products to CSV
export const exportProducts = async (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  try {
    await verifyAdminAccess();

    const where: any = {};

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const csvHeader = 'ID,Name,Category,Price,Quantity,Status,Description,Images,Created At\n';
    const csvRows = products.map((product: any) => {
      const images = product.images.map((img: any) => img.image).join(';');
      return `"${product.id}","${product.name}","${product.category}","${product.basePrice || 'N/A'}","${product.quantity}","${product.status}","${product.description || ''}","${images}","${product.createdAt}"`;
    }).join('\n');

    return csvHeader + csvRows;

  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Export failed');
  }
};
