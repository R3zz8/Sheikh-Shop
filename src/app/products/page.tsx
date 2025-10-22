import { prisma } from '@/lib/prisma';
import ProductListView from '@/modules/products/views/ProductListView';
import React from 'react';
import type { ProductsWithImages } from '@/types';

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic';

export default async function Products() {
  try {
    // Enhanced Prisma query with proper validation and error handling
    const [data, units] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: 'ACTIVE',
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
          units: true, // Include ProductUnits
          discounts: {
            where: {
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
          },
        },
        take: 50, // Limit initial load
        orderBy: {
          createdAt: 'desc', // Show newest products first
        },
      }),
      prisma.unit.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      }),
    ]);

    // Validate that we received data
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data received from Prisma query');
      throw new Error('Invalid data format received');
    }

    return (
      <div className="min-h-screen">
        <ProductListView products={data} units={units} />
      </div>
    );
  } catch (error) {
    // Enhanced error logging and handling
    console.error('Failed to fetch products:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return a user-friendly error page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
          <p className="text-gray-600 mb-6">
            We encountered an issue while loading the products. Please refresh the page to try again.
          </p>
          <div className="text-sm text-gray-500">
            <p>If the problem persists, please contact support.</p>
            <p className="mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </div>
      </div>
    );
  }
}
