import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Validation schemas - Enhanced with Phase 2 fields
const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  
  // SEO Required Fields
  metaTitle: z.string()
    .min(1, 'Meta title is required')
    .max(60, 'Meta title must be 60 characters or less'),
  metaDescription: z.string()
    .min(1, 'Meta description is required')
    .max(155, 'Meta description must be 155 characters or less'),
  keywords: z.array(z.string()).default([]),
  
  // Phase 2 Enhancements
  language: z.string().default('en').refine(
    (lang) => ['en', 'ar', 'fa', 'tr'].includes(lang),
    'Language must be one of: en, ar, fa, tr'
  ),
  
  // Link Validation
  internalLinks: z.array(z.string().url('Invalid internal URL'))
    .default([])
    .refine((links) => {
      return links.every(link => {
        try {
          const url = new URL(link);
          return url.hostname === 'sheikhshops.com' || 
                 url.hostname === 'localhost' ||
                 url.pathname.startsWith('/');
        } catch {
          return false;
        }
      });
    }, 'All internal links must be from sheikhshops.com domain'),
  
  externalLinks: z.array(z.string().url('Invalid external URL'))
    .default([])
    .refine((links) => {
      const TRUSTED_DOMAINS = [
        'wikipedia.org', 'fao.org', 'who.int', 'pubmed.ncbi.nlm.nih.gov',
        'ncbi.nlm.nih.gov', 'mayoclinic.org', 'webmd.com', 'healthline.com',
        'medicalnewstoday.com', 'nutrition.gov', 'usda.gov', 'cdc.gov', 'nih.gov'
      ];
      return links.every(link => {
        try {
          const url = new URL(link);
          return TRUSTED_DOMAINS.some(domain => url.hostname.endsWith(domain));
        } catch {
          return false;
        }
      });
    }, 'External links must be from trusted domains'),
  
  excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
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

// Revalidate this route every 10 minutes
export const revalidate = 600;

// Admin-only data fetching (always dynamic)
async function getAdminArticles() {
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
}

// Public data fetching (cached)
async function getPublicArticles() {
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

  const response = NextResponse.json({
    success: true,
    data: articles,
  });

  // Add cache control headers
  response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');

  return response;
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
      return getAdminArticles();
    } else {
      // Public endpoint - only published articles
      return getPublicArticles();
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// POST /api/articles - Create new article
export async function POST(req: NextRequest) {
  try {
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
    const body = await req.json();
    const validatedFields = createArticleSchema.parse(body);

    // Calculate reading time
    const readTime = calculateReadingTime(validatedFields.content);
    
    // Set published date if status is PUBLISHED
    const publishedAt = validatedFields.status === 'PUBLISHED' ? new Date() : null;

    const article = await prisma.article.create({
      data: {
        ...validatedFields,
        authorId: user.id,
        readTime,
        publishedAt,
        imageUrl: validatedFields.imageUrl || null,
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
        { error: 'Invalid input data', details: error.errors },
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



