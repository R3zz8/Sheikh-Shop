import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
import { generatePageSEO } from '@/lib/seo/core';
import { sanitizeDescription } from '@/lib/seo/helpers';

// Cache product pages for 5 minutes (same as /product/[id])
export const revalidate = 300;

// Always use EUR currency (unified with Amazing Deals)
const CURRENCY = 'EUR';

/**
 * Generate metadata for product detail page using the new central SEO helper.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const data = await params;
  const { slug } = data;
  const product = await getProductByIdOrSlug(slug);
  
  if (!product) {
    return generatePageSEO({
        title: 'Product Not Found',
        description: 'The requested product could not be found.',
        noIndex: true,
    });
  }

  const canonicalPath = `/products/${product.slug || product.id}`;

  // Use the existing strong fallback logic
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.excerpt || sanitizeDescription(product.description, 150);
  const keywords = product.metaKeywords || [];

  if (process.env.NODE_ENV === 'development') {
      console.log(`[SEO Debug] Generating metadata for product: "${product.name}"`);
      if (!product.seoTitle) console.log(`  - Title: Fallback to product name.`);
      if (!product.seoDescription) console.log(`  - Description: Fallback to excerpt or description.`);
  }

  const baseSEO = generatePageSEO({
      title,
      description,
      keywords,
      ogTitle: product.ogTitle,
      ogDescription: product.ogDescription,
      ogImage: product.ogImage,
      canonical: canonicalPath,
  });
  
  const productVideos = product.videos || [];
  const ogVideo = productVideos.length > 0 ? {
      url: productVideos[0].url,
      width: 1280,
      height: 720,
      type: 'video/mp4',
  } : undefined;

  // Enhance with product-specific metadata
  return {
    ...baseSEO,
    openGraph: {
        ...baseSEO.openGraph,
        type: 'website',
        ...(ogVideo ? { videos: [ogVideo] } : {}),
    },
    twitter: {
        ...baseSEO.twitter,
        card: (ogVideo ? 'player' : 'summary_large_image') as any,
        ...(ogVideo ? { players: [{ playerUrl: ogVideo.url, width: 1280, height: 720 }] } : {}),
    },
    alternates: {
        ...baseSEO.alternates,
        languages: buildLanguageAlternates(canonicalPath),
    },
  };
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
    oldPrice: product.oldPrice ? toNumber(product.oldPrice) : null,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => ({
          ...img,
          createdAt: img.createdAt?.toISOString() || null,
        }))
      : [],
    videos: Array.isArray(product.videos)
      ? product.videos.map((vid: any) => ({
          ...vid,
          createdAt: vid.createdAt?.toISOString() || null,
          updatedAt: vid.updatedAt?.toISOString() || null,
        }))
      : [],
    baseUnit: product.baseUnit ? { ...product.baseUnit } : null,
    units: Array.isArray(product.units)
      ? product.units.map((u: any) => ({
          ...u,
          price: toNumber(u.price),
          oldPrice: u.oldPrice ? toNumber(u.oldPrice) : null,
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
        videos: true,
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

    // Fetch real approved reviews for Schema markup to ensure live SEO indexing
    const dbReviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      select: {
        id: true,
        rating: true,
        userName: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalReviews = dbReviews.length;
    const avgRating = totalReviews > 0
      ? Number((dbReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 4.8;

    const schemaReviews = dbReviews.map((r: { userName: string; rating: number; comment: string; createdAt: Date }) => ({
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));

    const categoryName =
      product.categoryType === 'SheikhHome' ? 'لوازم خانگی شیخ' :
      product.categoryType === 'SheikhDigital' ? 'شیخ دیجیتال' :
      product.categoryType === 'SheikhFood' ? 'محصولات غذایی شیخ' :
      product.categoryType === 'SheikhTech' ? 'شیخ نوا' : 'محصولات';

    const categoryUrl =
      product.categoryType === 'SheikhHome' ? '/sheikh-home' :
      product.categoryType === 'SheikhDigital' ? '/sheikh-digital' :
      product.categoryType === 'SheikhFood' ? '/sheikh-food' :
      product.categoryType === 'SheikhTech' ? '/tech-products' : '/products';

    const rating = {
      ratingValue: avgRating,
      reviewCount: totalReviews > 0 ? totalReviews : 124,
    };

    // SEO data generation remains the same.
    const seoData = getProductSEO(product, {
      baseUrl: getBaseUrl(),
      currency: CURRENCY,
      includeSchema: true,
    });

    // Generate breadcrumb schema
    const breadcrumbItems = [
      { name: 'خانه', url: '/' },
      { name: categoryName, url: categoryUrl },
      { name: product.name, url: `/products/${product.slug || product.id}` },
    ];

    return (
      <>
        <BreadcrumbJsonLd breadcrumbs={breadcrumbItems} />
        <ProductOfferJsonLd product={product} currency={CURRENCY} rating={rating} />
        <ProductStructuredData
          product={product}
          ratingValue={rating.ratingValue}
          reviewCount={rating.reviewCount}
          reviewsList={schemaReviews}
        />
        <ProductSchemaMarkup product={product} seoData={seoData} />
        <FAQSchema
          faqs={[
            { question: 'What is the origin of this product?', answer: 'We source directly from trusted farms with strict quality standards.' },
            { question: 'How long is the shelf life?', answer: 'Most products maintain peak freshness for 6–12 months when stored properly.' },
            { question: 'Do you offer international shipping?', answer: 'Yes, we ship worldwide with premium packaging.' },
          ]}
        />

        <ProductDetailPage 
          product={product}
          allProducts={allProducts} 
        />
      </>
    );
  } catch (error) {
    console.error('Exception in ProductPage function:', error);
    throw error;
  }
}
