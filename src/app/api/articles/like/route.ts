import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getRedis } from '@/lib/redis';
import { logAudit } from '@/lib/actions/auth/audit';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Validation schema
const likeArticleSchema = z.object({
  articleId: z.string().uuid('Invalid article ID'),
  action: z.enum(['like', 'unlike'], {
    errorMap: () => ({ message: 'Action must be either "like" or "unlike"' }),
  }),
});

// Rate limiting for likes (prevent spam)
const likeTrackingMap = new Map<string, { count: number; lastLiked: number }>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_LIKES_PER_WINDOW = 10;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const record = likeTrackingMap.get(userId);
  
  if (!record || now - record.lastLiked > RATE_LIMIT_WINDOW) {
    likeTrackingMap.set(userId, { count: 1, lastLiked: now });
    return false;
  }
  
  if (record.count >= MAX_LIKES_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  record.lastLiked = now;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Authentication required for liking articles
    const userId = await getCurrentUserId();
    
    const body = await req.json();
    const validatedData = likeArticleSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validatedData.error.errors },
        { status: 400 }
      );
    }
    
    const { articleId, action } = validatedData.data;
    
    // Rate limiting check
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: 'Too many like requests. Please wait before trying again.' },
        { status: 429 }
      );
    }
    
    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { 
        id: true, 
        status: true, 
        title: true,
        likes: true,
        authorId: true,
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
    
    // Prevent authors from liking their own articles
    if (article.authorId === userId) {
      return NextResponse.json(
        { error: 'You cannot like your own article' },
        { status: 403 }
      );
    }
    
    // Check if user has already liked this article
    const existingLike = await prisma.userLike.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    
    let updatedLikes = article.likes;
    let isLiked = false;
    
    if (action === 'like') {
      if (existingLike) {
        return NextResponse.json(
          { error: 'You have already liked this article' },
          { status: 400 }
        );
      }
      
      // Create like record
      await prisma.userLike.create({
        data: {
          userId,
          articleId,
        },
      });
      
      // Increment like count
      updatedLikes = article.likes + 1;
      isLiked = true;
      
    } else { // unlike
      if (!existingLike) {
        return NextResponse.json(
          { error: 'You have not liked this article' },
          { status: 400 }
        );
      }
      
      // Remove like record
      await prisma.userLike.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
      
      // Decrement like count
      updatedLikes = Math.max(0, article.likes - 1);
      isLiked = false;
    }
    
    // Update article like count
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { likes: updatedLikes },
      select: { likes: true, title: true },
    });
    
    // Cache the updated like count in Redis
    const redis = await getRedis();
    const cacheKey = `article:likes:${articleId}`;
    await redis.set(cacheKey, updatedArticle.likes.toString(), { ex: 3600 }); // Cache for 1 hour
    
    // Log audit event
    await logAudit(
      userId,
      action === 'like' ? 'ARTICLE_LIKE' : 'ARTICLE_UNLIKE',
      {
        articleId,
        articleTitle: updatedArticle.title,
        action,
        newLikeCount: updatedArticle.likes,
      }
    );
    
    return NextResponse.json({
      success: true,
      likes: updatedArticle.likes,
      isLiked,
      message: `Article ${action === 'like' ? 'liked' : 'unliked'} successfully`,
    });
    
  } catch (error) {
    console.error('Error handling article like:', error);
    return NextResponse.json(
      { error: 'Failed to process like request' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user has liked an article
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get('articleId');
    
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }
    
    // Check if user has liked this article
    const existingLike = await prisma.userLike.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });
    
    // Get article like count
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { likes: true },
    });
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      isLiked: !!existingLike,
      likes: article.likes,
    });
    
  } catch (error) {
    console.error('Error checking article like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
}


