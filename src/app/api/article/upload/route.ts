import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// Security: File validation schema
const fileSchema = z.object({
    file: z.instanceof(File),
});

// Security: Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Security: Validate file
function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: 'File size too large. Maximum size is 5MB.' };
    }

    return { valid: true };
}

// Security: Sanitize filename
function sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

// Security: RBAC function to check user permissions for article operations
async function checkArticlePermissions(allowedRoles: string[] = ['SUPERADMIN', 'ADMIN', 'EDITOR']) {
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

export async function POST(req: NextRequest) {
    try {
        // Security: Check authentication and authorization
        try {
            await checkArticlePermissions(['SUPERADMIN', 'ADMIN', 'EDITOR']);
        } catch (error) {
            if (error instanceof Error && error.message.includes('Authentication required')) {
                return NextResponse.json(
                    { error: 'Authentication required. Please log in.' },
                    { status: 401 },
                );
            }
            return NextResponse.json(
                { error: error instanceof Error ? error.message : 'Insufficient permissions' },
                { status: 403 },
            );
        }

        const formData = await req.formData();

        // Security: Validate input
        const validationResult = fileSchema.safeParse({
            file: formData.get('file'),
        });

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input data', details: validationResult.error.errors },
                { status: 400 },
            );
        }

        const { file } = validationResult.data;

        // Security: Validate file
        const fileValidation = validateFile(file);
        if (!fileValidation.valid) {
            return NextResponse.json(
                { error: fileValidation.error },
                { status: 400 },
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Security: Create secure upload directory for articles
        const uploadDir = path.join(process.cwd(), 'public/uploads/articles');
        await mkdir(uploadDir, { recursive: true });

        // Security: Sanitize filename and create unique name
        const sanitizedFilename = sanitizeFilename(file.name);
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        // Security: Write file to disk
        await writeFile(filePath, buffer);

        // Security: Construct the public URL
        const fileUrl = `/uploads/articles/${uniqueFilename}`;

        return NextResponse.json({
            message: 'File uploaded successfully',
            data: { imageUrl: fileUrl },
        });
    } catch (error) {
        // Security: Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Article image upload error:', error);
        }

        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 },
        );
    }
} 