import React from 'react';
import ProductForm from '../components/ProductFormWithAction';
import type { Product } from '@prisma/client';

function ProductDetailView(props: { product: Product | null }) {
  const { product } = props;
  if (!product) {
    return <div>Product not found.</div>;
  }
  return (
    <div>
      <ProductForm product={product} />
    </div>
  );
}

export default ProductDetailView;
