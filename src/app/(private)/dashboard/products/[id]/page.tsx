import ProductDetailClient from './_components/ProductDetailClient';
import { getProductById } from '@/modules/products/services';
import React from 'react';

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const data = await params;
  const { id } = data;
  const product = await getProductById(id);
  return <ProductDetailClient product={product} />;
};

export default Page;
