'use client';

import React, { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import { getProductsAPI } from '../services';
import type { ProductsWithImages } from '@/types';
import type { Category } from '@prisma/client';

function ProductDashboardView() {
  const [products, setProducts] = useState<ProductsWithImages[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProductsAPI(),
          fetch('/api/categories'),
        ]);

        if (productsResponse?.data) {
          setProducts(productsResponse.data);
        } else {
          setProducts([]);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        } else {
          setCategories([]);
        }
      } catch {
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <ProductTable products={products} categories={categories} />
    </div>
  );
}

export default ProductDashboardView;
