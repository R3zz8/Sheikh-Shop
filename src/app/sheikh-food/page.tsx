import type { Metadata } from 'next';
import React from 'react';
import { prisma } from '@/lib/prisma';
import { getProductsByCategory } from '@/lib/data/products';
import { ProductCategoryType } from '@prisma/client';
import { toNumber } from '@/lib/currency';
import { buildLanguageAlternates, getBaseUrl } from '@/lib/seo/hreflang';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

// Import our premium custom Sheikh Food page sections
import SheikhFoodEmptyState from '@/components/sheikhFood/SheikhFoodEmptyState';
import ProductListView from '@/modules/products/views/ProductListView';

// Force dynamic rendering to avoid build-time static queries failing on headless/restricted environments
export const dynamic = 'force-dynamic';

/**
 * Generate metadata for the Sheikh Food page
 */
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const canonicalPath = '/sheikh-food';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return {
    title: 'محصولات غذایی شیخ (عسل، زعفران، خرما) | فروشگاه بزرگ شیخ',
    description: 'کامل‌ترین مجموعه فرآورده‌های غذایی اصیل شامل عسل طبیعی کوهستان، زعفران ناب نگین و خرمای مجول سلطنتی با کیفیت استثنایی در فروشگاه بزرگ شیخ.',
    keywords: [
      'زعفران شیخ',
      'عسل طبیعی',
      'خرمای مجول',
      'محصولات غذایی لوکس',
      'زعفران نگین ممتاز',
      'sheikh food',
      'luxury saffron',
      'organic honey',
      'premium dates',
    ],
    openGraph: {
      title: 'محصولات غذایی شیخ (عسل، زعفران، خرما) | فروشگاه بزرگ شیخ',
      description: 'مجموعه گزینش‌شده و فوق‌العاده باکیفیت فرآورده‌های غذایی نفیس شامل عسل کوهستان، زعفران ناب و خرما.',
      type: 'website',
      url: canonicalUrl,
      siteName: 'فروشگاه شیخ',
      images: [
        {
          url: `${baseUrl}/og-products.jpg`,
          width: 1200,
          height: 630,
          alt: 'مجموعه محصولات غذایی شیخ - فروشگاه شیخ',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'محصولات غذایی شیخ (عسل، زعفران، خرما) | فروشگاه بزرگ شیخ',
      description: 'کامل‌ترین مجموعه محصولات غذایی ارگانیک و مجلل فروشگاه شیخ.',
      images: [`${baseUrl}/og-products.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(canonicalPath),
    },
  };
}

// Helper function to serialize Decimal/Float prices and Date objects safely for the client component
function serializeProducts(products: any[]) {
  if (!products) return [];
  return products.map(product => {
    return {
      ...product,
      basePrice: toNumber(product.basePrice),
      oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : String(product.createdAt),
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : String(product.updatedAt),
      baseUnit: product.baseUnit ? {
        ...product.baseUnit,
        createdAt: product.baseUnit.createdAt instanceof Date ? product.baseUnit.createdAt.toISOString() : String(product.baseUnit.createdAt),
        updatedAt: product.baseUnit.updatedAt instanceof Date ? product.baseUnit.updatedAt.toISOString() : String(product.baseUnit.updatedAt),
      } : null,
      units: (product.units || []).map((u: any) => ({
        ...u,
        price: toNumber(u.price),
        oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
        createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
        updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
      })),
      images: (product.images || []).map((img: any) => ({
        ...img,
        createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : String(img.createdAt),
      })),
      discounts: (product.discounts || []).map((d: any) => ({
        ...d,
        startDate: d.startDate instanceof Date ? d.startDate.toISOString() : String(d.startDate),
        endDate: d.endDate instanceof Date ? d.endDate.toISOString() : String(d.endDate),
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : String(d.updatedAt),
      })),
    };
  });
}

// Helper function to serialize system unit dates cleanly
function serializeUnits(units: any[]) {
  if (!units) return [];
  return units.map(u => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
  }));
}

export default async function SheikhFoodPage() {
  try {
    // Parallel fetching of Sheikh Food products and active system units
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

    if (!data || !Array.isArray(data)) {
      console.error('Invalid food products list format received');
      throw new Error('Invalid format received from data fetching');
    }

    const serializedProducts = serializeProducts(data);
    const serializedUnits = serializeUnits(units);

    // Build breadcrumbs for SEO schema
    const breadcrumbs = [
      { name: 'خانه', url: '/' },
      { name: 'محصولات', url: '/products' },
      { name: 'شیخ فود', url: '/sheikh-food' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0503] via-[#120703] to-[#0a0503] text-white">
        {/* Render Breadcrumb JSON-LD schema */}
        <BreadcrumbJsonLd breadcrumbs={breadcrumbs} />

        {/* 3. Product Listing Grid or Localized Premium Empty State */}
        <div id="food-products-section" className="scroll-mt-24 pb-16">
          {serializedProducts.length > 0 ? (
            <ProductListView
              products={serializedProducts}
              units={serializedUnits}
              title="محصولات غذایی شیخ"
              subtitle="از عسل‌های کوهستان طبیعی تا خرمای مجول ممتاز شاهانه و زعفران اصیل ایرانی."
              variant="food"
            />
          ) : (
            <SheikhFoodEmptyState />
          )}
        </div>
      </div>
    );
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Failed to load Sheikh Food page:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950 font-vazirmatn" dir="rtl">
        <div className="text-center p-8 border border-amber-500/10 bg-[#140b07]/80 rounded-[2rem] max-w-2xl mx-auto shadow-2xl">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">خطا در بارگذاری شیخ فود</h1>
          <p className="text-gray-400 text-sm mb-6">
            در بارگذاری صفحه شیخ فود مشکلی موقت پیش آمده است. لطفا صفحه را مجددا بارگذاری نمایید.
          </p>
          <div className="text-xs text-amber-500/50">
            <p>Error code: {error instanceof Error ? error.message : 'UNKNOWN_DB_ERROR'}</p>
          </div>

          {isDev && error instanceof Error && (
            <div className="mt-6 text-left" dir="ltr">
              <details className="bg-black/50 p-4 rounded-xl border border-red-500/20 text-red-400 text-xs overflow-auto max-h-60">
                <summary className="cursor-pointer font-semibold select-none mb-2 text-red-500 hover:text-red-400 transition-colors">
                  View Developer Stack Trace (Development Mode Only)
                </summary>
                <p className="font-mono whitespace-pre-wrap">{error.stack || error.message}</p>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }
}
