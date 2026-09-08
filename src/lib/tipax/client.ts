/**
 * Tipax Shipping Integration Client
 * Main entry point for Tipax shipping quotes and authentication operations.
 */

export type * from './types';
export * from './auth';
export * from './cities';
export * from './pricing';

import { getTipaxShippingQuoteServer } from './pricing';
import type { TipaxQuoteResult, TipaxPackageSpec } from './types';

/**
 * Public server interface for retrieving Tipax shipping quote
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
  return getTipaxShippingQuoteServer(options);
}
