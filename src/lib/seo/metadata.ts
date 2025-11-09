// lib/seo/metadata.ts
import type { Metadata } from 'next';
import { buildLanguageAlternates, getBaseUrl } from './hreflang';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  structuredData?: any;
}

export function generateSEO({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/og-image.jpg',
  ogType = 'website',
  noIndex = false,
  structuredData,
}: SEOProps): Metadata {
  const baseUrl = getBaseUrl();
  const canonicalPath = canonical || '/';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const ogImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return {
    title: {
      default: title,
      template: '%s | Sheikh Shop',
    },
    description,
    keywords: [
      'sheikh shop',
      'premium dates',
      'saffron',
      'honey',
      'middle eastern products',
      'luxury food',
      'authentic products',
      ...keywords,
    ],
    authors: [{ name: 'Sheikh Shop Team' }],
    creator: 'Sheikh Shop',
    publisher: 'Sheikh Shop',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: ogType,
      locale: 'en_US',
      url: canonicalUrl,
      title,
      description,
      siteName: 'Sheikh Shop',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@sheikhshops',
      site: '@sheikhshops',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
      yandex: process.env.YANDEX_VERIFICATION_CODE,
      yahoo: process.env.YAHOO_VERIFICATION_CODE,
    },
    other: {
      'msapplication-TileColor': '#f59e0b',
      'theme-color': '#f59e0b',
    },
  };
}

// Product-specific metadata generator
export function generateProductMetadata(product: {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  images?: Array<{ image: string | null; secureUrl?: string | null }>;
  id: string;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
  ogImage?: string | null;
}) {
  // Use custom SEO fields if available, fallback to generated
  const title = product.seoTitle || 
    `${product.name} - Premium ${product.category} | Sheikh Shop`;
  const description = product.seoDescription || 
    product.description || 
    `Buy premium ${product.name} - authentic ${product.category.toLowerCase()} from Sheikh Shop. High quality, authentic products with worldwide shipping.`;
  
  const keywords = product.metaKeywords && product.metaKeywords.length > 0
    ? product.metaKeywords
    : [
        product.name.toLowerCase(),
        product.category.toLowerCase(),
        'premium quality',
        'authentic',
        'sheikh shop',
        'buy online',
        'luxury food',
      ];

  // Use slug for canonical URL, fallback to ID for backward compatibility
  const canonical = product.canonicalUrl || 
    `/products/${product.slug || product.id}`;
  
  // Use custom OG image if available
  const ogImage = product.ogImage || 
    `/api/og/product?id=${product.id}`;

  const metadata = generateSEO({
    title,
    description,
    keywords,
    canonical,
    ogType: 'website',
    ogImage,
  });
  
  // Ensure hreflang is included for product pages
  if (metadata.alternates) {
    metadata.alternates.languages = buildLanguageAlternates(canonical);
  }
  
  return metadata;
}

// Article-specific metadata generator
export function generateArticleMetadata(article: {
  title: string;
  summary: string;
  slug: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
}) {
  const title = `${article.title} | Sheikh Shop Blog`;
  const description = article.summary;
  
  const keywords = [
    ...article.tags,
    'sheikh shop blog',
    'premium products',
    'middle eastern cuisine',
    article.category?.toLowerCase() || '',
  ].filter(Boolean);

  const ogImage = `/api/og/article?slug=${article.slug}`;

  return generateSEO({
    title,
    description,
    keywords,
    canonical: `/article/${article.slug}`,
    ogType: 'article',
    ogImage,
  });
}

// Category-specific metadata generator
export function generateCategoryMetadata(category: string) {
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  const title = `Premium ${categoryName} Collection | Sheikh Shop`;
  const description = `Discover our curated collection of premium ${categoryName.toLowerCase()} products. Authentic, high-quality ${categoryName.toLowerCase()} with worldwide shipping from Sheikh Shop.`;
  
  const keywords = [
    categoryName.toLowerCase(),
    'premium quality',
    'authentic',
    'sheikh shop',
    'buy online',
    'luxury food',
    'middle eastern products',
  ];

  return generateSEO({
    title,
    description,
    keywords,
    canonical: `/categories/${category.toLowerCase()}`,
    ogImage: `/api/og/category?name=${encodeURIComponent(category)}`,
  });
}