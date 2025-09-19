'use client';

import Script from 'next/script';
import { getDefaultCurrency, getMultiCurrencyPrices, type CurrencyCode } from '@/lib/currency';

interface JsonLdProps {
  data: any;
  id?: string;
}

export default function JsonLd({ data, id }: JsonLdProps) {
  return (
    <Script
      id={id || 'json-ld'}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductOfferJsonLd({
  product,
  currency,
  rating,
}: {
  product: { id: string; name: string; description?: string | null; category: string; basePrice: number; status: string; images?: { image: string }[] };
  currency?: CurrencyCode;
  rating?: { ratingValue: number; reviewCount: number };
}) {
  const code = currency || getDefaultCurrency();
  const image = product.images?.[0]?.image || '/og-image.jpg';
  
  // Get multi-currency prices (assuming basePrice is in EUR)
  const multiCurrencyPrices = getMultiCurrencyPrices(product.basePrice);
  
  // Create multiple offers for different currencies
  const offers = Object.entries(multiCurrencyPrices).map(([currencyCode, price]) => ({
    '@type': 'Offer',
    url: `/products/${product.id}`,
    price: price.toFixed(2),
    priceCurrency: currencyCode,
    availability: product.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    seller: { '@type': 'Organization', name: 'Sheikh Shop' },
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }));
  
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.category.toLowerCase()} from Sheikh Shop`,
    image,
    sku: product.id,
    category: product.category,
    brand: { '@type': 'Brand', name: 'Sheikh Shop' },
    offers: offers,
    aggregateRating: rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: rating.ratingValue,
          reviewCount: rating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
  return <JsonLd data={data} id={`product-offer-${product.id}`} />;
}

// Pre-built components for common schemas
export function OrganizationJsonLd() {
  const { organizationSchema } = require('@/lib/seo/schema');
  return <JsonLd data={organizationSchema} id="organization-schema" />;
}

export function WebsiteJsonLd() {
  const { websiteSchema } = require('@/lib/seo/schema');
  return <JsonLd data={websiteSchema} id="website-schema" />;
}

export function ProductJsonLd({ product }: { product: any }) {
  const { generateProductSchema } = require('@/lib/seo/schema');
  return <JsonLd data={generateProductSchema(product)} id="product-schema" />;
}

export function ArticleJsonLd({ article }: { article: any }) {
  const { generateArticleSchema } = require('@/lib/seo/schema');
  return <JsonLd data={generateArticleSchema(article)} id="article-schema" />;
}

export function BreadcrumbJsonLd({ breadcrumbs }: { breadcrumbs: Array<{ name: string; url: string }> }) {
  const { generateBreadcrumbSchema } = require('@/lib/seo/schema');
  return <JsonLd data={generateBreadcrumbSchema(breadcrumbs)} id="breadcrumb-schema" />;
}

export function FAQJsonLd({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const { generateFAQSchema } = require('@/lib/seo/schema');
  return <JsonLd data={generateFAQSchema(faqs)} id="faq-schema" />;
}

