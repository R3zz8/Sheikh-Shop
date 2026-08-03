import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ProductListView from '@/modules/products/views/ProductListView';
import React from 'react';
import { toNumber } from '@/lib/currency';
import { getProductsByCategory } from '@/lib/data/products';
import { ProductCategoryType } from '@prisma/client';
import { buildLanguageAlternates, getBaseUrl } from '@/lib/seo/hreflang';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic';

/**
 * Generate premium metadata for the Sheikh Nava page
 */
export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = getBaseUrl();
  const canonicalPath = '/tech-products';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return {
    title: 'شیخ نوا | فروشگاه بزرگ شیخ',
    description: 'شیخ نوا؛ خانه‌ی گجت‌های خاص، دکورهای هوشمند و فناوری‌هایی که زیبایی، نوآوری و تجربه‌ای متفاوت را به فضای زندگی شما می‌آورند.',
    keywords: [
      'شیخ نوا',
      'گجت‌های خاص',
      'دکورهای هوشمند',
      'لوازم هوشمند شیک',
      'اسپیکر لوکس',
      'پروژکتور کهکشانی',
      'اکسسوری هوشمند خلاقانه',
      'sheikh nava',
      'luxury gadgets',
      'smart home decor',
      'premium tech accessories',
    ],
    openGraph: {
      title: 'شیخ نوا | فروشگاه بزرگ شیخ',
      description: 'شیخ نوا؛ خانه‌ی گجت‌های خاص، دکورهای هوشمند و فناوری‌هایی که زیبایی، نوآوری و تجربه‌ای متفاوت را به فضای زندگی شما می‌آورند.',
      type: 'website',
      url: canonicalUrl,
      siteName: 'فروشگاه شیخ',
      images: [
        {
          url: `${baseUrl}/og-products.jpg`, // reuse global cover
          width: 1200,
          height: 630,
          alt: 'مجموعه گجت‌های لوکس شیخ نوا - فروشگاه شیخ',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'شیخ نوا | فروشگاه بزرگ شیخ',
      description: 'شیخ نوا؛ خانه‌ی گجت‌های خاص، دکورهای هوشمند و فناوری‌هایی که زیبایی، نوآوری و تجربه‌ای متفاوت را به فضای زندگی شما می‌آورند.',
      images: [`${baseUrl}/og-products.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(canonicalPath),
    },
  };
}

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

function serializeUnits(units: any[]) {
  if (!units) return [];
  return units.map(u => ({
    ...u,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : String(u.updatedAt),
  }));
}

export default async function TechProducts() {
  try {
    const [data, units] = await Promise.all([
      getProductsByCategory(ProductCategoryType.SheikhTech),
      prisma.unit.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          symbol: true,
          multiplier: true,
          isActive: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
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

    const serializedProducts = serializeProducts(data);
    const serializedUnits = serializeUnits(units);

    // Build breadcrumbs for SEO schema
    const breadcrumbs = [
      { name: 'خانه', url: '/' },
      { name: 'محصولات', url: '/products' },
      { name: 'شیخ نوا', url: '/tech-products' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0503] via-[#120703] to-[#0a0503] text-white">
        {/* Render Breadcrumb JSON-LD schema */}
        <BreadcrumbJsonLd breadcrumbs={breadcrumbs} />

        <div id="nava-products-section" className="scroll-mt-24 pb-16">
          <ProductListView
            products={serializedProducts}
            units={serializedUnits}
            title="شیخ نوا"
            subtitle="شیخ نوا؛ خانه‌ی گجت‌های خاص، دکورهای هوشمند و فناوری‌هایی که زیبایی، نوآوری و تجربه‌ای متفاوت را به فضای زندگی شما می‌آورند."
            variant="nava"
          />
        </div>
      </div>
    );
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development';
    console.error('Failed to fetch tech products:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return a user-friendly error page
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
          <h1 className="text-xl font-bold text-white mb-2">خطا در بارگذاری شیخ نوا</h1>
          <p className="text-gray-400 text-sm mb-6">
            در بارگذاری صفحه شیخ نوا مشکلی موقت پیش آمده است. لطفا صفحه را مجددا بارگذاری نمایید.
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
