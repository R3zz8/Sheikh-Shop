import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata } from '@/lib/seo/metadata';
import { ProductOfferJsonLd } from '@/components/seo/JsonLd';
import FAQSchema from '@/components/seo/FAQSchema';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import ProductStructuredData from '@/components/seo/ProductStructuredData';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { formatPrice } from '@/lib/currency';

// Cache product pages for 5 minutes
export const revalidate = 300;

// همیشه یورو
const CURRENCY = 'EUR';

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
        if (!id || typeof id !== 'string' || id.length === 0) {
            console.error('Invalid product ID:', id);
            return null;
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { 
                images: true,
                baseUnit: true,
                units: true,
                discounts: true,
            },
        });

        if (!product) {
            console.error('Product not found in database for ID:', id);
            return null;
        }

        if (!product.baseUnit) {
            console.error('Product missing baseUnit for ID:', id);
            return null;
        }

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
            },
            take: 50,
        });

        return products.map(serializeProduct);
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// تبدیل Decimal به number
function serializeProduct(product: any) {
    if (!product) return product;

    const toNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value;
        if (typeof value === 'object' && 'toNumber' in value) {
            return (value as any).toNumber();
        }
        return Number(value);
    };

    return {
        ...product,
        createdAt: product.createdAt?.toISOString() || null,
        updatedAt: product.updatedAt?.toISOString() || null,
        basePrice: toNumber(product.basePrice),
        images: Array.isArray(product.images)
            ? product.images.map((img: any) => ({
                ...img,
                createdAt: img.createdAt?.toISOString() || null,
            }))
            : [],
        baseUnit: product.baseUnit ? { ...product.baseUnit } : null,
        units: Array.isArray(product.units)
            ? product.units.map((u: any) => ({
                ...u,
                price: toNumber(u.price),
                createdAt: u.createdAt?.toISOString() || null,
                updatedAt: u.updatedAt?.toISOString() || null,
            }))
            : [],
        discounts: Array.isArray(product.discounts)
            ? product.discounts.map((d: any) => ({
                ...d,
                startDate: d.startDate?.toISOString() || null,
                endDate: d.endDate?.toISOString() || null,
                createdAt: d.createdAt?.toISOString() || null,
                updatedAt: d.updatedAt?.toISOString() || null,
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

        if (!product) {
            console.error('Product page: Product not found for ID:', id);
            notFound();
        }

        const breadcrumbs = [
            { name: 'Products', url: '/products' },
            { name: product.category, url: `/categories/${product.category.toLowerCase()}` },
            { name: product.name, url: `/product/${product.id}` },
        ];

        const rating = product.isBestSeller ? { ratingValue: 4.8, reviewCount: 127 } : undefined;

        // تبدیل Decimal به number قبل از استفاده
        const toNumber = (value: any): number => {
            if (value === null || value === undefined) return 0;
            if (typeof value === 'number') return value;
            if (typeof value === 'object' && 'toNumber' in value) {
                return (value as any).toNumber();
            }
            return Number(value);
        };

        // محاسبه قیمت نهایی
        const getFinalPrice = (price: number) => {
            const discount = product.discounts?.[0];
            if (discount && discount.discountType === 'PERCENTAGE') {
                return price * (1 - discount.value / 100);
            }
            return price;
        };

        // تبدیل basePrice و unit prices
        const basePriceRaw = toNumber(product.basePrice);
        const basePrice = getFinalPrice(basePriceRaw);

        const unitPrices = product.units?.map((u: ProductUnit) => {
            const price = toNumber(u.price);
            return getFinalPrice(price);
        }) || [];

        const lowestPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : basePrice;

        const displayPrice = formatPrice(basePrice, CURRENCY);
        const lowestPriceFormatted = formatPrice(lowestPrice, CURRENCY);

        return (
            <>
                <ProductOfferJsonLd product={product} currency={CURRENCY} rating={rating} />
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

                <ProductDetailPage 
                    product={{
                        ...product,
                        basePrice: basePrice,
                        displayPrice: displayPrice,
                        lowestPrice: lowestPriceFormatted,
                        units: product.units?.map((u: ProductUnit) => ({
                            ...u,
                            price: getFinalPrice(toNumber(u.price))  // تبدیل Decimal → number
                        })) || []
                    }} 
                    allProducts={allProducts} 
                />
            </>
        );
    } catch (error) {
        console.error('Exception in page function:', error);
        throw error;
    }
}

export default page;