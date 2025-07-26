'use client';

import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import { getProductsAPI } from '../services';
import { ProductsWithImages } from '@/types';

interface ProductListViewProps {
  products?: ProductsWithImages[];
}

function ProductListView({ products: initialProducts }: ProductListViewProps) {
  const [products, setProducts] = useState<ProductsWithImages[]>(initialProducts || []);

  useEffect(() => {
    if (!initialProducts) {
      getProductsAPI().then(response => setProducts(response.data));
    }
  }, [initialProducts]);

  return (
    <div>
      <ProductList products={products} />
    </div>
  );
}

export default ProductListView;
