import React from 'react';
import { getBestSellers } from '@/lib/services/getBestSellers';
import BestSellersCircularShowcaseClient from './BestSellersCircularShowcaseClient';

export default async function BestSellersCircularShowcase() {
  const products = await getBestSellers(15);

  if (!products || products.length === 0) {
    return null;
  }

  return <BestSellersCircularShowcaseClient products={products} />;
}
