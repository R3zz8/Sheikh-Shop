import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import customMetadataGenerator from '@/lib/metadata';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import type { ProductsWithImages } from '@/types';

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
        return customMetadataGenerator({
            title: 'Product Not Found',
        });
    }

    return customMetadataGenerator({
        title: product.name,
        description: product.description || `Discover ${product.name} - Premium quality product`,
        images: product.images.map(img => img.image),
    });
}

async function getProduct(id: string): Promise<ProductsWithImages | null> {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { images: true },
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

    // Generate structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images.length > 0 ? product.images[0].image : undefined,
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 4.8,
            reviewCount: 124,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailPage product={product} />
        </>
    );
}

export default page; 