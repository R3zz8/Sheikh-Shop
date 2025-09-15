import customMetadataGenerator from '@/lib/metadata';
import JsonLd from '@/components/seo/JsonLd';
import { generateProductSchema, generateProductMetadata } from '@/lib/seo';
import ProductDetail from '@/modules/products/components/ProductDetail';
import { getProductById } from '@/modules/products/services';
import type { ProductsWithImages } from '@/types';
import React from 'react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const data = await params;
  const { id } = data;
  const product = (await getProductById(id)) as ProductsWithImages;
  if (!product) {
    return customMetadataGenerator({
      title: 'not found',
    });
  }

  // Prefer the enhanced SEO metadata generator
  const metadata = generateProductMetadata(product as any);
  return metadata;
}

async function page({ params }: { params: Promise<{ id: string }> }) {
  const data = await params;
  const { id } = data;
  const product = (await getProductById(id)) as ProductsWithImages;

  const jsonLd = generateProductSchema(product as any, { currency: process.env.SHOP_DEFAULT_CURRENCY || 'USD' });

  return (
    <section>
      <JsonLd data={jsonLd as any} />
      <ProductDetail {...product} />
    </section>
  );
}

export default page;
