'use client';

import React, { useEffect, useState } from 'react';
import ProductList from '../components/ProductList';
import { getProductsAPI } from '../services';
import { ProductsWithImages } from '@/types';

function ProductListView() {
  const [products, setProducts] = useState<ProductsWithImages[]>([]);

  const getProductData = async () => {
    const response = await getProductsAPI();
    setProducts(response.data); // API returns { data: [...] }
  };

  useEffect(() => {
    getProductData();
  }, []);

  return (
    <div>
      <ProductList products={products} />
    </div>
  );
}

export default ProductListView;
