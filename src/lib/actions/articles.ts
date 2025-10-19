'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { refreshAccessToken } from '@/lib/actions/auth/session';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { articleCache } from '@/lib/cache/articleCache';

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

// Enhanced validation schemas
const createArticleSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    slug: z.string().min(1, 'Slug is required').max(255, 'Slug too long'),
    summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long'),
    content: z.string().min(1, 'Content is required'),
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
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
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
        .min(2, 'At least 2 internal links are required')
        .refine((links) => {
            return links.every(link => {
                try {
                    const url = new URL(link);
                    return url.hostname === 'sheikhshops.com' || url.hostname === 'localhost';
                } catch {
                    return false;
                }
            });
        }, 'All internal links must be from sheikhshops.com domain'),
    
    externalLinks: z.array(z.string().url('Invalid external URL'))
        .default([])
        .refine((links) => {
            return links.every(link => {
                try {
                    const url = new URL(link);
                    return TRUSTED_DOMAINS.some(domain => url.hostname.endsWith(domain));
                } catch {
                    return false;
                }
            });
        }, 'External links must be from trusted domains (Wikipedia, FAO, WHO, PubMed, etc.)'),
    
    excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
});

const updateArticleSchema = createArticleSchema.partial();

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// Helper function to validate internal links
function validateInternalLinks(links: string[]): boolean {
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
}

// Server action specific authentication - more robust than middleware
async function getServerActionUser(context?: { userAgent?: string; ip?: string }): Promise<{ id: string; role: string; email: string }> {
  console.log('[SERVER_ACTION_AUTH] Starting server action authentication');
  
  try {
    // Try multiple authentication methods for server actions
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access-token')?.value;
    const refreshToken = cookieStore.get('refresh-token')?.value;
    
    console.log('[SERVER_ACTION_AUTH] Token check', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });

    if (!accessToken && !refreshToken) {
      console.log('[SERVER_ACTION_AUTH] No tokens found');
      throw new Error('No authentication token found');
    }

    let payload: any = null;

    // Try access token first
    if (accessToken) {
      console.log('[SERVER_ACTION_AUTH] Verifying access token');
      try {
        payload = await verifyAccessToken(accessToken);
        console.log('[SERVER_ACTION_AUTH] Access token valid', { userId: payload?.id });
      } catch (error) {
        console.log('[SERVER_ACTION_AUTH] Access token invalid', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    // Try refresh token if access token failed
    if (!payload && refreshToken) {
      console.log('[SERVER_ACTION_AUTH] Attempting refresh token');
      try {
        const { accessToken: newAccessToken } = await refreshAccessToken(
          refreshToken,
          context?.userAgent,
          context?.ip,
        );
        console.log('[SERVER_ACTION_AUTH] Refresh successful, verifying new access token');
        payload = await verifyAccessToken(newAccessToken);
        console.log('[SERVER_ACTION_AUTH] New access token valid', { userId: payload?.id });
      } catch (error) {
        console.log('[SERVER_ACTION_AUTH] Refresh token failed', { error: error instanceof Error ? error.message : 'Unknown error' });
        throw new Error('Invalid authentication token');
      }
    }

    if (!payload?.id) {
      console.log('[SERVER_ACTION_AUTH] No valid payload found');
      throw new Error('Invalid authentication token');
    }

    // Get fresh user data from database
    console.log('[SERVER_ACTION_AUTH] Fetching user from database', { userId: payload.id });
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, email: true, canLogin: true, disabled: true },
    });

    if (!user || !user.canLogin || user.disabled) {
      console.log('[SERVER_ACTION_AUTH] User not found or disabled', { 
        userFound: !!user, 
        canLogin: user?.canLogin, 
        disabled: user?.disabled 
      });
      throw new Error('User not found or account disabled');
    }

    console.log('[SERVER_ACTION_AUTH] Authentication successful', { 
      userId: user.id, 
      role: user.role, 
      email: user.email 
    });
    return user;
  } catch (error) {
    console.log('[SERVER_ACTION_AUTH] Authentication failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

// Security: RBAC function to check user permissions for article operations
async function checkArticlePermissions(
  allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
  context?: { userAgent?: string; ip?: string }
) {
  console.log('[ARTICLE_AUTH] checkArticlePermissions: Starting permission check', { allowedRoles });
  
  try {
    console.log('[ARTICLE_AUTH] checkArticlePermissions: Getting server action user');
    const user = await getServerActionUser(context);
    console.log('[ARTICLE_AUTH] checkArticlePermissions: User retrieved', { 
      userId: user.id, 
      role: user.role, 
      email: user.email 
    });

    if (!allowedRoles.includes(user.role)) {
      console.log('[ARTICLE_AUTH] checkArticlePermissions: Insufficient permissions', { 
        userRole: user.role, 
        allowedRoles 
      });
      throw new Error(`Insufficient permissions. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`);
    }

    console.log('[ARTICLE_AUTH] checkArticlePermissions: Permission check successful', { 
      userId: user.id, 
      role: user.role 
    });
    return user;
  } catch (error) {
    console.log('[ARTICLE_AUTH] checkArticlePermissions: Permission check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
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

export async function createArticle(formData: FormData) {
    console.log('[ARTICLE_CREATE] createArticle: Starting article creation');
    
    // Security: Check user permissions first
    console.log('[ARTICLE_CREATE] createArticle: Checking permissions');
    const headerList = headers();
    const userAgent = headerList.get('user-agent') || undefined;
    const ip = headerList.get('x-forwarded-for') || undefined;
    const user = await checkArticlePermissions(
      ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
      { userAgent, ip }
    );
    console.log('[ARTICLE_CREATE] createArticle: Permissions verified', { userId: user.id, role: user.role });
    
    // Parse form data with proper type handling
    console.log('[ARTICLE_CREATE] createArticle: Parsing form data');
    const rawData = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string || generateSlug(formData.get('title') as string),
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        status: formData.get('status') as string || 'DRAFT',
        imageUrl: formData.get('imageUrl') as string || undefined,
        category: formData.get('category') as string || undefined,
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
        
        // SEO Fields
        metaTitle: formData.get('metaTitle') as string,
        metaDescription: formData.get('metaDescription') as string,
        keywords: formData.get('keywords') ? JSON.parse(formData.get('keywords') as string) : [],
        internalLinks: formData.get('internalLinks') ? JSON.parse(formData.get('internalLinks') as string) : [],
        externalLinks: formData.get('externalLinks') ? JSON.parse(formData.get('externalLinks') as string) : [],
        excerpt: formData.get('excerpt') as string || undefined,
        
        // Phase 2 Fields
        language: formData.get('language') as string || 'en',
    };

    // Validate all fields including SEO requirements
    const validatedFields = createArticleSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errorMessage}` };
    }

    try {
        // Calculate reading time
        const readTime = calculateReadingTime(validatedFields.data.content);
        
        // Log image source for tracking
        if (validatedFields.data.imageUrl) {
            if (validatedFields.data.imageUrl.startsWith('https://res.cloudinary.com/')) {
                console.log('✅ Article created with Cloudinary image:', validatedFields.data.imageUrl);
            } else {
                console.log('📷 Article created with legacy image URL:', validatedFields.data.imageUrl);
            }
        }
        
        // Set published date if status is PUBLISHED
        const publishedAt = validatedFields.data.status === 'PUBLISHED' ? new Date() : null;

        const article = await prisma.article.create({
            data: {
                ...validatedFields.data,
                authorId: user.id,
                readTime,
                publishedAt,
                imageUrl: validatedFields.data.imageUrl || null,
            },
        });

        // Cache the new article if it's published
        if (article.status === 'PUBLISHED') {
            await articleCache.setArticle(article as any);
            await articleCache.invalidateRelatedCaches();
        }

        revalidatePath('/dashboard/articles');
        redirect('/dashboard/articles');
    } catch (error: any) {
        console.error('Article creation error:', error);
        return { 
            success: false, 
            error: error.message ?? 'Failed to create article' 
        };
    }
}

export async function updateArticle(id: string, formData: FormData) {
    console.log('[ARTICLE_UPDATE] updateArticle: Starting article update', { articleId: id });
    
    // Security: Check user permissions first
    console.log('[ARTICLE_UPDATE] updateArticle: Checking permissions');
    const headerList = headers();
    const userAgent = headerList.get('user-agent') || undefined;
    const ip = headerList.get('x-forwarded-for') || undefined;
    const user = await checkArticlePermissions(
      ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
      { userAgent, ip }
    );
    console.log('[ARTICLE_UPDATE] updateArticle: Permissions verified', { userId: user.id, role: user.role });
    
    // Check if user can modify this specific article
    console.log('[ARTICLE_UPDATE] updateArticle: Checking article modification rights');
    const canModify = await canModifyArticle(id, user.id, user.role);
    if (!canModify) {
        console.log('[ARTICLE_UPDATE] updateArticle: User cannot modify this article');
        return { success: false, error: 'You can only modify your own articles' };
    }
    console.log('[ARTICLE_UPDATE] updateArticle: Article modification rights verified');
    
    // Parse form data with proper type handling
    console.log('[ARTICLE_UPDATE] updateArticle: Parsing form data');
    const rawData = {
        title: formData.get('title') as string,
        slug: formData.get('slug') as string,
        summary: formData.get('summary') as string,
        content: formData.get('content') as string,
        status: formData.get('status') as string,
        imageUrl: formData.get('imageUrl') as string || undefined,
        category: formData.get('category') as string || undefined,
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
        
        // SEO Fields
        metaTitle: formData.get('metaTitle') as string,
        metaDescription: formData.get('metaDescription') as string,
        keywords: formData.get('keywords') ? JSON.parse(formData.get('keywords') as string) : [],
        internalLinks: formData.get('internalLinks') ? JSON.parse(formData.get('internalLinks') as string) : [],
        externalLinks: formData.get('externalLinks') ? JSON.parse(formData.get('externalLinks') as string) : [],
        excerpt: formData.get('excerpt') as string || undefined,
        
        // Phase 2 Fields
        language: formData.get('language') as string || 'en',
    };

    // Validate all fields including SEO requirements
    const validatedFields = updateArticleSchema.safeParse(rawData);

    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return { success: false, error: `Validation failed: ${errorMessage}` };
    }

    try {
        // Log image source for tracking
        if (validatedFields.data.imageUrl) {
            if (validatedFields.data.imageUrl.startsWith('https://res.cloudinary.com/')) {
                console.log('✅ Article updated with Cloudinary image:', validatedFields.data.imageUrl);
            } else {
                console.log('📷 Article updated with legacy image URL:', validatedFields.data.imageUrl);
            }
        }
        
        // Calculate reading time if content is being updated
        const updateData: any = { ...validatedFields.data };
        if (validatedFields.data.content) {
            updateData.readTime = calculateReadingTime(validatedFields.data.content);
        }
        
        // Set published date if status is being changed to PUBLISHED
        if (validatedFields.data.status === 'PUBLISHED') {
            const currentArticle = await prisma.article.findUnique({
                where: { id },
                select: { publishedAt: true }
            });
            if (!currentArticle?.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }

        const article = await prisma.article.update({
            where: { id },
            data: {
                ...updateData,
                imageUrl: updateData.imageUrl || null,
            },
        });

        // Invalidate cache for updated article
        await articleCache.invalidateArticle(article.slug);
        
        // Cache the updated article if it's published
        if (article.status === 'PUBLISHED') {
            await articleCache.setArticle(article as any);
            await articleCache.invalidateRelatedCaches();
        }

        revalidatePath('/dashboard/articles');
        redirect('/dashboard/articles');
    } catch (error: any) {
        console.error('Article update error:', error);
        return { success: false, error: error.message ?? 'Failed to update article' };
    }
}

export async function deleteArticle(id: string) {
    // Security: Check user permissions first
    const headerList = headers();
    const userAgent = headerList.get('user-agent') || undefined;
    const ip = headerList.get('x-forwarded-for') || undefined;
    const user = await checkArticlePermissions(
      ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
      { userAgent, ip }
    );
    
    // Check if user can modify this specific article
    const canModify = await canModifyArticle(id, user.id, user.role);
    if (!canModify) {
        return { success: false, error: 'You can only delete your own articles' };
    }
    
    try {
        await prisma.article.delete({
            where: { id },
        });

        revalidatePath('/dashboard/articles');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to delete article' };
    }
}

// Public read functions - no authentication required
export async function getArticles() {
    try {
        const articles = await prisma.article.findMany({
            where: { status: 'PUBLISHED' }, // Only show published articles to public
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return { success: true, data: articles };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to fetch articles' };
    }
}

export async function getArticleById(id: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { 
                id,
                status: 'PUBLISHED' // Only show published articles to public
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

        if (!article) {
            return { success: false, error: 'Article not found' };
        }

        return { success: true, data: article };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to fetch article' };
    }
}

export async function getArticleBySlug(slug: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { 
                slug,
                status: 'PUBLISHED' // Only show published articles to public
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
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
                                firstName: true,
                                lastName: true,
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
            return { success: false, error: 'Article not found' };
        }

        return { success: true, data: article };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to fetch article' };
    }
}

export async function getRelatedArticles(currentArticleId: string, category?: string, tags?: string[], limit: number = 3) {
    try {
        const whereConditions: any = {
            id: { not: currentArticleId },
            status: 'PUBLISHED',
        };

        // If category is provided, prioritize articles from the same category
        if (category) {
            whereConditions.category = category;
        }

        // If tags are provided, look for articles with similar tags
        if (tags && tags.length > 0) {
            whereConditions.tags = {
                hasSome: tags,
            };
        }

        const relatedArticles = await prisma.article.findMany({
            where: whereConditions,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: (
                category
                    ? [{ createdAt: 'desc' as const }]
                    : [{ createdAt: 'desc' as const }]
            ),
            take: limit,
        });

        return { success: true, data: relatedArticles };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to fetch related articles' };
    }
}

// Admin-only function to get all articles (including drafts)
export async function getAllArticlesForAdmin() {
    // Security: Check user permissions first
    const headerList = headers();
    const userAgent = headerList.get('user-agent') || undefined;
    const ip = headerList.get('x-forwarded-for') || undefined;
    const user = await checkArticlePermissions(
      ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR'],
      { userAgent, ip }
    );
    
    try {
        const articles = await prisma.article.findMany({
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

        return { success: true, data: articles };
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to fetch articles' };
    }
}