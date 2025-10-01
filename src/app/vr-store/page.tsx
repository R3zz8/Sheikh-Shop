import { prisma } from '@/lib/prisma';
import VRStore from '@/components/vr/VRStore';

export const revalidate = 0;

function serializeProduct(product: any) {
  if (!product) return product;
  return {
    ...product,
    createdAt: product.createdAt ? product.createdAt.toISOString() : null,
    updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
    basePrice: typeof product.basePrice === 'object' && product.basePrice !== null && 'toNumber' in product.basePrice
      ? (product.basePrice as any).toNumber()
      : product.basePrice,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          ...img,
          createdAt: img.createdAt ? img.createdAt.toISOString() : null,
        }))
      : [],
  };
}

export default async function VRStorePage() {
  const products = await prisma.product.findMany({ include: { images: true } });
  const safeProducts = products.map(serializeProduct);

  return (
    <div className="w-full h-[calc(100vh-5rem)]">
      <VRStore products={safeProducts as any} />
    </div>
  );
}




