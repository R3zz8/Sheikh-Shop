/**
 * Centralized Tipax V3 Client Abstraction
 * Unified server-side entry point for Tipax authentication, pricing, metadata, order creation, and tracking.
 */

import {
  fetchTipaxToken,
  getValidTipaxToken,
  clearTipaxTokenCache,
  getTipaxCredentials,
} from './auth';
import { resolveTipaxCityId, normalizePersianText, DEFAULT_TIPAX_ORIGIN_CITY_ID } from './cities';
import { getTipaxShippingQuoteServer, DEFAULT_PACKAGE_SPEC } from './pricing';
import {
  getTipaxCities,
  getTipaxPackingPrices,
  getTipaxPackContentRates,
  getTipaxParcelTypes,
  getTipaxPaymentTypes,
  getTipaxParcelBooks,
} from './metadata';
import { createTipaxOrderServer } from './orders';
import { getTipaxTrackingServer, mapTipaxStatusToPersian } from './tracking';
import type {
  TipaxQuoteResult,
  TipaxPackageSpec,
} from './types';

export type * from './types';
export * from './auth';
export * from './cities';
export * from './pricing';
export * from './metadata';
export * from './orders';
export * from './tracking';

/**
 * Main Tipax V3 Unified Client Object
 */
export const TipaxClient = {
  // Auth
  authenticate: fetchTipaxToken,
  getValidToken: getValidTipaxToken,
  clearTokenCache: clearTipaxTokenCache,
  getCredentials: getTipaxCredentials,

  // Cities & Location Mapping
  getCities: getTipaxCities,
  resolveCityId: resolveTipaxCityId,
  normalizeText: normalizePersianText,
  defaultOriginCityId: DEFAULT_TIPAX_ORIGIN_CITY_ID,

  // Metadata & Reference Data
  getPackingPrices: getTipaxPackingPrices,
  getPackContentRates: getTipaxPackContentRates,
  getParcelTypes: getTipaxParcelTypes,
  getPaymentTypes: getTipaxPaymentTypes,
  getParcelBooks: getTipaxParcelBooks,

  // Pricing
  getPricingMin: getTipaxShippingQuoteServer,
  getPricing: getTipaxShippingQuoteServer,
  defaultPackageSpec: DEFAULT_PACKAGE_SPEC,

  // Order Creation
  createOrder: createTipaxOrderServer,

  // Tracking
  tracking: getTipaxTrackingServer,
  mapStatusToPersian: mapTipaxStatusToPersian,
};

/**
 * Public server helper for retrieving Tipax shipping quote
 */
export async function getTipaxShippingQuote(options: {
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
  return TipaxClient.getPricingMin(options);
}
