import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getRedis } from '@/lib/redis';
import { logAudit } from '@/lib/actions/auth/audit';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Rate limiting for view tracking (prevent spam)
const viewTrackingMap = new Map<string, { count: number; lastTracked: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_VIEWS_PER_WINDOW = 5;

// Validation schema
const trackViewSchema = z.object({
  articleId: z.string().uuid('Invalid article ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
  userAgent: z.string().optional(),
  referrer: z.string().url().optional().or(z.literal('')),
});

// Debounced view tracking to prevent spam
function isRateLimited(sessionId: string): boolean {
  const now = Date.now();
  const record = viewTrackingMap.get(sessionId);
  
  if (!record || now - record.lastTracked > RATE_LIMIT_WINDOW) {
    viewTrackingMap.set(sessionId, { count: 1, lastTracked: now });
    return false;
  }
  
  if (record.count >= MAX_VIEWS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  record.lastTracked = now;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = trackViewSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { articleId, sessionId, userAgent, referrer } = validatedData.data;
    
    // Rate limiting check
    if (isRateLimited(sessionId)) {
      return NextResponse.json(
        { error: 'Too many view tracking requests' },
        { status: 429 }
      );
    }
    
    // Get current user (optional for authenticated users)
    let userId: string | null = null;
    try {
      userId = await getCurrentUserId();
    } catch {
      // User not authenticated, continue with anonymous tracking
    }
    
    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { 
        id: true, 
        status: true, 
        title: true,
        views: true,
        language: true 
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
    
    // Increment view count atomically
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { views: { increment: 1 } },
      select: { views: true, title: true },
    });
    
    // Cache the updated view count in Redis for popular articles
    const redis = await getRedis();
    const cacheKey = `article:views:${articleId}`;
    await redis.set(cacheKey, updatedArticle.views.toString(), { ex: 3600 }); // Cache for 1 hour
    
    // Update analytics data
    const analyticsUpdate = {
      lastViewed: new Date().toISOString(),
      viewCount: updatedArticle.views,
      ...(userId && { lastViewedBy: userId }),
    };
    
    // Store detailed analytics (optional - can be moved to a separate table for better performance)
    await prisma.article.update({
      where: { id: articleId },
      data: {
        analytics: {
          ...((await prisma.article.findUnique({ where: { id: articleId }, select: { analytics: true } }))?.analytics as any || {}),
          ...analyticsUpdate,
        },
      },
    });
    
    // Log audit event
    await logAudit(
      userId,
      'ARTICLE_VIEW',
      {
        articleId,
        articleTitle: updatedArticle.title,
        sessionId,
        userAgent,
        referrer,
        newViewCount: updatedArticle.views,
      }
    );
    
    return NextResponse.json({
      success: true,
      views: updatedArticle.views,
      message: 'View tracked successfully',
    });
    
  } catch (error) {
    console.error('Error tracking article view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}


