
import { prisma } from '@/lib/prisma';
import type { Product } from '@prisma/client';
import { redirect } from 'next/navigation';

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

export const getProductById = async (id: string) => {
  try {
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      return null;
    }

    const result = await prisma.product.findFirst({
      where: { id },
      include: { 
        images: true,
        baseUnit: true,
        discounts: true,
      },
    });

    if (!result) {
      return null;
    }

    // Validate required fields
    if (!result.baseUnit) {
      return null;
    }

    return serializeProduct(result);
  } catch (error) {
    return null;
  }
};

export const upsertProduct = async (product: Product) => {
  const { id } = product;
  let result;
  if (id) {
    result = await prisma.product.update({
      where: {
        id,
      },
      data: product,
    });
  } else {
    result = await prisma.product.create({
      data: product,
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
