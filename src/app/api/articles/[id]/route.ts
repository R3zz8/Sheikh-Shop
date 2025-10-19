import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

// Enhanced validation schemas - matches createArticleSchema but with optional fields
const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long').optional(),
  summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
  imageUrl: z.string()
    .optional()
    .or(z.literal(''))
    .refine((url) => {
      if (!url || url === '') return true; // Allow empty
      // Validate Cloudinary URLs or legacy URLs
      return url.startsWith('https://res.cloudinary.com/') || 
             url.startsWith('http://') || 
             url.startsWith('https://');
    }, 'Image URL must be a valid Cloudinary URL or HTTP/HTTPS URL'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // SEO Required Fields
  metaTitle: z.string()
    .min(1, 'Meta title is required')
    .max(60, 'Meta title must be 60 characters or less')
    .optional(),
  metaDescription: z.string()
    .min(1, 'Meta description is required')
    .max(155, 'Meta description must be 155 characters or less')
    .optional(),
  keywords: z.array(z.string()).optional(),
  
  // Phase 2 Enhancements
  language: z.string().default('en').refine(
    (lang) => ['en', 'ar', 'fa', 'tr'].includes(lang),
    'Language must be one of: en, ar, fa, tr'
  ).optional(),
  
  // Link Validation
  internalLinks: z.array(z.string().url('Invalid internal URL'))
    .optional()
    .refine((links) => {
      if (!links) return true;
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
    .optional()
    .refine((links) => {
      if (!links) return true;
      return links.every(link => {
        try {
          const url = new URL(link);
          return TRUSTED_DOMAINS.some(domain => url.hostname.includes(domain));
        } catch {
          return false;
        }
      });
    }, 'All external links must be from trusted domains'),
  
  excerpt: z.string().max(300, 'Excerpt too long').optional(),
});

// SEO Validation Constants
const TRUSTED_DOMAINS = [
  'wikipedia.org',
  'fao.org',
  'who.int',
  'pubmed.ncbi.nlm.nih.gov',
  'ncbi.nlm.nih.gov',
  'mayoclinic.org',
  'webmd.com',
  'healthline.com',
  'medicalnewstoday.com',
  'nutrition.gov',
  'usda.gov',
  'cdc.gov',
  'nih.gov'
];

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

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

// GET /api/articles/[id] - Get specific article
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const article = await prisma.article.findUnique({
      where: { id },
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check if user can view draft articles
    if (article.status === 'DRAFT') {
      try {
        const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
        
        // Authors can only view their own drafts
        if (user.role === 'AUTHOR' && article.authorId !== user.id) {
          return NextResponse.json(
            { error: 'Article not found' },
            { status: 404 }
          );
        }
      } catch {
        // If not authenticated or no permission, return 404 for drafts
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PATCH /api/articles/[id] - Update article
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { checkAccess } = await import('@/lib/checkAccess');
    const ok = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    if (!ok) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    // emulate user context shape required by canModifyArticle
    const user = {
      id: req.headers.get('x-user-id') || '',
      role: (req.headers.get('x-user-role') || '').toUpperCase(),
    } as any;
    
    // Check if user can modify this specific article
    const canModify = await canModifyArticle(id, user.id, user.role);
    if (!canModify) {
      return NextResponse.json(
        { error: 'You can only modify your own articles' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedFields = updateArticleSchema.parse(body);

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true, publishedAt: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Calculate reading time if content is being updated
    const updateData: any = { ...validatedFields };
    if (validatedFields.content) {
      updateData.readTime = calculateReadingTime(validatedFields.content);
    }
    
    // Set published date if status is being changed to PUBLISHED
    if (validatedFields.status === 'PUBLISHED' && !existingArticle.publishedAt) {
      updateData.publishedAt = new Date();
    }

    // Log image source for tracking
    if (validatedFields.imageUrl) {
      if (validatedFields.imageUrl.startsWith('https://res.cloudinary.com/')) {
        console.log('✅ Article updated with Cloudinary image:', validatedFields.imageUrl);
      } else {
        console.log('📷 Article updated with legacy image URL:', validatedFields.imageUrl);
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...updateData,
        imageUrl: updateData.imageUrl || null,
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

    // Invalidate cache for updated article
    const { articleCache } = await import('@/lib/cache/articleCache');
    await articleCache.invalidateArticle(article.slug);
    
    // Cache the updated article if it's published
    if (article.status === 'PUBLISHED') {
      await articleCache.setArticle(article as any);
      await articleCache.invalidateRelatedCaches();
    }

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

    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
    // Check if user can modify this specific article
    const canModify = await canModifyArticle(id, user.id, user.role);
    if (!canModify) {
      return NextResponse.json(
        { error: 'You can only delete your own articles' },
        { status: 403 }
      );
    }

    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete article (comments will be cascade deleted)
    await prisma.article.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
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

    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}



