/**
 * Product SEO Generator
 * Strongly typed SEO metadata generator for products
 */

import type { Product } from '@prisma/client';
import type { ProductsWithImages } from '@/types';
import { getBaseUrl } from './hreflang';
import { stripHtmlTags, sanitizeDescription, getSEOValue } from '@/lib/seo/helpers';
import { generateExcerpt } from '@/lib/markdown';

export interface ProductSEOData {
  // Core SEO fields
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  
  // H1 content
  h1Content: string;
  
  // Open Graph
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: 'product' | 'website';
  
  // Twitter Card
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  
  // Schema.org JSON-LD
  schemaMarkup: Record<string, any> | null;
  
  // Additional metadata
  keywords: string[];
  excerpt: string | null;
}

export interface ProductSEOOptions {
  baseUrl?: string;
  currency?: string;
  includeSchema?: boolean;
  logFallbacks?: boolean;
}

/**
 * Generates comprehensive SEO data for a product
 * @param product - Product with images and related data
 * @param options - SEO generation options
 * @returns Strongly typed SEO data object
 */
export function getProductSEO(
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
    brand?: string | null;
    sku?: string | null;
  },
  options: ProductSEOOptions = {}
): ProductSEOData {
  const baseUrl = options.baseUrl || getBaseUrl();
  const currency = options.currency || 'EUR';
  const includeSchema = options.includeSchema !== false;
  const logFallbacks = options.logFallbacks || false;
  
  // Ensure product name is clean (no HTML)
  const cleanName = stripHtmlTags(product.name);
  
  // Generate canonical URL
  const canonicalPath = product.canonicalUrl || 
    `/products/${product.slug || product.id}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  
  // Meta Title: seoTitle > product.name
  let titleSource: string;
  const metaTitle = getSEOValue(product.seoTitle, product.name);
  if (product.seoTitle) {
    titleSource = 'SEO';
  } else {
    titleSource = 'fallback';
  }
  
  // Meta Description: seoDescription > product.shortDescription > sanitized product.description
  let descriptionSource: string;
  const metaDescription = getSEOValue(
    product.seoDescription,
    product.excerpt, // excerpt is used as shortDescription
    sanitizeDescription(product.description, 150)
  );

  if (product.seoDescription) {
    descriptionSource = 'SEO';
  } else if (product.excerpt) {
    descriptionSource = 'fallback (shortDescription)';
  } else {
    descriptionSource = 'auto (sanitized description)';
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[SEO Debug] Product "${product.name}" metadata generated:`);
    console.log(`  - Title: Using ${titleSource} layer.`);
    console.log(`  - Description: Using ${descriptionSource} layer.`);
  }
  
  // H1 Content: h1Override > seoTitle > product.name
  const h1Content = stripHtmlTags(
    product.h1Override ||
    product.seoTitle ||
    cleanName
  );
  
  // Excerpt (for UI display)
  const excerptForUI = excerpt 
    ? stripHtmlTags(excerpt).substring(0, 300)
    : null;
  
  // Open Graph Title: ogTitle > seoTitle > metaTitle
  const ogTitle = stripHtmlTags(
    product.ogTitle ||
    product.seoTitle ||
    metaTitle
  ).substring(0, 60);
  
  // Open Graph Description: ogDescription > seoDescription > metaDescription
  const ogDescription = stripHtmlTags(
    product.ogDescription ||
    product.seoDescription ||
    metaDescription
  ).substring(0, 160);
  
  // Open Graph Image
  const ogImage = product.ogImage ||
    (product.images && product.images.length > 0 
      ? product.images[0]?.image || product.images[0]?.secureUrl || ''
      : '') ||
    `${baseUrl}/og-image.jpg`;
  
  const ogImageUrl = ogImage.startsWith('http') 
    ? ogImage 
    : `${baseUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
  
  // Keywords
  const keywords = product.metaKeywords && product.metaKeywords.length > 0
    ? product.metaKeywords
    : [
        cleanName.toLowerCase(),
        product.category.toLowerCase(),
        'premium',
        'luxury',
        'sheikh shop',
        'arabian',
        'heritage',
        'quality',
      ];
  
  // Schema.org JSON-LD
  let schemaMarkup: Record<string, any> | null = null;
  
  if (includeSchema) {
    // Use custom schemaMarkup if provided, otherwise generate default
    if (product.schemaMarkup && typeof product.schemaMarkup === 'object') {
      schemaMarkup = product.schemaMarkup as Record<string, any>;
    } else {
      // Generate default Product schema
      schemaMarkup = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: cleanName,
        description: metaDescription,
        image: product.images?.map(img => 
          img.image?.startsWith('http') 
            ? img.image 
            : `${baseUrl}${img.image}`
        ) || [ogImageUrl],
        brand: product.brand ? {
          '@type': 'Brand',
          name: product.brand,
        } : {
          '@type': 'Brand',
          name: 'Sheikh Shop',
        },
        category: product.category,
        sku: product.sku || product.id,
        mpn: product.sku || product.id, // Manufacturer Part Number
        offers: {
          '@type': 'Offer',
          price: product.basePrice,
          priceCurrency: currency,
          availability: product.quantity > 0 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Sheikh Shop',
          },
          url: canonicalUrl,
        },
        url: canonicalUrl,
      };
      
      // Add additional properties if available
      if (product.baseUnit) {
        schemaMarkup.additionalProperty = [
          {
            '@type': 'PropertyValue',
            name: 'Base Unit',
            value: product.baseUnit.name || 'Unit',
          },
        ];
      }
    }
  }
  
  return {
    metaTitle,
    metaDescription,
    canonicalUrl,
    h1Content,
    ogTitle,
    ogDescription,
    ogImage: ogImageUrl,
    ogType: 'product',
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
    twitterImage: ogImageUrl,
    schemaMarkup,
    keywords,
    excerpt: excerptForUI,
  };
}

/**
 * Validates SEO data for completeness and correctness
 * @param seoData - SEO data to validate
 * @returns Validation result with errors if any
 */
export function validateProductSEO(seoData: ProductSEOData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!seoData.metaTitle || seoData.metaTitle.length === 0) {
    errors.push('Meta title is required');
  } else if (seoData.metaTitle.length > 60) {
    warnings.push(`Meta title is ${seoData.metaTitle.length} characters (recommended: 50-60)`);
  }
  
  if (!seoData.metaDescription || seoData.metaDescription.length === 0) {
    errors.push('Meta description is required');
  } else if (seoData.metaDescription.length > 160) {
    warnings.push(`Meta description is ${seoData.metaDescription.length} characters (recommended: 150-160)`);
  } else if (seoData.metaDescription.length < 120) {
    warnings.push(`Meta description is ${seoData.metaDescription.length} characters (recommended: 120-160)`);
  }
  
  if (!seoData.h1Content || seoData.h1Content.length === 0) {
    errors.push('H1 content is required');
  }
  
  if (!seoData.canonicalUrl || !seoData.canonicalUrl.startsWith('http')) {
    errors.push('Canonical URL must be a valid absolute URL');
  }
  
  // Optional but recommended
  if (!seoData.ogImage) {
    warnings.push('Open Graph image is missing');
  }
  
  if (!seoData.schemaMarkup) {
    warnings.push('Schema.org markup is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

