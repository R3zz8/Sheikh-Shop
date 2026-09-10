/**
 * Torob Integration Adapter Layer
 * Server-only adapter mapping canonical Sheikh Shops product data to Torob schemas (API v3).
 */

import crypto from 'crypto';
import { resolveProductPrice } from '@/lib/product-pricing';
import { getEffectiveInventoryStatus } from '@/lib/inventory';
import { getBaseUrl } from '@/lib/seo/sitemapUtils';
import type { ProductsWithImages } from '@/types';

/**
 * Official Torob Public Key for JWT Verification (EdDSA / Ed25519)
 * Source: https://github.com/Torob/Torob-Sync/blob/main/torob_api_token_guide.md
 */
export const TOROB_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=
-----END PUBLIC KEY-----`;

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

export interface TorobV3ProductSchema {
  page_unique: string;
  page_url: string;
  product_group_id?: string;
  title: string;
  subtitle?: string | null;
  current_price: number;
  old_price?: number | null;
  availability: boolean;
  category_name?: string | null;
  image_links: string[];
  spec: Record<string, any>;
  guarantee?: string | null;
  short_desc?: string | null;
  date_added: string;
  date_updated?: string | null;
}

/**
 * Legacy V1/V2 helper retained for backward compatibility.
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
    price: isAvailable ? Math.round(priceInfo.price) : 0, // Price in Toman (IRT), 0 when unavailable
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
 * Maps a single Sheikh Shops Product record to official Torob Product API v3 format.
 */
export function mapProductToTorobV3(product: Record<string, any>): TorobV3ProductSchema {
  const baseUrl = getBaseUrl();
  const canonicalPath = `/products/${product.slug || product.id}`;
  const page_url = `${baseUrl}${canonicalPath}`;

  const priceInfo = resolveProductPrice(product as any);
  const effectiveInventoryStatus = getEffectiveInventoryStatus(product as any);

  const isAvailable =
    product.status === 'ACTIVE' &&
    product.quantity > 0 &&
    effectiveInventoryStatus !== 'OUT_OF_STOCK' &&
    effectiveInventoryStatus !== 'DISCONTINUED' &&
    effectiveInventoryStatus !== 'COMING_SOON';

  // Construct absolute image links
  const image_links: string[] = [];
  if (product.ogImage) {
    const fullOg = product.ogImage.startsWith('http')
      ? product.ogImage
      : `${baseUrl}${product.ogImage.startsWith('/') ? '' : '/'}${product.ogImage}`;
    image_links.push(fullOg);
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      const raw = img.secureUrl || img.image;
      if (raw) {
        const fullImg = raw.startsWith('http')
          ? raw
          : `${baseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`;
        if (!image_links.includes(fullImg)) {
          image_links.push(fullImg);
        }
      }
    }
  }

  // Ensure specs is an object, never null
  let spec: Record<string, any> = {};
  if (product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications)) {
    spec = product.specifications;
  } else if (typeof product.specifications === 'string') {
    try {
      spec = JSON.parse(product.specifications);
    } catch {
      spec = {};
    }
  }

  const guarantee =
    product.warranty && product.warranty.trim().length > 0 ? product.warranty.trim() : null;

  const short_desc = product.excerpt && product.excerpt.trim().length > 0
    ? product.excerpt.trim().slice(0, 500)
    : null;

  const category_name = product.Category?.name || (typeof product.category === 'string' ? product.category : null);

  const createdAt = product.createdAt instanceof Date ? product.createdAt.toISOString() : String(product.createdAt || new Date().toISOString());
  const updatedAt = product.updatedAt instanceof Date ? product.updatedAt.toISOString() : String(product.updatedAt || new Date().toISOString());

  return {
    page_unique: product.id,
    page_url,
    product_group_id: product.id,
    title: product.name,
    subtitle: product.excerpt ? product.excerpt.slice(0, 500) : null,
    current_price: isAvailable ? Math.round(priceInfo.price) : 0,
    old_price: priceInfo.oldPrice ? Math.round(priceInfo.oldPrice) : null,
    availability: isAvailable,
    category_name,
    image_links,
    spec,
    guarantee,
    short_desc,
    date_added: createdAt,
    date_updated: updatedAt,
  };
}

/**
 * Validates Torob JWT header token (`X-Torob-Token`) and token version (`X-Torob-Token-Version`).
 */
export async function verifyTorobToken(
  token: string | null,
  tokenVersion: string | null,
  reqHost?: string | null,
  customPublicKey?: crypto.KeyObject
): Promise<{ isValid: boolean; error?: string; payload?: any }> {
  if (!tokenVersion || tokenVersion.trim() !== '1') {
    return { isValid: false, error: 'X-Torob-Token-Version header must be "1"' };
  }

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { isValid: false, error: 'X-Torob-Token header is missing or empty' };
  }

  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { isValid: false, error: 'Malformed JWT structure' };
    }

    const [headerB64, payloadB64, sigB64] = parts;
    if (!headerB64 || !payloadB64 || !sigB64) {
      return { isValid: false, error: 'Malformed JWT structure' };
    }

    const headerStr = Buffer.from(headerB64, 'base64url').toString('utf8');
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const sigBuf = Buffer.from(sigB64, 'base64url');

    const header = JSON.parse(headerStr);
    const payload = JSON.parse(payloadStr);

    if (header.alg !== 'EdDSA') {
      return { isValid: false, error: 'JWT algorithm must be EdDSA' };
    }

    const verifyData = `${headerB64}.${payloadB64}`;
    const publicKey = customPublicKey || crypto.createPublicKey(TOROB_PUBLIC_KEY_PEM);

    const isSignatureValid = crypto.verify(
      null,
      Buffer.from(verifyData, 'utf8'),
      publicKey,
      sigBuf
    );

    if (!isSignatureValid) {
      return { isValid: false, error: 'Invalid JWT signature' };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);

    if (typeof payload.exp === 'number' && nowSeconds > payload.exp) {
      return { isValid: false, error: 'JWT token has expired' };
    }

    if (typeof payload.nbf === 'number' && nowSeconds < payload.nbf) {
      return { isValid: false, error: 'JWT token not yet active (nbf)' };
    }

    // Determine expected hostname
    let allowedHostname: string | null = process.env.TOROB_ALLOWED_AUDIENCE || null;
    if (!allowedHostname && reqHost) {
      allowedHostname = reqHost.split(':')[0] || null; // strip port if present
    }
    if (!allowedHostname) {
      try {
        const url = new URL(getBaseUrl());
        allowedHostname = url.hostname;
      } catch {
        allowedHostname = 'sheikhshops.com';
      }
    }

    const validAudiences = Array.from(new Set([
      allowedHostname,
      'sheikhshops.com',
      'www.sheikhshops.com',
    ])).filter((aud): aud is string => Boolean(aud));

    if (!payload.aud) {
      return { isValid: false, error: 'Missing required "aud" (audience) claim' };
    }

    if (!validAudiences.includes(payload.aud)) {
      return { isValid: false, error: `Invalid audience claim: "${payload.aud}"` };
    }

    return {
      isValid: true,
      payload,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Failed to verify Torob JWT token',
    };
  }
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
