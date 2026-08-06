'use client';

import React, { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import type { ProductsWithImages } from '@/types';

interface ProductDashboardViewProps {
  initialProducts?: ProductsWithImages[];
}

function ProductDashboardView({ initialProducts }: ProductDashboardViewProps) {
  const [products, setProducts] = useState<ProductsWithImages[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);

  const fetchProducts = async () => {
    if (initialProducts) return;
    try {
      const result = await fetch('/api/product');
      const response = await result.json();

      if (response?.data) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [initialProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070504] text-stone-400 font-vazirmatn flex flex-col items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs">در حال بارگذاری لیست محصولات لوکس...</p>
      </div>
    );
  }

  return (
    <div>
      <ProductTable products={products} />
    </div>
  );
}

export default ProductDashboardView;
