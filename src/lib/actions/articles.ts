'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Validation schemas
const _createArticleSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
    summary: z.string().min(1, 'Summary is required').max(500, 'Summary too long'),
    content: z.string().min(1, 'Content is required'),
    imageUrl: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

// Helper function to generate slug from title
function _generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
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

export async function createArticle(formData: FormData) {
    // Security: Check user permissions first
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
    const schema = z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        summary: z.string().min(1, 'Summary is required'),
        content: z.string().min(1, 'Content is required'),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
    });

    const validatedFields = schema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        summary: formData.get('summary'),
        content: formData.get('content'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl'),
        category: formData.get('category'),
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    });

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.errors[0]?.message ?? 'Validation failed' };
    }

    try {
        const _article = await prisma.article.create({
            data: {
                ...validatedFields.data,
                authorId: user.id, // Use actual authenticated user ID
            },
        });

        revalidatePath('/dashboard/articles');
        redirect('/dashboard/articles');
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to create article' };
    }
}

export async function updateArticle(id: string, formData: FormData) {
    // Security: Check user permissions first
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
    // Check if user can modify this specific article
    const canModify = await canModifyArticle(id, user.id, user.role);
    if (!canModify) {
        return { success: false, error: 'You can only modify your own articles' };
    }
    
    const schema = z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        summary: z.string().min(1, 'Summary is required'),
        content: z.string().min(1, 'Content is required'),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        imageUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
    });

    const validatedFields = schema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        summary: formData.get('summary'),
        content: formData.get('content'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl'),
        category: formData.get('category'),
        tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    });

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.errors[0]?.message ?? 'Validation failed' };
    }

    try {
        const _article = await prisma.article.update({
            where: { id },
            data: validatedFields.data,
        });

        revalidatePath('/dashboard/articles');
        redirect('/dashboard/articles');
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to update article' };
    }
}

export async function deleteArticle(id: string) {
    // Security: Check user permissions first
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
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
            orderBy: [
                // Prioritize by category match first
                ...(category ? [{ category: 'asc' }] : []),
                // Then by creation date
                { createdAt: 'desc' },
            ],
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
    const user = await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']);
    
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