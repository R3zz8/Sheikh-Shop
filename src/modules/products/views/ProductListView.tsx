'use client';

import React from 'react';
import ProductList from '../components/ProductList';
import type { ProductsWithImages, Unit } from '@/types';

interface ProductListViewProps {
  products?: ProductsWithImages[];
  units?: Unit[];
}

function ProductListView({ products: initialProducts, units: initialUnits }: ProductListViewProps) {
  // Just pass the props directly without state management
  return <ProductList products={initialProducts || []} units={initialUnits} />;
}

export default ProductListView;
