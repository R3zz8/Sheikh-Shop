import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductListView from '@/modules/products/views/ProductListView';
import React from 'react';
import { getProductsByCategory } from '@/lib/data/products';
import { ProductCategoryType } from '@prisma/client';

/**
 * Generate metadata for product listing page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Premium Products Collection | Sheikh Shop',
    description: 'Discover our curated collection of premium dates, saffron, honey, and authentic Middle Eastern products. Exceptional quality with worldwide shipping.',
    keywords: [
      'premium products',
      'dates',
      'saffron',
      'honey',
      'luxury food',
      'sheikh shop',
      'middle eastern products',
      'authentic products',
      'organic dates',
      'premium saffron',
    ],
    openGraph: {
      title: 'Premium Products Collection | Sheikh Shop',
      description: 'Discover our curated collection of premium Middle Eastern products.',
      type: 'website',
      url: '/products',
      siteName: 'Sheikh Shop',
      images: [
        {
          url: '/og-products.jpg',
          width: 1200,
          height: 630,
          alt: 'Premium Products Collection - Sheikh Shop',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Premium Products Collection | Sheikh Shop',
      description: 'Discover our curated collection of premium Middle Eastern products.',
      images: ['/og-products.jpg'],
    },
    alternates: {
      canonical: '/products',
    },
  };
}

// Use ISR for better performance instead of force-dynamic
export const revalidate = 3600; // Revalidate every hour

export default async function Products() {
  try {
    const [data, units] = await Promise.all([
      getProductsByCategory(ProductCategoryType.SheikhFood),
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
