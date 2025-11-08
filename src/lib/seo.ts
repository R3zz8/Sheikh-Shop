import type { Metadata } from 'next';
import type { Product, Article, User } from '@prisma/client';

// Environment-based URL configuration
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  return 'http://localhost:3000';
};

// Dynamic canonical URL generator
export const getCanonicalUrl = (path: string = '') => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// JSON-LD Schema generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sheikh Shop',
  url: getBaseUrl(),
  logo: {
    '@type': 'ImageObject',
    url: `${getBaseUrl()}/logo.png`,
    width: 200,
    height: 60,
  },
  description: 'Premium luxury e-commerce platform specializing in dates, saffron, honey, and Arabian heritage products.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@sheikhshop.com',
  },
  sameAs: [
    'https://www.facebook.com/sheikhshop',
    'https://www.instagram.com/sheikhshop',
    'https://www.twitter.com/sheikhshop',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'AE',
    addressLocality: 'Dubai',
  },
});

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sheikh Shop',
  url: getBaseUrl(),
  description: 'Premium luxury e-commerce platform specializing in dates, saffron, honey, and Arabian heritage products.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${getBaseUrl()}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Sheikh Shop',
    logo: {
      '@type': 'ImageObject',
      url: `${getBaseUrl()}/logo.png`,
    },
  },
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const getDefaultCurrency = () => {
  return process.env.SHOP_DEFAULT_CURRENCY || 'USD';
};

export const generateProductSchema = (
  product: Product & { images?: any[]; slug?: string | null },
  opts?: { currency?: string; availabilityOverride?: 'InStock' | 'OutOfStock' }
) => {
  // Use slug for SEO-friendly URL, fallback to ID for backward compatibility
  const productUrl = `${getBaseUrl()}/products/${product.slug || product.id}`;
  
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.category.toLowerCase()} from Sheikh Shop`,
    image: product.images?.map(img => img.image) || [`${getBaseUrl()}/noImage.jpg`],
    brand: {
      '@type': 'Brand',
      name: 'Sheikh Shop',
    },
    category: product.category,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.basePrice,
      priceCurrency: opts?.currency || getDefaultCurrency(),
      availability: (opts?.availabilityOverride || (product.status === 'ACTIVE' ? 'InStock' : 'OutOfStock'))
        === 'InStock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Sheikh Shop',
      },
      url: productUrl,
    },
    url: productUrl,
  };
  
  // Note: aggregateRating removed - only include if you have real review data
  // Example of how to add it when you have real reviews:
  // if (product.reviews && product.reviews.length > 0) {
  //   schema.aggregateRating = {
  //     '@type': 'AggregateRating',
  //     ratingValue: calculateAverageRating(product.reviews).toString(),
  //     reviewCount: product.reviews.length.toString(),
  //     bestRating: '5',
  //     worstRating: '1',
  //   };
  // }
  
  return schema;
};

export const generateArticleSchema = (article: Article & { author?: User }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.summary,
  image: article.imageUrl ? [article.imageUrl] : [`${getBaseUrl()}/og-image.jpg`],
  author: {
    '@type': 'Person',
    name: article.author?.username || article.author?.email || 'Sheikh Shop Team',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Sheikh Shop',
    logo: {
      '@type': 'ImageObject',
      url: `${getBaseUrl()}/logo.png`,
    },
  },
  datePublished: article.createdAt.toISOString(),
  dateModified: article.updatedAt.toISOString(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${getBaseUrl()}/article/${article.slug}`,
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// Enhanced metadata generator
export const generateMetadata = ({
  title,
  description,
  keywords = [],
  images = [],
  canonicalPath = '',
  noIndex = false,
  type = 'website',
}: {
  title: string;
  description: string;
  keywords?: string[];
  images?: string[];
  canonicalPath?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'product';
}): Metadata => {
  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      // Map 'product' type to 'website' since Next.js OpenGraph doesn't support 'product'
      type: type === 'product' ? 'website' : type,
      title,
      description,
      url: canonicalUrl,
      siteName: 'Sheikh Shop',
      images: images.length > 0 ? images.map(img => ({
        url: img.startsWith('http') ? img : `${baseUrl}${img}`,
        width: 1200,
        height: 630,
        alt: title,
      })) : [{
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? images.map(img => 
        img.startsWith('http') ? img : `${baseUrl}${img}`
      ) : [`${baseUrl}/og-image.jpg`],
    },
  };
};

// Product-specific metadata
export const generateProductMetadata = (
  product: Product & { 
    images?: any[];
    slug?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    metaKeywords?: string[];
    canonicalUrl?: string | null;
    ogImage?: string | null;
  }
) => {
  // Use custom SEO fields if available, fallback to generated
  const title = product.seoTitle || 
    `${product.name} - Premium ${product.category} | Sheikh Shop`;
  
  const description = product.seoDescription || 
    product.description || 
    `Discover premium ${product.name} at Sheikh Shop. Exceptional quality ${product.category.toLowerCase()} with authentic Arabian heritage.`;

  const keywords = product.metaKeywords && product.metaKeywords.length > 0
    ? product.metaKeywords
    : [
        product.name,
        product.category.toLowerCase(),
        'premium',
        'luxury',
        'sheikh shop',
        'arabian',
        'heritage',
        'quality',
      ];

  // Use slug for canonical URL, fallback to ID for backward compatibility
  const canonical = product.canonicalUrl || 
    `/products/${product.slug || product.id}`;
  
  // Use custom OG image if available, otherwise use product images
  const images = product.ogImage 
    ? [product.ogImage]
    : product.images?.map(img => img.image) || [];

  return generateMetadata({
    title,
    description,
    keywords,
    images,
    canonicalPath: canonical,
    type: 'product',
  });
};

// Category-specific metadata
export const generateCategoryMetadata = (category: string) => {
  const categoryNames = {
    HONEY: 'Premium Honey',
    SAFFRON: 'Authentic Saffron',
    DATES: 'Premium Dates',
    OTHERS: 'Luxury Products',
  };

  const categoryDescriptions = {
    HONEY: 'Discover our collection of premium honey varieties, sourced from the finest regions and crafted with traditional methods.',
    SAFFRON: 'Experience the world\'s finest saffron, carefully selected for its exceptional quality and authentic flavor.',
    DATES: 'Indulge in our premium selection of dates, featuring the finest varieties from renowned growing regions.',
    OTHERS: 'Explore our curated collection of luxury products, each selected for exceptional quality and craftsmanship.',
  };

  return generateMetadata({
    title: `${categoryNames[category as keyof typeof categoryNames]} Collection | Sheikh Shop`,
    description: categoryDescriptions[category as keyof typeof categoryDescriptions],
    keywords: [
      category.toLowerCase(),
      'premium',
      'luxury',
      'sheikh shop',
      'arabian',
      'heritage',
      'quality',
      'authentic',
    ],
    canonicalPath: `/categories/${category.toLowerCase()}`,
  });
};

// Article-specific metadata
export const generateArticleMetadata = (article: Article & { author?: User }) => {
  return generateMetadata({
    title: `${article.title} | Sheikh Shop Blog`,
    description: article.summary,
    keywords: [
      'sheikh shop',
      'blog',
      'arabian heritage',
      'luxury products',
      'premium quality',
      ...(article.tags || []),
    ],
    images: article.imageUrl ? [article.imageUrl] : [],
    canonicalPath: `/article/${article.slug}`,
    type: 'article',
  });
};





