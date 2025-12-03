/**
 * Reusable Product SEO Component
 * Handles all SEO metadata for product pages using Next.js Metadata API
 */

import type { Metadata } from 'next';
import type { ProductsWithImages } from '@/types';
import { getProductSEO, type ProductSEOData } from '@/lib/seo/product-seo';
import { buildLanguageAlternates } from '@/lib/seo/hreflang';
import { resolveProductPrice } from '@/lib/product-pricing';
import { stripHtmlTags } from '@/lib/seo/sanitize';
import JsonLd from './JsonLd';

interface ProductSEOProps {
  product: ProductsWithImages & {
    seoTitle?: string | null;
    seoDescription?: string | null;
    h1Override?: string | null;
    excerpt?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    schemaMarkup?: any;
    canonicalUrl?: string | null;
    metaKeywords?: string[];
  };
  options?: {
    baseUrl?: string;
    currency?: string;
    includeSchema?: boolean;
  };
}

// The generateProductMetadata function has been removed from this file.
// Its functionality is now centralized in the new `generatePageSEO` helper
// located in `src/lib/seo/core.ts`. This change was made to eliminate
// hardcoded title suffixes and consolidate SEO logic across the application.

/**
 * Client component to inject JSON-LD schema markup
 * @param product - Product with schemaMarkup
 * @param seoData - Generated SEO data
 */
export function ProductSchemaMarkup({
  product,
  seoData,
}: {
  product: ProductSEOProps['product'];
  seoData: ProductSEOData;
}) {
  if (!seoData.schemaMarkup) {
    return null;
  }
  
  return <JsonLd data={seoData.schemaMarkup} />;
}

/**
 * Gets H1 content for product detail page
 * @param product - Product with h1Override and seoTitle
 * @returns H1 content string
 */
export function getProductH1Content(product: {
  h1Override?: string | null;
  seoTitle?: string | null;
  name: string;
}): string {
  if (product.h1Override) {
    return stripHtmlTags(product.h1Override);
  }
  
  if (product.seoTitle) {
    return stripHtmlTags(product.seoTitle);
  }
  
  return stripHtmlTags(product.name);
}

