/**
 * HTML Sanitization Utilities
 * Prevents HTML tags from being stored in database fields
 */

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
 * Sanitizes product description - removes HTML and trims
 * @param description - Product description to sanitize
 * @returns Clean product description
 */
export function sanitizeProductDescription(description: string | null | undefined): string | null {
  if (!description) return null;
  
  const cleaned = stripHtmlTags(description);
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
  shortDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (product.name && !hasNoHtmlTags(product.name)) {
    errors.push('Product name contains HTML tags');
  }
  
  if (product.description && !hasNoHtmlTags(product.description)) {
    errors.push('Product description contains HTML tags');
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
  
  if (product.shortDescription && !hasNoHtmlTags(product.shortDescription)) {
    errors.push('Short description contains HTML tags');
  }
  
  if (product.ogTitle && !hasNoHtmlTags(product.ogTitle)) {
    errors.push('OG title contains HTML tags');
  }
  
  if (product.ogDescription && !hasNoHtmlTags(product.ogDescription)) {
    errors.push('OG description contains HTML tags');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

