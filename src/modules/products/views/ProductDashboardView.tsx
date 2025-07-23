'use client';

import React, { useEffect, useState } from 'react';
import ProductTable from '../components/ProductTable';
import { getProductsAPI } from '../services';
import { ProductsWithImages } from '@/types';

function ProductDashboardView() {
  const [products, setProducts] = useState<ProductsWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products for dashboard...');
      const response = await getProductsAPI();
      console.log('Dashboard products response:', response);

      if (response?.data) {
        setProducts(response.data);
      } else {
        console.error('Invalid products response:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
