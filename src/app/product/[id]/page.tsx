import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductOfferJsonLd } from '@/components/seo/JsonLd';
import FAQSchema from '@/components/seo/FAQSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
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
        // Validate ID format
        if (!id || typeof id !== 'string' || id.length === 0) {
            console.error('Invalid product ID:', id);
            return null;
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { 
                images: true,
                baseUnit: true,
                discounts: true,
            },
        });

        if (!product) {
            console.error('Product not found in database for ID:', id);
            return null;
        }

        // Validate required fields
        if (!product.baseUnit) {
            console.error('Product missing baseUnit for ID:', id);
            return null;
        }

        return product;
    } catch (error) {
        console.error('Exception in getProduct for ID:', id, error);
        return null;
    }
}

async function page({ params }: { params: Promise<{ id: string }> }) {
    try {
        const data = await params;
        const { id } = data;

        const product = await getProduct(id);

        if (!product) {
            notFound();
        }

        // Generate breadcrumbs on server side
        const breadcrumbs = [
            { name: 'Products', url: '/products' },
            { name: product.category, url: `/categories/${product.category.toLowerCase()}` },
            { name: product.name, url: `/product/${product.id}` },
        ];

        // Placeholder rating data; integrate real reviews when available
        const rating = product.isBestSeller ? { ratingValue: 4.8, reviewCount: 127 } : undefined;
        const currency = getDefaultCurrency();

        return (
            <>
                <ProductOfferJsonLd product={product} currency={currency} rating={rating} />
                <FAQSchema
                    faqs={[
                        { question: 'What is the origin of this product?', answer: 'We source directly from trusted farms with strict quality standards.' },
                        { question: 'How long is the shelf life?', answer: 'Most products maintain peak freshness for 6–12 months when stored properly.' },
                        { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide with premium packaging.' },
                    ]}
                />
                <div className="container mx-auto px-4 py-6">
                    <Breadcrumbs items={breadcrumbs} className="mb-6" />
                </div>
                <ProductDetailPage product={product} />
            </>
        );
    } catch (error) {
        console.error('Exception in page function:', error);
        throw error; // Re-throw to trigger error boundary
    }
}

export default page; 