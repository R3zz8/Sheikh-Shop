import { prisma } from '@/lib/prisma';
import ProductListView from '@/modules/products/views/ProductListView';
import React from 'react';
import type { ProductsWithImages } from '@/types';

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function Products() {
  try {
    const data: ProductsWithImages[] = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        images: {
          select: {
            id: true,
            image: true,
            productId: true,
            createdAt: true,
          },
        },
      },
      take: 50, // Limit initial load
    });

    return (
      <div className="min-h-screen">
        <ProductListView products={data} />
      </div>
    );
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }
}
