import { prisma } from '@/lib/prisma';

interface InternalLinkSuggestion {
  url: string;
  title: string;
  type: 'article' | 'product' | 'category' | 'page';
  relevanceScore: number;
  reason: string;
}

interface KeywordMatch {
  keyword: string;
  matches: number;
  relevance: number;
}

/**
 * AI-powered internal linking suggestions based on content analysis
 */
export async function suggestInternalLinks(
  articleContent: string,
  articleCategory?: string,
  articleTags?: string[],
  limit: number = 5
): Promise<InternalLinkSuggestion[]> {
  try {
    // Extract keywords from content
    const contentKeywords = extractKeywordsFromContent(articleContent);
    
    // Get potential internal links from database
    const [articles, products, categories] = await Promise.all([
      getRelevantArticles(contentKeywords, articleCategory, articleTags),
      getRelevantProducts(contentKeywords),
      getRelevantCategories(contentKeywords, articleCategory)
    ]);

    // Calculate relevance scores and combine suggestions
    const suggestions: InternalLinkSuggestion[] = [];

    // Add article suggestions
    articles.forEach(article => {
      const relevanceScore = calculateRelevanceScore(
        contentKeywords,
        article.title + ' ' + article.summary,
        article.category || undefined,
        article.tags
      );
      
      if (relevanceScore > 0.3) {
        suggestions.push({
          url: `/article/${article.slug}`,
          title: article.title,
          type: 'article',
          relevanceScore,
          reason: `Related article about ${article.category?.toLowerCase() || 'similar topics'}`
        });
      }
    });

    // Add product suggestions
    products.forEach(product => {
      const relevanceScore = calculateRelevanceScore(
        contentKeywords,
        product.name + ' ' + (product.description || ''),
        product.category.name
      );
      
      if (relevanceScore > 0.4) {
        suggestions.push({
          url: `/products/${product.id}`,
          title: product.name,
          type: 'product',
          relevanceScore,
          reason: `Featured product: ${product.name}`
        });
      }
    });

    // Add category suggestions
    categories.forEach(category => {
      const relevanceScore = calculateRelevanceScore(
        contentKeywords,
        category,
        category
      );
      
      if (relevanceScore > 0.2) {
        suggestions.push({
          url: `/categories/${category.toLowerCase()}`,
          title: `${category} Collection`,
          type: 'category',
          relevanceScore,
          reason: `Browse our ${category.toLowerCase()} collection`
        });
      }
    });

    // Sort by relevance score and return top suggestions
    return suggestions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

  } catch (error) {
    console.error('Error generating internal link suggestions:', error);
    return [];
  }
}

/**
 * Extract keywords from article content using simple NLP techniques
 */
function extractKeywordsFromContent(content: string): string[] {
  // Remove HTML tags
  const textContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
    'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]);

  // Extract words and filter
  const words = textContent
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Return top keywords by frequency
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Get relevant articles from database
 */
async function getRelevantArticles(
  keywords: string[],
  articleCategory?: string,
  articleTags?: string[]
) {
  const whereConditions: any = {
    status: 'PUBLISHED',
  };

  // If category is provided, prioritize articles from same category
  if (articleCategory) {
    whereConditions.category = articleCategory;
  }

  const articles = await prisma.article.findMany({
    where: whereConditions,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      category: true,
      tags: true,
      keywords: true,
    },
    take: 20,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return articles;
}

/**
 * Get relevant products from database
 */
async function getRelevantProducts(keywords: string[]) {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      description: true,
      category: {
        select: {
          name: true,
        },
      },
    },
    take: 15,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products;
}

/**
 * Get relevant categories
 */
async function getRelevantCategories(keywords: string[], articleCategory?: string) {
  const categories = await prisma.category.findMany({
    select: {
      name: true,
    },
  });
  const categoryNames = categories.map(c => c.name);
  
  // If article has a category, prioritize it
  if (articleCategory) {
    return [articleCategory, ...categoryNames.filter(c => c !== articleCategory)];
  }
  
  return categoryNames;
}

/**
 * Calculate relevance score between content keywords and target content
 */
function calculateRelevanceScore(
  contentKeywords: string[],
  targetContent: string,
  targetCategory?: string,
  targetTags?: string[]
): number {
  const targetText = (targetContent + ' ' + (targetCategory || '') + ' ' + (targetTags?.join(' ') || ''))
    .toLowerCase();
  
  let score = 0;
  let matches = 0;

  // Check keyword matches
  contentKeywords.forEach(keyword => {
    if (targetText.includes(keyword)) {
      score += 1;
      matches += 1;
    }
  });

  // Normalize score based on keyword count
  if (contentKeywords.length > 0) {
    score = score / contentKeywords.length;
  }

  // Boost score for exact category match
  if (targetCategory) {
    const categoryKeywords = targetCategory.toLowerCase().split(' ');
    categoryKeywords.forEach(categoryKeyword => {
      if (contentKeywords.includes(categoryKeyword)) {
        score += 0.3;
      }
    });
  }

  // Boost score for tag matches
  if (targetTags && targetTags.length > 0) {
    targetTags.forEach(tag => {
      if (contentKeywords.includes(tag.toLowerCase())) {
        score += 0.2;
      }
    });
  }

  return Math.min(score, 1); // Cap at 1.0
}

/**
 * Generate smart internal links for article content
 * This function analyzes the content and suggests where to add internal links
 */
export async function generateSmartInternalLinks(
  articleContent: string,
  articleCategory?: string,
  articleTags?: string[]
): Promise<Array<{
  text: string;
  suggestedLink: string;
  position: number;
  reason: string;
}>> {
  const suggestions = await suggestInternalLinks(articleContent, articleCategory, articleTags, 8);
  const smartLinks: Array<{
    text: string;
    suggestedLink: string;
    position: number;
    reason: string;
  }> = [];

  // Find opportunities to add links in the content
  suggestions.forEach(suggestion => {
    const searchTerms = suggestion.title.toLowerCase().split(' ');
    const contentLower = articleContent.toLowerCase();
    
    searchTerms.forEach(term => {
      if (term.length > 3 && contentLower.includes(term)) {
        const index = contentLower.indexOf(term);
        if (index !== -1) {
          smartLinks.push({
            text: term,
            suggestedLink: suggestion.url,
            position: index,
            reason: suggestion.reason
          });
        }
      }
    });
  });

  // Remove duplicates and sort by position
  const uniqueLinks = smartLinks
    .filter((link, index, self) => 
      index === self.findIndex(l => l.text === link.text && l.position === link.position)
    )
    .sort((a, b) => a.position - b.position)
    .slice(0, 5); // Limit to 5 suggestions

  return uniqueLinks;
}

/**
 * Validate internal link URLs
 */
export function validateInternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'sheikhshops.com' || 
           urlObj.hostname === 'localhost' ||
           url.startsWith('/');
  } catch {
    return false;
  }
}

/**
 * Get link preview information
 */
export async function getLinkPreview(url: string): Promise<{
  title: string;
  description: string;
  image?: string;
} | null> {
  try {
    // For internal links, fetch from database
    if (url.includes('/article/')) {
      const slug = url.split('/article/')[1];
      const article = await prisma.article.findUnique({
        where: { slug },
        select: { title: true, summary: true, imageUrl: true }
      });
      
      if (article) {
        return {
          title: article.title,
          description: article.summary,
          image: article.imageUrl || undefined
        };
      }
    }

    if (url.includes('/products/')) {
      const productId = url.split('/products/')[1];
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { 
          images: { take: 1 } 
        }
      });
      
      if (product) {
        return {
          title: product.name,
          description: product.description || '',
          image: product.images[0]?.secureUrl || undefined
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting link preview:', error);
    return null;
  }
}

