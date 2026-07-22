'use client';

import React from 'react';
import ProductList from '../components/ProductList';
import type { ProductsWithImages, Unit } from '@/types';

interface ProductListViewProps {
  products?: ProductsWithImages[];
  units?: Unit[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'digital';
}

function ProductListView({
  products: initialProducts,
  units: initialUnits,
  title,
  subtitle,
  variant = 'default',
}: ProductListViewProps) {
  return (
    <ProductList
      products={initialProducts || []}
      units={initialUnits}
      title={title}
      subtitle={subtitle}
      variant={variant}
    />
  );
}

export default ProductListView;
