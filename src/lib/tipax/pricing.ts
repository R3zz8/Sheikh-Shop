/**
 * Tipax Dynamic Pricing Engine
 * Calculates shipping quotes via official Tipax endpoints (`/api/OM/v3/Pricing/Min` & `/api/OM/v3/Pricing`)
 */

import { getValidTipaxToken, getTipaxCredentials } from './auth';
import { resolveTipaxCityId, DEFAULT_TIPAX_ORIGIN_CITY_ID } from './cities';
import type { TipaxPackageSpec, TipaxQuoteResult, TipaxPricingResponse } from './types';
import { calculateCartShipping } from '@/lib/shipping';

// Default package profile specs when product weight/dimensions are omitted
export const DEFAULT_PACKAGE_SPEC: TipaxPackageSpec = {
  weightKg: 1.0,
  lengthCm: 20,
  widthCm: 15,
  heightCm: 10,
  valueRial: 10000000, // 1,000,000 Toman declared value
};

/**
 * Calculates dynamic Tipax shipping quote
 */
export async function getTipaxShippingQuoteServer(params: {
  originCityId?: number;
  destinationCityName: string;
  destinationProvinceName?: string;
  packages?: TipaxPackageSpec[];
  totalValueToman?: number;
  items?: Array<{
    product: {
      weight?: number | null;
      dimensions?: any;
      shippingCost?: number | null;
      allowFreeShipping?: boolean | null;
    } | null;
    quantity: number;
  }>;
}): Promise<TipaxQuoteResult> {
  const { baseUrl, apiKey } = getTipaxCredentials();
  const originCityId = params.originCityId || DEFAULT_TIPAX_ORIGIN_CITY_ID;
  const destinationCityId = resolveTipaxCityId(params.destinationCityName, params.destinationProvinceName);

  // Compute total package specs from items or fallback
  let totalWeightKg = 0;
  let totalVolumeCm3 = 0;
  let totalValueRial = (params.totalValueToman || 0) * 10;

  if (params.packages && params.packages.length > 0) {
    for (const pkg of params.packages) {
      totalWeightKg += pkg.weightKg || DEFAULT_PACKAGE_SPEC.weightKg;
      totalVolumeCm3 += (pkg.lengthCm || DEFAULT_PACKAGE_SPEC.lengthCm) *
                        (pkg.widthCm || DEFAULT_PACKAGE_SPEC.widthCm) *
                        (pkg.heightCm || DEFAULT_PACKAGE_SPEC.heightCm);
    }
  } else if (params.items && params.items.length > 0) {
    for (const item of params.items) {
      const q = Math.max(1, item.quantity);
      const w = typeof item.product?.weight === 'number' && item.product.weight > 0 ? item.product.weight : DEFAULT_PACKAGE_SPEC.weightKg;
      totalWeightKg += w * q;
      totalVolumeCm3 += (DEFAULT_PACKAGE_SPEC.lengthCm * DEFAULT_PACKAGE_SPEC.widthCm * DEFAULT_PACKAGE_SPEC.heightCm) * q;
    }
  } else {
    totalWeightKg = DEFAULT_PACKAGE_SPEC.weightKg;
    totalVolumeCm3 = DEFAULT_PACKAGE_SPEC.lengthCm * DEFAULT_PACKAGE_SPEC.widthCm * DEFAULT_PACKAGE_SPEC.heightCm;
  }

  // Derive equivalent cubic dimension for single volumetric package
  const approxSide = Math.max(10, Math.round(Math.cbrt(totalVolumeCm3)));

  // Obtain valid Tipax access token
  const token = await getValidTipaxToken();

  if (!token) {
    console.warn('[Tipax Pricing] No valid Tipax token available. Falling back to internal shipping engine.');
    return returnFallbackQuote(params.items, 'Tipax auth unavailable');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
    if (apiKey) {
      headers['X-API-KEY'] = apiKey;
      headers['ApiKey'] = apiKey;
    }

    // Call official Tipax Pricing/Min endpoint
    const payload = {
      originCityId,
      destinationCityId,
      weight: Math.max(0.5, totalWeightKg),
      length: approxSide,
      width: approxSide,
      height: approxSide,
      declaredValue: Math.max(1000000, totalValueRial),
    };

    const url = `${baseUrl.replace(/\/$/, '')}/api/OM/v3/Pricing/Min`;
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      console.warn(`[Tipax Pricing API Error] HTTP ${response.status}`);
      return returnFallbackQuote(params.items, `Tipax API status ${response.status}`);
    }

    const resJson: TipaxPricingResponse = await response.json();

    // Extract price from Tipax response payload schema variations
    let priceRial = 0;

    if (typeof resJson.data === 'number') {
      priceRial = resJson.data;
    } else if (typeof resJson.data === 'object' && resJson.data !== null) {
      priceRial = resJson.data.finalPrice ||
                 resJson.data.totalPrice ||
                 resJson.data.price ||
                 resJson.data.shippingFee || 0;
    } else if (typeof resJson.price === 'number') {
      priceRial = resJson.price;
    } else if (typeof resJson.totalPrice === 'number') {
      priceRial = resJson.totalPrice;
    }

    if (!priceRial || priceRial <= 0) {
      console.warn('[Tipax Pricing] Received 0 or invalid price from Tipax response. Using fallback.');
      return returnFallbackQuote(params.items, 'Tipax returned empty pricing');
    }

    // Convert Tipax price (Rial) to Sheikh Shops currency (Toman)
    const priceToman = Math.round(priceRial / 10);

    return {
      shippingCostToman: priceToman,
      currency: 'TOMAN',
      isFallback: false,
      provider: 'TIPAX',
      message: 'محاسبه آنلاین قیمت از سیستم تیپاکس',
      details: {
        tipaxPriceRial: priceRial,
        destinationCityId,
        destinationCityName: params.destinationCityName,
        totalWeightKg,
      },
    };
  } catch (err: any) {
    console.error('[Tipax Pricing Exception]', err?.message || err);
    return returnFallbackQuote(params.items, 'Tipax request failed');
  }
}

/**
 * Generates fallback shipping quote using Sheikh Shops centralized shipping resolver
 */
function returnFallbackQuote(
  items?: Array<{
    product: {
      shippingCost?: number | null;
      allowFreeShipping?: boolean | null;
    } | null;
    quantity: number;
  }>,
  reason?: string
): TipaxQuoteResult {
  const fallbackCost = items && items.length > 0 ? calculateCartShipping(items) : 200000;

  return {
    shippingCostToman: fallbackCost,
    currency: 'TOMAN',
    isFallback: true,
    provider: 'DEFAULT_FALLBACK',
    message: reason ? `تعرفه عمومی ارسال (${reason})` : 'تعرفه عمومی ارسال',
  };
}
