'use client';

import React, { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import type { ProductsWithImages } from '@/types';

function ProductDashboardView() {
  const [products, setProducts] = useState<ProductsWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
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
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <ProductTable products={products} />
    </div>
  );
}

export default ProductDashboardView;
