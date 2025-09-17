import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductOfferJsonLd } from '@/components/seo/JsonLd';
import Breadcrumbs, { generateProductBreadcrumbs } from '@/components/seo/Breadcrumbs';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import type { ProductsWithImages } from '@/types';
import { getDefaultCurrency } from '@/lib/currency';

// Cache product pages for 5 minutes
export const revalidate = 300;

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const data = await params;
    const { id } = data;

    const product = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
    });

    if (!product) {
        return {
            title: 'Product Not Found | Sheikh Shop',
            description: 'The requested product could not be found.',
        };
    }

    return generateProductMetadata({
      ...product,
      description: product.description || undefined,
    });
}

async function getProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { 
                images: true,
                baseUnit: true,
                discounts: true,
            },
        });

        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

async function page({ params }: { params: Promise<{ id: string }> }) {
    const data = await params;
    const { id } = data;

    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const breadcrumbs = generateProductBreadcrumbs(product);

    // Placeholder rating data; integrate real reviews when available
    const rating = product.isBestSeller ? { ratingValue: 4.8, reviewCount: 127 } : undefined;
    const currency = getDefaultCurrency();

    return (
        <>
            <ProductOfferJsonLd product={product} currency={currency} rating={rating} />
            <div className="container mx-auto px-4 py-6">
                <Breadcrumbs items={breadcrumbs} className="mb-6" />
            </div>
            <ProductDetailPage product={product} />
        </>
    );
}

export default page; 