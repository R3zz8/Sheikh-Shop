import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
});

const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

// Security: RBAC function to check user permissions
async function checkCommentPermissions(allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR']) {
  try {
    const userId = await getCurrentUserId();
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new Error(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`);
    }

    return user;
  } catch (error) {
    if (error instanceof Error && error.message.includes('No authentication token found')) {
      throw new Error('Authentication required. Please log in.');
    }
    throw error;
  }
}

// GET /api/articles/[id]/comments - Get comments for an article
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: articleId } = await params;
    
    // Check if article exists
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // For published articles, show approved comments to everyone
    // For draft articles, require authentication and appropriate permissions
    if (article.status === 'DRAFT') {
      try {
        await checkCommentPermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'MODERATOR', 'AUTHOR']);
      } catch {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    }

    const comments = await prisma.comment.findMany({
      where: { 
        articleId,
        status: article.status === 'PUBLISHED' ? 'APPROVED' : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/articles/[id]/comments - Create new comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: articleId } = await params;
    
    // Check if article exists and is published
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (article.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Comments can only be added to published articles' },
        { status: 403 }
      );
    }

    // Get current user (optional for comments)
    let userId: string | undefined;
    try {
      const user = await getCurrentUserId();
      const dbUser = await prisma.user.findUnique({
        where: { id: user },
        select: { id: true },
      });
      userId = dbUser?.id;
    } catch {
      // Guest users can comment without authentication
      userId = undefined;
    }

    const body = await req.json();
    const validatedFields = createCommentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        ...validatedFields,
        articleId,
        authorId: userId,
        status: userId ? 'PENDING' : 'PENDING', // All comments start as pending
      },
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

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}



