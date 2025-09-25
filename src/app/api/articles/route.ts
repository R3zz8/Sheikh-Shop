import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Validation schemas
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long').optional(),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Security: RBAC function to check user permissions for article operations
async function checkArticlePermissions(allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']) {
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

// Check if user can modify specific article (ownership or admin privileges)
async function canModifyArticle(articleId: string, userId: string, userRole: string): Promise<boolean> {
  if (['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(userRole)) {
    return true; // Admins and editors can modify any article
  }
  
  if (userRole === 'AUTHOR') {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { authorId: true },
    });
    return article?.authorId === userId; // Authors can only modify their own articles
  }
  
  return false;
}

// GET /api/articles - Get all articles (admin) or published articles (public)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const isAdmin = url.searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // Admin endpoint - requires authentication and admin role
      try {
        await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR']);
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Unauthorized' },
          { status: 401 }
        );
      }

      const articles = await prisma.article.findMany({
        include: {
          author: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
            },
          },
          comments: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({
        success: true,
        data: articles,
      });
    } else {
      // Public endpoint - only published articles
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
          comments: {
            where: { status: 'APPROVED' },
            select: {
              id: true,
              content: true,
              createdAt: true,
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({
        success: true,
        data: articles,
      });
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create new article
export async function POST(req: NextRequest) {
  try {
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
    const body = await req.json();
    const validatedFields = createArticleSchema.parse(body);

    const article = await prisma.article.create({
      data: {
        ...validatedFields,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}



