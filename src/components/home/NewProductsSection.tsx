import React from 'react';
import { getNewProducts } from '@/lib/services/getNewProducts';
import NewProductsSlider from './NewProductsSlider';

export default async function NewProductsSection() {
  const newProducts = await getNewProducts(12);

  if (!newProducts || newProducts.length === 0) {
    return null;
  }

  return <NewProductsSlider products={newProducts} />;
}
