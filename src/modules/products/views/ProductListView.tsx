'use client';

import React from 'react';
import ProductList from '../components/ProductList';
import type { ProductsWithImages, Unit } from '@/types';

interface ProductListViewProps {
  products?: ProductsWithImages[];
  units?: Unit[];
  title?: string;
  subtitle?: string;
}

function ProductListView({
  products: initialProducts,
  units: initialUnits,
  title,
  subtitle,
}: ProductListViewProps) {
  return (
    <ProductList
      products={initialProducts || []}
      units={initialUnits}
      title={title}
      subtitle={subtitle}
    />
  );
}

export default ProductListView;
