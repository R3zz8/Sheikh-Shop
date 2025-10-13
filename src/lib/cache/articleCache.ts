import { getRedis } from '@/lib/redis';
import type { ArticleWithAuthor } from '@/types';

// Cache configuration for articles
export const ARTICLE_CACHE_CONFIG = {
  // Popular articles (high traffic) - 1 hour
  POPULAR: {
    ttl: 3600,
    staleWhileRevalidate: 7200,
    tags: ['articles', 'popular'],
  },
  
  // Recent articles (medium traffic) - 30 minutes
  RECENT: {
    ttl: 1800,
    staleWhileRevalidate: 3600,
    tags: ['articles', 'recent'],
  },
  
  // Draft articles (low traffic, high security) - 5 minutes
  DRAFTS: {
    ttl: 300,
    tags: ['articles', 'drafts'],
  },
  
  // AI-generated content - 30 minutes
  AI_CONTENT: {
    ttl: 1800,
    tags: ['ai', 'content'],
  },
  
  // Article views and analytics - 1 hour
  ANALYTICS: {
    ttl: 3600,
    tags: ['articles', 'analytics'],
  },
} as const;

export class ArticleCacheService {
  private static instance: ArticleCacheService;
  
  public static getInstance(): ArticleCacheService {
    if (!ArticleCacheService.instance) {
      ArticleCacheService.instance = new ArticleCacheService();
    }
    return ArticleCacheService.instance;
  }
  
  /**
   * Get article from cache
   */
  async getArticle(slug: string): Promise<ArticleWithAuthor | null> {
    try {
      const redis = await getRedis();
      const cacheKey = `article:${slug}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting article from cache:', error);
      return null;
    }
  }
  
  /**
   * Cache article with appropriate TTL based on popularity
   */
  async setArticle(article: ArticleWithAuthor): Promise<void> {
    try {
      const redis = await getRedis();
      const cacheKey = `article:${article.slug}`;
      
      // Determine cache TTL based on article popularity
      const ttl = this.getArticleTTL(article);
      
      await redis.set(cacheKey, JSON.stringify(article), { ex: ttl });
      
      // Also cache by ID for quick lookups
      await redis.set(`article:id:${article.id}`, JSON.stringify(article), { ex: ttl });
    } catch (error) {
      console.error('Error caching article:', error);
    }
  }
  
  /**
   * Get popular articles from cache
   */
  async getPopularArticles(limit: number = 10): Promise<ArticleWithAuthor[]> {
    try {
      const redis = await getRedis();
      const cacheKey = `articles:popular:${limit}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting popular articles from cache:', error);
      return [];
    }
  }
  
  /**
   * Cache popular articles
   */
  async setPopularArticles(articles: ArticleWithAuthor[], limit: number = 10): Promise<void> {
    try {
      const redis = await getRedis();
      const cacheKey = `articles:popular:${limit}`;
      
      await redis.set(cacheKey, JSON.stringify(articles), { ex: ARTICLE_CACHE_CONFIG.POPULAR.ttl });
    } catch (error) {
      console.error('Error caching popular articles:', error);
    }
  }
  
  /**
   * Get recent articles from cache
   */
  async getRecentArticles(limit: number = 10): Promise<ArticleWithAuthor[]> {
    try {
      const redis = await getRedis();
      const cacheKey = `articles:recent:${limit}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting recent articles from cache:', error);
      return [];
    }
  }
  
  /**
   * Cache recent articles
   */
  async setRecentArticles(articles: ArticleWithAuthor[], limit: number = 10): Promise<void> {
    try {
      const redis = await getRedis();
      const cacheKey = `articles:recent:${limit}`;
      
      await redis.set(cacheKey, JSON.stringify(articles), { ex: ARTICLE_CACHE_CONFIG.RECENT.ttl });
    } catch (error) {
      console.error('Error caching recent articles:', error);
    }
  }
  
  /**
   * Get article views from cache
   */
  async getArticleViews(articleId: string): Promise<number | null> {
    try {
      const redis = await getRedis();
      const cacheKey = `article:views:${articleId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return parseInt(cached, 10);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting article views from cache:', error);
      return null;
    }
  }
  
  /**
   * Cache article views
   */
  async setArticleViews(articleId: string, views: number): Promise<void> {
    try {
      const redis = await getRedis();
      const cacheKey = `article:views:${articleId}`;
      
      await redis.set(cacheKey, views.toString(), { ex: ARTICLE_CACHE_CONFIG.ANALYTICS.ttl });
    } catch (error) {
      console.error('Error caching article views:', error);
    }
  }
  
  /**
   * Invalidate article cache
   */
  async invalidateArticle(slug: string): Promise<void> {
    try {
      const redis = await getRedis();
      const articleKey = `article:${slug}`;
      const article = await redis.get(articleKey);
      
      // Delete article cache
      await redis.del(articleKey);
      
      // If we have the article data, also delete by ID
      if (article) {
        const articleData = JSON.parse(article);
        await redis.del(`article:id:${articleData.id}`);
      }
      
      // Invalidate related caches
      await this.invalidateRelatedCaches();
    } catch (error) {
      console.error('Error invalidating article cache:', error);
    }
  }
  
  /**
   * Invalidate related article caches (popular, recent, etc.)
   */
  async invalidateRelatedCaches(): Promise<void> {
    try {
      const redis = await getRedis();
      // Delete common cache keys (simplified approach without keys method)
      const commonKeys = [
        'articles:popular:10',
        'articles:popular:5',
        'articles:recent:10',
        'articles:recent:5'
      ];
      
      for (const key of commonKeys) {
        await redis.del(key);
      }
    } catch (error) {
      console.error('Error invalidating related caches:', error);
    }
  }
  
  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    articleCount: number;
    popularCount: number;
    recentCount: number;
    totalKeys: number;
  }> {
    try {
      // Simplified cache stats without keys method
      // In production, you might want to implement a counter or use a different approach
      return {
        articleCount: 0, // Would need to track this separately
        popularCount: 0,
        recentCount: 0,
        totalKeys: 0,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        articleCount: 0,
        popularCount: 0,
        recentCount: 0,
        totalKeys: 0,
      };
    }
  }
  
  /**
   * Determine cache TTL based on article popularity
   */
  private getArticleTTL(article: ArticleWithAuthor): number {
    // High traffic articles (1000+ views) - 1 hour
    if (article.views >= 1000) {
      return ARTICLE_CACHE_CONFIG.POPULAR.ttl;
    }
    
    // Medium traffic articles (100+ views) - 30 minutes
    if (article.views >= 100) {
      return ARTICLE_CACHE_CONFIG.RECENT.ttl;
    }
    
    // Low traffic articles - 15 minutes
    return 900;
  }
  
  /**
   * Warm up cache with popular articles
   */
  async warmUpCache(articles: ArticleWithAuthor[]): Promise<void> {
    try {
      // Cache individual articles
      await Promise.all(
        articles.map(article => this.setArticle(article))
      );
      
      // Cache popular articles list
      const popularArticles = articles
        .filter(article => article.views >= 100)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      
      if (popularArticles.length > 0) {
        await this.setPopularArticles(popularArticles);
      }
      
      // Cache recent articles list
      const recentArticles = articles
        .filter(article => article.status === 'PUBLISHED')
        .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
        .slice(0, 10);
      
      if (recentArticles.length > 0) {
        await this.setRecentArticles(recentArticles);
      }
    } catch (error) {
      console.error('Error warming up cache:', error);
    }
  }
}

// Export singleton instance
export const articleCache = ArticleCacheService.getInstance();


