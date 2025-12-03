/**
 * @fileoverview Core SEO metadata generation utilities.
 * This file provides a centralized, consistent way to generate SEO metadata
 * across the application, ensuring that database-driven SEO fields are
 * prioritized, fallbacks are logical, and brand names are not duplicated.
 */

import type { Metadata } from 'next';
import { getBaseUrl } from './hreflang';

const BRAND_NAME = 'Sheikh Shop';
const TITLE_SEPARATOR = '|';
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Sanitizes a string by removing HTML tags.
 * @param text The input string to sanitize.
 * @returns The sanitized string.
 */
function sanitize(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/<[^>]+>/g, '').replace(/\s\s+/g, ' ').trim();
}

/**
 * Truncates a string to a specified length without cutting words.
 * @param text The string to truncate.
 * @param maxLength The maximum length of the string.
 * @returns The truncated string.
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substr(0, text.lastIndexOf(' ', maxLength));
  return truncated.length > 0 ? truncated : text.substr(0, maxLength);
}

/**
 * Resolves the final page title based on a priority list.
 * It ensures the title is within SEO limits and appends the brand name
 * only if it doesn't already exist and there's space.
 * @param pageTitle The primary title for the page.
 * @param brandName The brand name to append.
 * @returns The final, optimized page title.
 */
function resolveTitle(pageTitle: string, brandName: string = BRAND_NAME): string {
  const cleanTitle = sanitize(pageTitle);
  const truncatedTitle = truncate(cleanTitle, MAX_TITLE_LENGTH);

  if (truncatedTitle.toLowerCase().includes(brandName.toLowerCase())) {
    return truncatedTitle;
  }

  const titleWithBrand = `${truncatedTitle} ${TITLE_SEPARATOR} ${brandName}`;
  if (titleWithBrand.length > MAX_TITLE_LENGTH) {
    return truncatedTitle;
  }

  return titleWithBrand;
}

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string[] | string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

/**
 * Generates a complete Next.js Metadata object with consistent fallbacks and logic.
 * @param props - The SEO properties for the page.
 * @returns A Next.js Metadata object.
 */
export function generatePageSEO({
  title: pageTitle = BRAND_NAME,
  description: pageDescription = '',
  keywords = [],
  ogTitle: customOgTitle,
  ogDescription: customOgDescription,
  ogImage: customOgImage,
  canonical: canonicalPath,
  noIndex = false,
}: PageSEOProps): Metadata {
  // --- Development Logging ---
  if (process.env.NODE_ENV === 'development') {
    if (!pageTitle) console.warn('[SEO] Warning: Page title is missing.');
    if (!pageDescription) console.warn('[SEO] Warning: Page description is missing.');
  }

  // --- Resolve Core Metadata ---
  const finalTitle = resolveTitle(pageTitle);
  const finalDescription = truncate(sanitize(pageDescription), MAX_DESCRIPTION_LENGTH);
  const baseUrl = getBaseUrl();
  const canonicalUrl = canonicalPath ? `${baseUrl}${canonicalPath}` : baseUrl;

  // --- Resolve OpenGraph Metadata ---
  const ogTitle = customOgTitle ? sanitize(customOgTitle) : finalTitle;
  const ogDescription = customOgDescription ? sanitize(customOgDescription) : finalDescription;
  const defaultOgImage = `${baseUrl}/og-image.jpg`;
  const ogImage = customOgImage
    ? customOgImage.startsWith('http')
      ? customOgImage
      : `${baseUrl}${customOgImage}`
    : defaultOgImage;

  // --- Resolve Keywords ---
  const finalKeywords = Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim());
  const baseKeywords = ['sheikh shop', 'premium dates', 'saffron', 'honey'];
  const mergedKeywords = [...new Set([...baseKeywords, ...finalKeywords])];


  return {
    title: finalTitle,
    description: finalDescription,
    keywords: mergedKeywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title: ogTitle,
      description: ogDescription,
      siteName: BRAND_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
      creator: '@sheikhshops',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
    },
  };
}
