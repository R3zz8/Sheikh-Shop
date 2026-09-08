/**
 * Torob Integration Adapter Layer
 * Server-only adapter mapping canonical Sheikh Shops product data to Torob schemas.
 */

import { resolveProductPrice } from '@/lib/product-pricing';
import { getEffectiveInventoryStatus } from '@/lib/inventory';
import { getBaseUrl } from '@/lib/seo/sitemapUtils';
import type { ProductsWithImages } from '@/types';

export interface TorobProductSchema {
  product_id: string;
  page_url: string;
  price: number;
  availability: 'instock' | 'outofstock';
  title: string;
  category_name?: string;
  image_url?: string;
  guarantee?: string;
  old_price?: number | null;
  sku?: string | null;
}

/**
 * Maps a single Sheikh Shops Product record to Torob's canonical product schema
 * using standard authoritative pricing and inventory logic.
 */
export function mapProductToTorob(product: ProductsWithImages & Record<string, any>): TorobProductSchema {
  const baseUrl = getBaseUrl();
  const canonicalPath = `/products/${product.slug || product.id}`;
  const page_url = `${baseUrl}${canonicalPath}`;

  const priceInfo = resolveProductPrice(product);
  const effectiveInventoryStatus = getEffectiveInventoryStatus(product as any);

  const isAvailable =
    product.status === 'ACTIVE' &&
    product.quantity > 0 &&
    effectiveInventoryStatus !== 'OUT_OF_STOCK' &&
    effectiveInventoryStatus !== 'DISCONTINUED' &&
    effectiveInventoryStatus !== 'COMING_SOON';

  const availability: 'instock' | 'outofstock' = isAvailable ? 'instock' : 'outofstock';

  const primaryImage =
    product.ogImage ||
    (product.images && product.images.length > 0
      ? product.images[0]?.secureUrl || product.images[0]?.image || null
      : null);

  const image_url = primaryImage
    ? primaryImage.startsWith('http')
      ? primaryImage
      : `${baseUrl}${primaryImage.startsWith('/') ? '' : '/'}${primaryImage}`
    : undefined;

  const guarantee =
    product.warranty && product.warranty.trim().length > 0 ? product.warranty.trim() : undefined;

  return {
    product_id: product.id,
    page_url,
    price: Math.round(priceInfo.price), // Price in Toman (IRT)
    availability,
    title: product.name,
    category_name: product.Category?.name || String(product.category || ''),
    image_url,
    guarantee,
    old_price: priceInfo.oldPrice ? Math.round(priceInfo.oldPrice) : null,
    sku: product.sku || product.id,
  };
}

/**
 * Validates whether the server has configured Torob credentials.
 */
export function getTorobConfig() {
  const apiToken = process.env.TOROB_API_TOKEN || null;
  const isConfigured = Boolean(apiToken);

  return {
    isConfigured,
    apiToken,
  };
}
