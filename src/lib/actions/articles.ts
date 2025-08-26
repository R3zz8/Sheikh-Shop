'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

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

// Helper function to check user permissions (commented out for now)
// async function checkUserPermissions(allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR']) {
//   const session = await getServerSession();
//   if (!session?.user?.email) {
//     throw new Error('Unauthorized');
//   }

//   const user = await prisma.user.findUnique({
//     where: { email: session.user.email },
//     select: { id: true, role: true },
//   });

//   if (!user || !allowedRoles.includes(user.role)) {
//     throw new Error('Insufficient permissions');
//   }

//   return user;
// }

export async function createArticle(formData: FormData) {
    const schema = z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        summary: z.string().min(1, 'Summary is required'),
        content: z.string().min(1, 'Content is required'),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        imageUrl: z.string().optional(),
    });

    const validatedFields = schema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        summary: formData.get('summary'),
        content: formData.get('content'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl'),
    });

    if (!validatedFields.success) {
        return { success: false, error: validatedFields.error.errors[0]?.message ?? 'Validation failed' };
    }

    try {
        const _article = await prisma.article.create({
            data: {
                ...validatedFields.data,
                authorId: 'system-user-id', // Replace with actual user ID
            },
        });

        revalidatePath('/dashboard/articles');
        redirect('/dashboard/articles');
    } catch (error: any) {
        return { success: false, error: error.message ?? 'Failed to create article' };
    }
}

export async function updateArticle(id: string, formData: FormData) {
    const schema = z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        summary: z.string().min(1, 'Summary is required'),
        content: z.string().min(1, 'Content is required'),
        status: z.enum(['DRAFT', 'PUBLISHED']),
        imageUrl: z.string().optional(),
    });

    const validatedFields = schema.safeParse({
        title: formData.get('title'),
        slug: formData.get('slug'),
        summary: formData.get('summary'),
        content: formData.get('content'),
        status: formData.get('status'),
        imageUrl: formData.get('imageUrl'),
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

export async function getArticles() {
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

export async function getArticleById(id: string) {
    try {
        const article = await prisma.article.findUnique({
            where: { id },
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