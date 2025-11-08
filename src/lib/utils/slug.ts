/**
 * Slug generation utility for SEO-friendly URLs
 */

/**
 * Generates a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Ensures a slug is unique by appending a number if needed
 * @param baseSlug - The base slug to check
 * @param existingSlugs - Array of existing slugs to check against
 * @param productId - Optional product ID to exclude from uniqueness check
 * @returns A unique slug
 */
export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
  productId?: string
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  // Try appending numbers until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    
    // Safety check to prevent infinite loops
    if (counter > 1000) {
      // If we can't find a unique slug after 1000 attempts, append timestamp
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }
  
  return slug;
}

/**
 * Generates a slug from product name and ensures uniqueness
 * @param productName - The product name
 * @param existingSlugs - Array of existing slugs
 * @param productId - Optional product ID for uniqueness check
 * @returns A unique, SEO-friendly slug
 */
export function generateProductSlug(
  productName: string,
  existingSlugs: string[] = [],
  productId?: string
): string {
  const baseSlug = generateSlug(productName);
  
  if (!baseSlug) {
    // Fallback to product ID if name can't generate a slug
    return productId || `product-${Date.now()}`;
  }
  
  return ensureUniqueSlug(baseSlug, existingSlugs, productId);
}

