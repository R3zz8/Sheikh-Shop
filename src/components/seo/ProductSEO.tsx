/**
 * Reusable Product SEO Component
 * Handles all SEO metadata for product pages using Next.js Metadata API
 */

import type { Metadata } from 'next';
import type { ProductsWithImages } from '@/types';
import { getProductSEO, type ProductSEOData } from '@/lib/seo/product-seo';
import { buildLanguageAlternates } from '@/lib/seo/hreflang';
import { stripHtmlTags } from '@/lib/seo/sanitize';
import JsonLd from './JsonLd';

interface ProductSEOProps {
  product: ProductsWithImages & {
    seoTitle?: string | null;
    seoDescription?: string | null;
    h1Override?: string | null;
    shortDescription?: string | null;
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

/**
 * Generates Next.js Metadata for a product page
 * @param product - Product with SEO fields
 * @param options - SEO generation options
 * @returns Next.js Metadata object
 */
export function generateProductMetadata(
  product: ProductSEOProps['product'],
  options: ProductSEOProps['options'] = {}
): Metadata {
  const seoData = getProductSEO(product, options);
  const baseUrl = options?.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://sheikhshops.com';
  
  return {
    title: {
      default: seoData.metaTitle,
      template: '%s | Sheikh Shop',
    },
    description: seoData.metaDescription,
    keywords: seoData.keywords,
    authors: [{ name: 'Sheikh Shop Team' }],
    creator: 'Sheikh Shop',
    publisher: 'Sheikh Shop',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: seoData.canonicalUrl,
      languages: buildLanguageAlternates(
        product.canonicalUrl || `/products/${product.slug || product.id}`
      ),
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: seoData.canonicalUrl,
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      siteName: 'Sheikh Shop',
      images: [
        {
          url: seoData.ogImage,
          width: 1200,
          height: 630,
          alt: seoData.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.twitterTitle,
      description: seoData.twitterDescription,
      images: [seoData.twitterImage],
      creator: '@sheikhshops',
      site: '@sheikhshops',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'product:price:amount': product.basePrice.toString(),
      'product:price:currency': options?.currency || 'EUR',
    },
  };
}

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

