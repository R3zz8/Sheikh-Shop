import type { Product, Article, User } from '@prisma/client';
import { getMultiCurrencyPrices } from '../currency';
import type { CurrencyCode } from '../currencyConfig';

// Base URL configuration
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sheikhshops.com';
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sheikh Shop',
  url: getBaseUrl(),
  logo: `${getBaseUrl()}/logo.png`,
  description: 'Premium luxury e-commerce platform specializing in authentic dates, saffron, honey, and Middle Eastern delicacies.',
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'AE',
    addressRegion: 'Dubai',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+971-XX-XXX-XXXX',
    contactType: 'customer service',
    email: 'support@sheikhshops.com',
  },
  sameAs: [
    'https://www.instagram.com/sheikhshops',
    'https://www.facebook.com/sheikhshops',
    'https://twitter.com/sheikhshops',
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${getBaseUrl()}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Website Schema with SearchAction
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Sheikh Shop',
  url: getBaseUrl(),
  description: 'Premium luxury e-commerce platform for authentic Middle Eastern products',
  publisher: {
    '@type': 'Organization',
    name: 'Sheikh Shop',
    logo: `${getBaseUrl()}/logo.png`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${getBaseUrl()}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Product Schema
export function generateProductSchema(product: Product & { images?: any[]; slug?: string | null }) {
  const baseUrl = getBaseUrl();
  // Use slug for SEO-friendly URL, fallback to ID for backward compatibility
  const productUrl = `${baseUrl}/products/${product.slug || product.id}`;
  
  // Get multi-currency prices (assuming basePrice is in EUR)
  const multiCurrencyPrices = getMultiCurrencyPrices(product.basePrice);
  
  // Create multiple offers for different currencies
  const offers = (Object.entries(multiCurrencyPrices) as [CurrencyCode, number][]).map(([currencyCode, price]) => ({
    '@type': 'Offer',
    url: productUrl,
    price: price.toFixed(2),
    priceCurrency: currencyCode,
    availability: product.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: {
      '@type': 'Organization',
      name: 'Sheikh Shop',
    },
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
  
  // Build schema without hardcoded ratings
  // Only include aggregateRating if you have real review data
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.category.toLowerCase()} from Sheikh Shop`,
    image: product.images?.map(img => `${baseUrl}${img.image}`) || [`${baseUrl}/noImage.jpg`],
    url: productUrl,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Sheikh Shop',
    },
    category: product.category,
    offers: offers,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Category',
        value: product.category,
      },
      {
        '@type': 'PropertyValue',
        name: 'Premium Quality',
        value: 'Yes',
      },
    ],
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
}

// Article Schema
export function generateArticleSchema(article: Article & { author?: User }) {
  const baseUrl = getBaseUrl();
  const articleUrl = `${baseUrl}/article/${article.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl ? `${baseUrl}${article.imageUrl}` : `${baseUrl}/og-image.jpg`,
    url: articleUrl,
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: article.author?.firstName && article.author?.lastName 
        ? `${article.author.firstName} ${article.author.lastName}`
        : 'Sheikh Shop Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Sheikh Shop',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    articleSection: article.category || 'General',
    keywords: article.tags.join(', '),
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${getBaseUrl()}${crumb.url}`,
    })),
  };
}

// FAQ Schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
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
  };
}

// Local Business Schema (for contact page)
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Sheikh Shop',
  description: 'Premium luxury e-commerce platform specializing in authentic Middle Eastern products',
  url: getBaseUrl(),
  telephone: '+971-XX-XXX-XXXX',
  email: 'support@sheikhshops.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Business Bay',
    addressLocality: 'Dubai',
    addressRegion: 'Dubai',
    postalCode: '00000',
    addressCountry: 'AE',
  },
  openingHours: 'Mo-Su 09:00-18:00',
  priceRange: '$$$',
  paymentAccepted: 'Cash, Credit Card, PayPal',
  currenciesAccepted: 'IRR',
};
