import type { Article, User } from '@prisma/client';
import type { ArticleWithAuthor as TypesArticleWithAuthor } from '@/types';

export interface ArticleWithAuthor extends Article {
  author: User;
}

export interface ArticleSchemaOptions {
  baseUrl?: string;
  logoUrl?: string;
  organizationName?: string;
}

/**
 * Generates comprehensive JSON-LD structured data for articles
 * Follows Schema.org Article specification for optimal SEO
 */
export function generateArticleSchema(
  article: TypesArticleWithAuthor,
  options: ArticleSchemaOptions = {}
): Record<string, any> {
  const {
    baseUrl = 'https://sheikhshops.com',
    logoUrl = 'https://sheikhshops.com/logo.png',
    organizationName = 'Sheikh Shop'
  } = options;

  // Format author name
  const formatAuthorName = (author: TypesArticleWithAuthor['author']): string => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    if (author.username) {
      return author.username;
    }
    return author.email?.split('@')[0] || 'Unknown Author';
  };

  const authorName = formatAuthorName(article.author);
  const articleUrl = `${baseUrl}/article/${article.slug}`;
  const publishedDate = article.publishedAt || article.createdAt;

  // Base Article schema
  const articleSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription || article.summary,
    "image": article.imageUrl ? {
      "@type": "ImageObject",
      "url": article.imageUrl,
      "width": 1200,
      "height": 630
    } : undefined,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": `${baseUrl}/author/${article.author.username || article.author.id}`
    },
    "publisher": {
      "@type": "Organization",
      "name": organizationName,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl,
        "width": 200,
        "height": 60
      },
      "url": baseUrl
    },
    "datePublished": publishedDate.toISOString(),
    "dateModified": article.updatedAt.toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "inLanguage": "en-US"
  };

  // Add reading time if available
  if (article.readTime) {
    articleSchema["timeRequired"] = `PT${article.readTime}M`;
  }

  // Add category if available
  if (article.category) {
    articleSchema["articleSection"] = article.category;
  }

  // Add keywords if available
  if (article.keywords && article.keywords.length > 0) {
    articleSchema["keywords"] = article.keywords.join(', ');
  }

  // Add excerpt if available
  if (article.excerpt) {
    articleSchema["alternativeHeadline"] = article.excerpt;
  }

  return articleSchema;
}

/**
 * Generates FAQ schema for articles that contain FAQ content
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): Record<string, any> {
  if (!faqs || faqs.length === 0) {
    return {};
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generates BreadcrumbList schema for article navigation
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
  baseUrl: string = 'https://sheikhshops.com'
): Record<string, any> {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return {};
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${baseUrl}${crumb.url}`
    }))
  };
}

/**
 * Generates WebPage schema for article pages
 */
export function generateWebPageSchema(
  article: TypesArticleWithAuthor,
  options: ArticleSchemaOptions = {}
): Record<string, any> {
  const {
    baseUrl = 'https://sheikhshops.com',
    organizationName = 'Sheikh Shop'
  } = options;

  const articleUrl = `${baseUrl}/article/${article.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": articleUrl,
    "name": article.title,
    "description": article.metaDescription || article.summary,
    "url": articleUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": organizationName,
      "url": baseUrl
    },
    "about": {
      "@type": "Article",
      "@id": articleUrl
    },
    "datePublished": (article.publishedAt || article.createdAt).toISOString(),
    "dateModified": article.updatedAt.toISOString(),
    "inLanguage": "en-US"
  };
}

/**
 * Generates complete structured data for an article page
 * Combines Article, WebPage, and optional FAQ schemas
 */
export function generateCompleteArticleSchema(
  article: TypesArticleWithAuthor,
  options: ArticleSchemaOptions & {
    faqs?: Array<{ question: string; answer: string }>;
    breadcrumbs?: Array<{ name: string; url: string }>;
  } = {}
): Record<string, any>[] {
  const { faqs, breadcrumbs, ...schemaOptions } = options;
  const schemas: Record<string, any>[] = [];

  // Main article schema
  schemas.push(generateArticleSchema(article, schemaOptions));

  // Web page schema
  schemas.push(generateWebPageSchema(article, schemaOptions));

  // FAQ schema if provided
  if (faqs && faqs.length > 0) {
    schemas.push(generateFAQSchema(faqs));
  }

  // Breadcrumb schema if provided
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push(generateBreadcrumbSchema(breadcrumbs, schemaOptions.baseUrl));
  }

  return schemas;
}

/**
 * Extracts FAQ content from article HTML content
 * Looks for common FAQ patterns in the content
 */
export function extractFAQsFromContent(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  
  // Simple regex patterns to find FAQ-like content
  const questionPattern = /<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi;
  const questions = content.match(questionPattern) || [];
  
  questions.forEach((question, index) => {
    // Extract question text (remove HTML tags)
    const questionText = question.replace(/<[^>]*>/g, '').trim();
    
    // Look for content after this heading until the next heading
    const nextQuestionIndex = index < questions.length - 1 ? 
      content.indexOf(questions[index + 1] || '') : content.length;
    
    const answerStart = content.indexOf(question) + question.length;
    const answerContent = content.slice(answerStart, nextQuestionIndex);
    
    // Extract answer text (remove HTML tags and limit length)
    const answerText = answerContent
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
    
    if (answerText.length > 50) { // Only include substantial answers
      faqs.push({
        question: questionText,
        answer: answerText
      });
    }
  });
  
  return faqs;
}

