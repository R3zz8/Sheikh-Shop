import { prisma } from '@/lib/prisma';
import type { ProductCategoryType } from '@prisma/client';

export async function getProductsByCategory(category: ProductCategoryType) {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        categoryType: category,
      },
      include: {
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
          },
        },
        baseUnit: true,
        units: true,
        discounts: {
          where: {
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      take: 50,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!products || !Array.isArray(products)) {
      console.error('Invalid data received from Prisma query');
      throw new Error('Invalid data format received');
    }

    return products;
  } catch (error) {
    console.error('Failed to fetch products by category:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw new Error('Failed to fetch products');
  }
}
