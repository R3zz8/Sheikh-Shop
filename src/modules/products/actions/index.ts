'use server';

import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { ProductCategory, ProductStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Enhanced validation schema with status
const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  price: z.number()
    .min(0.01, 'Price must be at least $0.01')
    .max(999999.99, 'Price must be less than $1,000,000'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(999999, 'Quantity must be less than 1,000,000'),
  category: z.enum(Object.values(ProductCategory) as [string, ...string[]]),
  status: z.enum(Object.values(ProductStatus) as [string, ...string[]]).optional(),
});

// Bulk operations schema
const bulkOperationSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product must be selected'),
  action: z.enum(['delete', 'activate', 'deactivate', 'draft']),
});

// Security: Verify user has admin privileges
async function verifyAdminAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session-token')?.value;

  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
      {
        algorithms: ['HS256'],
        issuer: 'sheikh-shop',
        audience: 'sheikh-shop-users',
      },
    );

    const userRole = payload.role as string;
    if (!['ADMIN', 'SUPERADMIN'].includes(userRole)) {
      throw new Error('Insufficient permissions');
    }

    return { userId: payload.id as string, userRole };
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
    const { userId } = await verifyAdminAccess();

    const id = formData.get('id') as string | null;
    const rawData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string || '',
      price: parseFloat(formData.get('price') as string),
      quantity: parseInt(formData.get('quantity') as string),
      status: (formData.get('status') as string) || 'ACTIVE',
    };

    // Enhanced validation
    const validationResult = productSchema.safeParse(rawData);
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
        data: validatedData as any,
      });

      // Audit logging
      await logAuditEvent(userId, 'PRODUCT_UPDATED', {
        productId: id,
        productName: result.name,
        changes: validatedData,
      });

      revalidatePath('/dashboard/products');
      return { error: null, data: result };
    } else {
      // Create new product
      const result = await prisma.product.create({
        data: validatedData as any,
      });

      // Audit logging
      await logAuditEvent(userId, 'PRODUCT_CREATED', {
        productId: result.id,
        productName: result.name,
        data: validatedData,
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

    // Delete associated images from filesystem
    for (const image of existingProduct.images) {
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

          // Delete image files
          for (const image of images) {
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
    const csvRows = products.map(product => {
      const images = product.images.map(img => img.image).join(';');
      return `"${product.id}","${product.name}","${product.category}","${product.basePrice}","${product.quantity}","${product.status}","${product.description || ''}","${images}","${product.createdAt}"`;
    }).join('\n');

    return csvHeader + csvRows;

  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Export failed');
  }
};
