'use client';

import React, { Suspense } from 'react';
import ProductList from '../components/ProductList';
import { ProductListSkeleton } from '@/components/ui';
import type { ProductsWithImages, Unit } from '@/types';

interface ProductListViewProps {
  products?: ProductsWithImages[];
  units?: Unit[];
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'digital' | 'home' | 'food' | 'nava';
}

function ProductListView({
  products: initialProducts,
  units: initialUnits,
  title,
  subtitle,
  variant = 'default',
}: ProductListViewProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950/95 py-8" dir="rtl">
        <div className="container mx-auto px-4">
          <ProductListSkeleton count={12} />
        </div>
      </div>
    }>
      <ProductList
        products={initialProducts || []}
        units={initialUnits}
        title={title}
        subtitle={subtitle}
        variant={variant}
      />
    </Suspense>
  );
}

export default ProductListView;
