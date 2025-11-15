/**
 * HTML Sanitization Utilities
 * Prevents unsafe HTML tags from being stored in database fields
 * Allows Markdown/HTML in description field (sanitized on render)
 */

import { generateExcerpt } from '@/lib/markdown';

/**
 * Strips all HTML tags from a string
 * @param text - The text to sanitize
 * @returns Clean text without HTML tags
 */
export function stripHtmlTags(text: string | null | undefined): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/&[a-zA-Z]+;/g, '') // Remove other HTML entities
    .trim();
}

/**
 * Validates that a string contains no HTML tags
 * @param text - The text to validate
 * @returns true if text contains no HTML, false otherwise
 */
export function hasNoHtmlTags(text: string | null | undefined): boolean {
  if (!text) return true;
  
  const htmlTagPattern = /<[^>]+>/g;
  return !htmlTagPattern.test(text);
}

/**
 * Sanitizes product name - removes HTML and trims
 * @param name - Product name to sanitize
 * @returns Clean product name
 */
export function sanitizeProductName(name: string | null | undefined): string {
  if (!name) return '';
  
  const cleaned = stripHtmlTags(name);
  return cleaned.substring(0, 255); // Enforce max length
}

/**
 * Sanitizes product description - allows Markdown/HTML (will be sanitized on render)
 * @param description - Product description (can contain Markdown/HTML)
 * @returns Description as-is (sanitization happens on render)
 */
export function sanitizeProductDescription(description: string | null | undefined): string | null {
  if (!description) return null;
  
  // Description can contain Markdown/HTML - we'll sanitize it on render
  // Just remove script tags and event handlers for basic safety
  const cleaned = description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
  
  return cleaned || null;
}

/**
 * Sanitizes SEO fields - removes HTML and enforces length limits
 * @param field - SEO field value
 * @param maxLength - Maximum allowed length
 * @returns Clean SEO field value or null
 */
export function sanitizeSeoField(
  field: string | null | undefined,
  maxLength: number
): string | null {
  if (!field) return null;
  
  const cleaned = stripHtmlTags(field);
  if (!cleaned) return null;
  
  return cleaned.substring(0, maxLength) || null;
}

/**
 * Sanitizes excerpt field - plain text only
 * @param excerpt - Excerpt text
 * @returns Clean excerpt or null
 */
export function sanitizeExcerpt(excerpt: string | null | undefined): string | null {
  if (!excerpt) return null;
  
  const cleaned = stripHtmlTags(excerpt);
  return cleaned || null;
}

/**
 * Auto-generates excerpt from description if excerpt is empty
 * ALWAYS returns plain text (no HTML, no Markdown)
 * @param description - Product description
 * @param existingExcerpt - Existing excerpt (if any)
 * @returns Plain text excerpt (existing or generated), or null
 */
export function getOrGenerateExcerpt(
  description: string | null | undefined,
  existingExcerpt: string | null | undefined
): string | null {
  if (existingExcerpt) {
    // Sanitize existing excerpt to ensure no HTML
    const sanitized = sanitizeExcerpt(existingExcerpt);
    if (sanitized) {
      // Double-check: strip HTML again and collapse whitespace
      return stripHtmlTags(sanitized)
        .replace(/\s+/g, ' ')
        .trim() || null;
    }
  }
  
  if (description) {
    // generateExcerpt already strips HTML, but ensure it's clean
    const generated = generateExcerpt(description, 200);
    // Final safety check: strip any remaining HTML and normalize
    return stripHtmlTags(generated)
      .replace(/\s+/g, ' ')
      .trim() || null;
  }
  
  return null;
}

/**
 * Sanitizes new e-commerce fields
 */
export function sanitizeBrand(brand: string | null | undefined): string | null {
  if (!brand) return null;
  return stripHtmlTags(brand).substring(0, 100) || null;
}

export function sanitizeSku(sku: string | null | undefined): string | null {
  if (!sku) return null;
  // SKU should be alphanumeric with dashes/underscores
  return sku.trim().substring(0, 100) || null;
}

export function sanitizeWarranty(warranty: string | null | undefined): string | null {
  if (!warranty) return null;
  return stripHtmlTags(warranty).substring(0, 200) || null;
}

export function sanitizeOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;
  return stripHtmlTags(origin).substring(0, 100) || null;
}

/**
 * Validates product data for HTML content
 * @param product - Product data to validate
 * @returns Object with validation results
 */
export function validateProductData(product: {
  name?: string | null;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  h1Override?: string | null;
  excerpt?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  brand?: string | null;
  sku?: string | null;
  warranty?: string | null;
  origin?: string | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (product.name && !hasNoHtmlTags(product.name)) {
    errors.push('Product name contains HTML tags');
  }
  
  // Description can contain Markdown/HTML - just check for scripts
  if (product.description && /<script/i.test(product.description)) {
    errors.push('Product description contains script tags');
  }
  
  if (product.seoTitle && !hasNoHtmlTags(product.seoTitle)) {
    errors.push('SEO title contains HTML tags');
  }
  
  if (product.seoDescription && !hasNoHtmlTags(product.seoDescription)) {
    errors.push('SEO description contains HTML tags');
  }
  
  if (product.h1Override && !hasNoHtmlTags(product.h1Override)) {
    errors.push('H1 override contains HTML tags');
  }
  
  if (product.excerpt && !hasNoHtmlTags(product.excerpt)) {
    errors.push('Excerpt contains HTML tags');
  }
  
  if (product.ogTitle && !hasNoHtmlTags(product.ogTitle)) {
    errors.push('OG title contains HTML tags');
  }
  
  if (product.ogDescription && !hasNoHtmlTags(product.ogDescription)) {
    errors.push('OG description contains HTML tags');
  }
  
  if (product.brand && !hasNoHtmlTags(product.brand)) {
    errors.push('Brand contains HTML tags');
  }
  
  if (product.warranty && !hasNoHtmlTags(product.warranty)) {
    errors.push('Warranty contains HTML tags');
  }
  
  if (product.origin && !hasNoHtmlTags(product.origin)) {
    errors.push('Origin contains HTML tags');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

