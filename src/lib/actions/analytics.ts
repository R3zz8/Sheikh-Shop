'use server';

import { prisma } from '@/lib/prisma';
import { articleCache } from '@/lib/cache/articleCache';
import { getCurrentUserId } from '@/lib/actions/auth/session';

export interface ArticleAnalytics {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  shares: number;
  language: string;
  publishedAt: Date | null;
  engagementScore: number;
  avgReadingTime: number;
  avgScrollDepth: number;
  bounceRate: number;
  category: string | null;
  author: {
    id: string;
    username: string | null;
    email: string;
  };
}

export interface AnalyticsSummary {
  totalArticles: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgEngagementScore: number;
  avgReadingTime: number;
  topPerformingLanguage: string;
  topCategory: string | null;
  recentGrowth: {
    views: number;
    likes: number;
    articles: number;
  };
}

export interface LanguagePerformance {
  language: string;
  articleCount: number;
  totalViews: number;
  avgEngagementScore: number;
  avgReadingTime: number;
}

export interface TimeSeriesData {
  date: string;
  views: number;
  likes: number;
  articles: number;
}

/**
 * Get comprehensive analytics data for the dashboard
 */
export async function getAnalyticsData(): Promise<{
  success: boolean;
  data?: {
    summary: AnalyticsSummary;
    topArticles: ArticleAnalytics[];
    languagePerformance: LanguagePerformance[];
    timeSeries: TimeSeriesData[];
    recentActivity: ArticleAnalytics[];
  };
  error?: string;
}> {
  try {
    // Check user permissions (only ADMIN+ can access analytics)
    const userId = await getCurrentUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || !['SUPERADMIN', 'ADMIN'].includes(user.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    // Get all published articles with analytics data
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { views: 'desc' },
    });

    // Transform articles to analytics format
    const articleAnalytics: ArticleAnalytics[] = articles.map(article => {
      const analytics = article.analytics as any || {};
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        views: article.views,
        likes: article.likes,
        shares: article.shares,
        language: article.language,
        publishedAt: article.publishedAt,
        engagementScore: analytics.avgEngagementScore || 0,
        avgReadingTime: analytics.avgReadingTime || 0,
        avgScrollDepth: analytics.avgScrollDepth || 0,
        bounceRate: analytics.bounceCount ? (analytics.bounceCount / (analytics.totalEngagements || 1)) * 100 : 0,
        category: article.category,
        author: article.author,
      };
    });

    // Calculate summary statistics
    const summary: AnalyticsSummary = {
      totalArticles: articles.length,
      totalViews: articles.reduce((sum, article) => sum + article.views, 0),
      totalLikes: articles.reduce((sum, article) => sum + article.likes, 0),
      totalShares: articles.reduce((sum, article) => sum + article.shares, 0),
      avgEngagementScore: articleAnalytics.reduce((sum, article) => sum + article.engagementScore, 0) / articleAnalytics.length || 0,
      avgReadingTime: articleAnalytics.reduce((sum, article) => sum + article.avgReadingTime, 0) / articleAnalytics.length || 0,
      topPerformingLanguage: getTopPerformingLanguage(articleAnalytics),
      topCategory: getTopCategory(articleAnalytics),
      recentGrowth: await calculateRecentGrowth(articles),
    };

    // Get top performing articles
    const topArticles = articleAnalytics
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate language performance
    const languagePerformance = calculateLanguagePerformance(articleAnalytics);

    // Get time series data (last 30 days)
    const timeSeries = await getTimeSeriesData();

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = articleAnalytics
      .filter(article => article.publishedAt && article.publishedAt >= sevenDaysAgo)
      .sort((a, b) => new Date(b.publishedAt!).getTime() - new Date(a.publishedAt!).getTime())
      .slice(0, 10);

    return {
      success: true,
      data: {
        summary,
        topArticles,
        languagePerformance,
        timeSeries,
        recentActivity,
      },
    };

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return { success: false, error: 'Failed to fetch analytics data' };
  }
}

/**
 * Get article performance data for a specific article
 */
export async function getArticlePerformance(articleId: string): Promise<{
  success: boolean;
  data?: ArticleAnalytics;
  error?: string;
}> {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      return { success: false, error: 'Article not found' };
    }

    const analytics = article.analytics as any || {};
    
    const articleAnalytics: ArticleAnalytics = {
      id: article.id,
      title: article.title,
      slug: article.slug,
      views: article.views,
      likes: article.likes,
      shares: article.shares,
      language: article.language,
      publishedAt: article.publishedAt,
      engagementScore: analytics.avgEngagementScore || 0,
      avgReadingTime: analytics.avgReadingTime || 0,
      avgScrollDepth: analytics.avgScrollDepth || 0,
      bounceRate: analytics.bounceCount ? (analytics.bounceCount / (analytics.totalEngagements || 1)) * 100 : 0,
      category: article.category,
      author: article.author,
    };

    return {
      success: true,
      data: articleAnalytics,
    };

  } catch (error) {
    console.error('Error fetching article performance:', error);
    return { success: false, error: 'Failed to fetch article performance' };
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  success: boolean;
  data?: {
    articleCount: number;
    popularCount: number;
    recentCount: number;
    totalKeys: number;
  };
  error?: string;
}> {
  try {
    const stats = await articleCache.getCacheStats();
    
    return {
      success: true,
      data: stats,
    };

  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return { success: false, error: 'Failed to fetch cache statistics' };
  }
}

// Helper functions

function getTopPerformingLanguage(articles: ArticleAnalytics[]): string {
  const languageStats = calculateLanguagePerformance(articles);
  return languageStats.length > 0 ? languageStats[0]?.language || 'en' : 'en';
}

function getTopCategory(articles: ArticleAnalytics[]): string | null {
  const categoryStats = articles.reduce((acc, article) => {
    if (article.category) {
      acc[article.category] = (acc[article.category] || 0) + article.views;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)[0];

  return topCategory ? topCategory[0] : null;
}

function calculateLanguagePerformance(articles: ArticleAnalytics[]): LanguagePerformance[] {
  const languageStats = articles.reduce((acc, article) => {
    if (!acc[article.language]) {
      acc[article.language] = {
        language: article.language,
        articleCount: 0,
        totalViews: 0,
        totalEngagementScore: 0,
        totalReadingTime: 0,
      };
    }

    acc[article.language].articleCount++;
    acc[article.language].totalViews += article.views;
    acc[article.language].totalEngagementScore += article.engagementScore;
    acc[article.language].totalReadingTime += article.avgReadingTime;

    return acc;
  }, {} as Record<string, any>);

  return Object.values(languageStats).map((stats: any) => ({
    language: stats.language,
    articleCount: stats.articleCount,
    totalViews: stats.totalViews,
    avgEngagementScore: stats.totalEngagementScore / stats.articleCount,
    avgReadingTime: stats.totalReadingTime / stats.articleCount,
  })).sort((a, b) => b.totalViews - a.totalViews);
}

async function calculateRecentGrowth(articles: any[]): Promise<{
  views: number;
  likes: number;
  articles: number;
}> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentArticles = articles.filter(article => 
    article.publishedAt && article.publishedAt >= thirtyDaysAgo
  );

  return {
    views: recentArticles.reduce((sum, article) => sum + article.views, 0),
    likes: recentArticles.reduce((sum, article) => sum + article.likes, 0),
    articles: recentArticles.length,
  };
}

async function getTimeSeriesData(): Promise<TimeSeriesData[]> {
  // This would typically query analytics events from the last 30 days
  // For now, we'll return mock data - in production, you'd query your analytics table
  const data: TimeSeriesData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0] || '',
      views: Math.floor(Math.random() * 1000) + 100,
      likes: Math.floor(Math.random() * 50) + 10,
      articles: Math.floor(Math.random() * 5) + 1,
    });
  }

  return data;
}
