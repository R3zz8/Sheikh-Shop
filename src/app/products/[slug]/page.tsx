import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { generateProductMetadata as generateProductMetadataNew } from '@/components/seo/ProductSEO';
import { ProductOfferJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import FAQSchema from '@/components/seo/FAQSchema';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import ProductStructuredData from '@/components/seo/ProductStructuredData';
import { ProductSchemaMarkup } from '@/components/seo/ProductSEO';
import { getProductByIdOrSlug } from '@/modules/products/services';
import { getProductSEO } from '@/lib/seo/product-seo';
import type { ProductsWithImages, ProductUnit } from '@/types';
import { formatPrice } from '@/lib/currency';
import { buildLanguageAlternates, getBaseUrl } from '@/lib/seo/hreflang';

// Cache product pages for 5 minutes (same as /product/[id])
export const revalidate = 300;

// Always use EUR currency (unified with Amazing Deals)
const CURRENCY = 'EUR';

/**
 * Generate metadata for product detail page using new SEO generator
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug) as ProductsWithImages & {
    seoTitle?: string | null;
    seoDescription?: string | null;
    h1Override?: string | null;
    excerpt?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    schemaMarkup?: any;
    canonicalUrl?: string | null;
    metaKeywords?: string[];
  };
  
  if (!product) {
    return {
      title: 'Product Not Found | Sheikh Shop',
      description: 'The requested product could not be found.',
    };
  }

  const baseUrl = getBaseUrl();
  const metadata = generateProductMetadataNew(product, {
    baseUrl,
    currency: CURRENCY,
    includeSchema: true,
  });
  
  return metadata;
}

// Helper function to serialize product (same as /product/[id])
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

async function getProduct(identifier: string) {
  try {
    if (!identifier || typeof identifier !== 'string' || identifier.length === 0) {
      console.error('Invalid product identifier:', identifier);
      return null;
    }

    // Use the unified service function
    const product = await getProductByIdOrSlug(identifier);
    
    if (!product) {
      console.error('Product not found in database for identifier:', identifier);
      return null;
    }

    // Fetch full product data with all relations (same as /product/[id])
    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { 
        images: true,
        baseUnit: true,
        units: true,
        discounts: true,
      },
    });

    if (!fullProduct) {
      return null;
    }

    if (!fullProduct.baseUnit) {
      console.error('Product missing baseUnit for identifier:', identifier);
      return null;
    }

    return serializeProduct(fullProduct);
  } catch (error) {
    console.error('Exception in getProduct for identifier:', identifier, error);
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

/**
 * Product detail page using SEO-friendly slug
 * Supports both slug and ID for backward compatibility
 * Unified with /product/[id] implementation for consistent EUR pricing and full product data
 */
export default async function ProductPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;

  try {
    console.log('Product page: Fetching product with identifier:', slug);

    const [product, allProducts] = await Promise.all([
      getProduct(slug),
      getAllProducts()
    ]);

    if (!product) {
      console.error('Product page: Product not found for identifier:', slug);
      notFound();
    }

    const breadcrumbs = [
      { name: 'Products', url: '/products' },
      { name: product.category, url: `/categories/${product.category.toLowerCase()}` },
      { name: product.name, url: `/products/${product.slug || product.id}` },
    ];

    const rating = product.isBestSeller ? { ratingValue: 4.8, reviewCount: 127 } : undefined;

    // Convert Decimal to number before use (same as /product/[id])
    const toNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'object' && 'toNumber' in value) {
        return (value as any).toNumber();
      }
      return Number(value);
    };

    // Calculate final price with discounts (same as /product/[id])
    const getFinalPrice = (price: number) => {
      const discount = product.discounts?.[0];
      if (discount && discount.discountType === 'PERCENTAGE') {
        return price * (1 - discount.value / 100);
      }
      return price;
    };

    // Convert basePrice and unit prices
    const basePriceRaw = toNumber(product.basePrice);
    const basePrice = getFinalPrice(basePriceRaw);

    const unitPrices = product.units?.map((u: ProductUnit) => {
      const price = toNumber(u.price);
      return getFinalPrice(price);
    }) || [];

    const lowestPrice = unitPrices.length > 0 ? Math.min(...unitPrices) : basePrice;

    const displayPrice = formatPrice(basePrice, CURRENCY);
    const lowestPriceFormatted = formatPrice(lowestPrice, CURRENCY);

    // Generate SEO data for schema markup
    const seoData = getProductSEO(product, {
      baseUrl: getBaseUrl(),
      currency: CURRENCY,
      includeSchema: true,
    });

    // Generate breadcrumb schema
    const breadcrumbItems = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: product.category, url: `/categories/${product.category.toLowerCase()}` },
      { name: product.name, url: `/products/${product.slug || product.id}` },
    ];

    return (
      <>
        <BreadcrumbJsonLd breadcrumbs={breadcrumbItems} />
        <ProductOfferJsonLd product={product} currency={CURRENCY} rating={rating} />
        <ProductStructuredData product={product} />
        <ProductSchemaMarkup product={product} seoData={seoData} />
        <FAQSchema
          faqs={[
            { question: 'What is the origin of this product?', answer: 'We source directly from trusted farms with strict quality standards.' },
            { question: 'How long is the shelf life?', answer: 'Most products maintain peak freshness for 6–12 months when stored properly.' },
            { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide with premium packaging.' },
          ]}
        />

        <ProductDetailPage 
          product={{
            ...product,
            basePrice: basePrice,
            displayPrice: displayPrice,
            lowestPrice: lowestPriceFormatted,
            units: product.units?.map((u: ProductUnit) => ({
              ...u,
              price: getFinalPrice(toNumber(u.price))
            })) || []
          }} 
          allProducts={allProducts} 
        />
      </>
    );
  } catch (error) {
    console.error('Exception in ProductPage function:', error);
    throw error;
  }
}

