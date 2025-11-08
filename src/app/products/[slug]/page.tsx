import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { generateProductSchema, generateProductMetadata } from '@/lib/seo';
import ProductDetail from '@/modules/products/components/ProductDetail';
import { getProductBySlug, getProductByIdOrSlug } from '@/modules/products/services';
import type { ProductsWithImages } from '@/types';
import React from 'react';

/**
 * Generate metadata for product detail page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as ProductsWithImages;
  
  if (!product) {
    return {
      title: 'Product Not Found | Sheikh Shop',
      description: 'The requested product could not be found.',
    };
  }

  return generateProductMetadata(product as any);
}

/**
 * Product detail page using SEO-friendly slug
 * Supports both slug and ID for backward compatibility
 */
export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  // Try slug first, fallback to ID for backward compatibility
  // This allows old /products/[uuid] URLs to still work
  const product = await getProductByIdOrSlug(slug) as ProductsWithImages;

  if (!product) {
    notFound();
  }

  // If product was found by ID and has a slug, redirect to slug URL for SEO
  // This ensures canonical URLs are used
  if (product.slug && product.slug !== slug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)) {
    // This is a UUID, redirect to slug if available
    // Note: Redirects in Next.js 15 need to be handled differently in server components
    // For now, we'll just serve the page but log a warning
    console.warn(`Product accessed by ID ${slug}, but slug ${product.slug} exists. Consider redirecting.`);
  }

  // Generate schema.org structured data
  const jsonLd = generateProductSchema(product as any, { 
    currency: process.env.SHOP_DEFAULT_CURRENCY || 'USD' 
  });

  return (
    <section>
      <JsonLd data={jsonLd as any} />
      <ProductDetail {...product} />
    </section>
  );
}

// Enable ISR for better performance
export const revalidate = 3600; // Revalidate every hour

