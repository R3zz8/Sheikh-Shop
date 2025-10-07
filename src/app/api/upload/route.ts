import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary, pingCloudinary } from '@/lib/cloudinary-safe';
import { checkAccess } from '@/lib/checkAccess';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { getServerSession as getNextAuthServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
    // RBAC: Only SUPER_ADMIN, ADMIN, EDITOR
    // Get user role from middleware headers (middleware handles auth)
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
        console.warn('[UPLOAD RBAC] Unauthorized upload attempt');
        return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env as Record<string, string | undefined>;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }
    try {
        console.log('[UPLOAD] Starting upload process...');
        
        // Basic rate limit: 20 requests per 60s per IP
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        console.log('[UPLOAD] Checking rate limit for IP:', ip);
        const rl = await rateLimit(`upload:${ip}`, 20, 60);
        if (!rl.allowed) {
            console.log('[UPLOAD] Rate limit exceeded');
            return NextResponse.json({ error: 'Too many requests', retryAfter: rl.retryAfter }, { status: 429 });
        }
        console.log('[UPLOAD] Rate limit check passed');

        console.log('[UPLOAD] Parsing form data...');
        const formData = await req.formData();
        const file = formData.get('file');
        const productId = formData.get('productId');
        console.log('[UPLOAD] Form data parsed, file:', file ? 'present' : 'missing', 'productId:', productId);

        if (!file || !(file instanceof File)) {
            console.log('[UPLOAD] No file provided');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            console.log('[UPLOAD] Invalid file type:', file.type);
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP allowed.' }, { status: 400 });
        }

        if (file.size > MAX_SIZE_BYTES) {
            console.log('[UPLOAD] File too large:', file.size);
            return NextResponse.json({ error: 'File too large. Max size is 2MB.' }, { status: 413 });
        }

        console.log('[UPLOAD] File validation passed, converting to buffer...');
        // Convert to buffer for upload_stream
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log('[UPLOAD] Buffer created, size:', buffer.length);

        // Diagnostics: verify Cloudinary credentials via ping before upload
        const ping = await pingCloudinary();
        console.log('[UPLOAD] Cloudinary ping:', {
            ok: ping.ok,
            error: ping.ok ? undefined : (ping.error && (ping.error as any).message),
        });
        console.log('[UPLOAD] Starting Cloudinary upload...');
        const cloudinary = getCloudinary();
        
        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'digitalshop/products',
                    resource_type: 'image',
                    overwrite: false,
                    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error('[UPLOAD] Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('[UPLOAD] Cloudinary upload successful:', result?.public_id);
                        resolve(result);
                    }
                },
            );
            stream.end(buffer);
        });

        console.log('[UPLOAD] Saving to database...');
        // Persist to DB with metadata if prisma is available
        const created = await prisma.image.create({
            data: {
                image: uploadResult.secure_url as string,
                secureUrl: uploadResult.secure_url as string,
                publicId: uploadResult.public_id as string,
                width: uploadResult.width as number | undefined,
                height: uploadResult.height as number | undefined,
                format: uploadResult.format as string | undefined,
                bytes: uploadResult.bytes as number | undefined,
                productId: typeof productId === 'string' && productId.length > 0 ? productId : null,
            },
        });
        console.log('[UPLOAD] Database save successful, ID:', created.id);

        return NextResponse.json(
            {
                success: true,
                data: created,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('[UPLOAD] Upload error:', err);
        console.error('[UPLOAD] Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            name: err instanceof Error ? err.name : undefined
        });
        return NextResponse.json({ 
            error: 'Upload failed', 
            details: process.env.NODE_ENV !== 'production' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
        }, { status: 500 });
    }
}

// Optional: list images by productId to support UI without local /api/image
export async function GET(req: NextRequest) {
    // RBAC: Only SUPER_ADMIN, ADMIN, EDITOR can list product images
    // Get user role from middleware headers (middleware handles auth)
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[UPLOAD LIST RBAC] Unauthorized list attempt');
        }
        return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }
        const images = await prisma.image.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ images }, { status: 200 });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Cloudinary list error:', err);
        }
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
}
