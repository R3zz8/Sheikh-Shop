import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductOfferJsonLd } from '@/components/seo/JsonLd';
import FAQSchema from '@/components/seo/FAQSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import ProductStructuredData from '@/components/seo/ProductStructuredData';
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
        include: { images: true, category: true },
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
      category: product.category?.name || 'Uncategorized',
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
                units: true, // Include ProductUnits
                discounts: true,
                category: true,
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

        // Serialize for Client Components (convert Decimal/Date to primitives)
        return serializeProduct(product);
    } catch (error) {
        console.error('Exception in getProduct for ID:', id, error);
        return null;
    }
}

async function getAllProducts() {
    try {
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            include: { 
                images: true,
                baseUnit: true,
                units: true,
                discounts: true,
                category: true,
            },
            take: 50, // Limit for performance
        });

        return products.map(serializeProduct);
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Helper: convert Prisma Decimal/Date fields to JSON-serializable primitives
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
        baseUnit: product.baseUnit ? { ...product.baseUnit } : null,
        units: Array.isArray(product.units)
            ? product.units.map((u: any) => ({
                ...u,
                // Prisma.Decimal to number
                price: typeof u.price === 'object' && u.price !== null && 'toNumber' in u.price
                    ? (u.price as any).toNumber()
                    : Number(u.price),
                createdAt: u.createdAt ? u.createdAt.toISOString() : null,
                updatedAt: u.updatedAt ? u.updatedAt.toISOString() : null,
            }))
            : [],
        discounts: Array.isArray(product.discounts)
            ? product.discounts.map((d: any) => ({
                ...d,
                startDate: d.startDate ? d.startDate.toISOString() : null,
                endDate: d.endDate ? d.endDate.toISOString() : null,
                createdAt: d.createdAt ? d.createdAt.toISOString() : null,
                updatedAt: d.updatedAt ? d.updatedAt.toISOString() : null,
            }))
            : [],
    };
}

async function page({ params }: { params: Promise<{ id: string }> }) {
    try {
        const data = await params;
        const { id } = data;

        console.log('Product page: Fetching product with ID:', id);

        const [product, allProducts] = await Promise.all([
            getProduct(id),
            getAllProducts()
        ]);

        console.log('Product page: Product data received:', {
            found: !!product,
            id: product?.id,
            name: product?.name,
            baseUnit: !!product?.baseUnit,
            units: product?.units?.length || 0,
            images: product?.images?.length || 0
        });

        if (!product) {
            console.error('Product page: Product not found for ID:', id);
            notFound();
        }

        // Generate breadcrumbs on server side
        const breadcrumbs = [
            { name: 'Products', url: '/products' },
            { name: product.category?.name, url: `/categories/${product.category?.slug}` },
            { name: product.name, url: `/product/${product.id}` },
        ];

        // Placeholder rating data; integrate real reviews when available
        const rating = product.isBestSeller ? { ratingValue: 4.8, reviewCount: 127 } : undefined;
        const currency = getDefaultCurrency();

        return (
            <>
                <ProductOfferJsonLd product={product} currency={currency} rating={rating} />
                <ProductStructuredData product={product} />
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
                <ProductDetailPage product={product} allProducts={allProducts} />
            </>
        );
    } catch (error) {
        console.error('Exception in page function:', error);
        throw error; // Re-throw to trigger error boundary
    }
}

export default page; 