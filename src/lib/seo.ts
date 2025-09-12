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
  product: Product & { images?: any[] },
  opts?: { currency?: string; availabilityOverride?: 'InStock' | 'OutOfStock' }
) => ({
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
    url: `${getBaseUrl()}/products/${product.id}`,
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
});

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
      type,
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
export const generateProductMetadata = (product: Product & { images?: any[] }) => {
  const keywords = [
    product.name,
    product.category.toLowerCase(),
    'premium',
    'luxury',
    'sheikh shop',
    'arabian',
    'heritage',
    'quality',
  ];

  return generateMetadata({
    title: `${product.name} - Premium ${product.category} | Sheikh Shop`,
    description: product.description || `Discover premium ${product.name} at Sheikh Shop. Exceptional quality ${product.category.toLowerCase()} with authentic Arabian heritage.`,
    keywords,
    images: product.images?.map(img => img.image) || [],
    canonicalPath: `/products/${product.id}`,
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





