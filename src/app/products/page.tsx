import { prisma } from '@/lib/prisma';
import ProductListView from '@/modules/products/views/ProductListView';
import React from 'react';
import type { ProductsWithImages } from '@/types';

export default async function Products() {
  const data: ProductsWithImages[] = await prisma.product.findMany({ include: { images: true } });
  return (
    <div className="min-h-screen">
      <ProductListView products={data} />
    </div>
  );
}
