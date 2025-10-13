import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getRedis } from '@/lib/redis';
import { logAudit } from '@/lib/actions/auth/audit';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Validation schema for engagement tracking
const trackEngagementSchema = z.object({
  articleId: z.string().uuid('Invalid article ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
  timeOnPage: z.number().min(0, 'Time on page must be positive').max(3600, 'Time on page too high'), // Max 1 hour
  scrollDepth: z.number().min(0, 'Scroll depth must be positive').max(100, 'Scroll depth cannot exceed 100%'),
  bounceRate: z.boolean().optional(),
  readingSpeed: z.number().min(0).max(1000).optional(), // Words per minute
  userAgent: z.string().optional(),
  referrer: z.string().url().optional().or(z.literal('')),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = trackEngagementSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { 
      articleId, 
      sessionId, 
      timeOnPage, 
      scrollDepth, 
      bounceRate, 
      readingSpeed,
      userAgent,
      referrer 
    } = validatedData.data;
    
    // Get current user (optional for authenticated users)
    let userId: string | null = null;
    try {
      userId = await getCurrentUserId();
    } catch {
      // User not authenticated, continue with anonymous tracking
    }
    
    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { 
        id: true, 
        status: true, 
        title: true,
        analytics: true,
        readTime: true,
      },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    if (article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Article not published' },
        { status: 404 }
      );
    }
    
    // Get existing analytics data
    const existingAnalytics = article.analytics as any || {};
    
    // Calculate engagement metrics
    const engagementScore = calculateEngagementScore(timeOnPage, scrollDepth, bounceRate);
    const avgReadingTime = existingAnalytics.avgReadingTime || 0;
    const totalEngagements = existingAnalytics.totalEngagements || 0;
    
    // Update analytics data
    const updatedAnalytics = {
      ...existingAnalytics,
      lastEngagement: {
        timeOnPage,
        scrollDepth,
        bounceRate,
        readingSpeed,
        engagementScore,
        timestamp: new Date().toISOString(),
        sessionId,
        ...(userId && { userId }),
      },
      avgReadingTime: Math.round((avgReadingTime * totalEngagements + timeOnPage) / (totalEngagements + 1)),
      avgScrollDepth: Math.round(((existingAnalytics.avgScrollDepth || 0) * totalEngagements + scrollDepth) / (totalEngagements + 1)),
      avgEngagementScore: Math.round(((existingAnalytics.avgEngagementScore || 0) * totalEngagements + engagementScore) / (totalEngagements + 1)),
      totalEngagements: totalEngagements + 1,
      ...(bounceRate && { bounceCount: (existingAnalytics.bounceCount || 0) + 1 }),
    };
    
    // Update article with new analytics
    await prisma.article.update({
      where: { id: articleId },
      data: { analytics: updatedAnalytics },
    });
    
    // Cache engagement data in Redis for real-time dashboard
    const redis = await getRedis();
    const cacheKey = `article:engagement:${articleId}`;
    await redis.set(cacheKey, JSON.stringify(updatedAnalytics), { ex: 1800 }); // Cache for 30 minutes
    
    // Log audit event
    await logAudit(
      userId,
      'ARTICLE_ENGAGEMENT',
      {
        articleId,
        articleTitle: article.title,
        sessionId,
        timeOnPage,
        scrollDepth,
        engagementScore,
        bounceRate,
        readingSpeed,
        userAgent,
        referrer,
      }
    );
    
    return NextResponse.json({
      success: true,
      engagementScore,
      message: 'Engagement tracked successfully',
    });
    
  } catch (error) {
    console.error('Error tracking article engagement:', error);
    return NextResponse.json(
      { error: 'Failed to track engagement' },
      { status: 500 }
    );
  }
}

// Calculate engagement score based on time on page and scroll depth
function calculateEngagementScore(
  timeOnPage: number, 
  scrollDepth: number, 
  bounceRate?: boolean
): number {
  let score = 0;
  
  // Time on page scoring (0-40 points)
  if (timeOnPage >= 60) score += 40; // 1+ minute
  else if (timeOnPage >= 30) score += 30; // 30+ seconds
  else if (timeOnPage >= 15) score += 20; // 15+ seconds
  else if (timeOnPage >= 5) score += 10; // 5+ seconds
  
  // Scroll depth scoring (0-40 points)
  if (scrollDepth >= 90) score += 40; // 90%+ scrolled
  else if (scrollDepth >= 75) score += 30; // 75%+ scrolled
  else if (scrollDepth >= 50) score += 20; // 50%+ scrolled
  else if (scrollDepth >= 25) score += 10; // 25%+ scrolled
  
  // Bonus points for not bouncing (0-20 points)
  if (bounceRate === false) score += 20;
  
  return Math.min(score, 100); // Cap at 100
}


