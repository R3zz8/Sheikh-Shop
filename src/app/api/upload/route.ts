import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary, pingCloudinary } from '@/lib/cloudinary-safe';
import { checkAccess } from '@/lib/checkAccess';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rateLimit';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15MB for video, images are validated within the handler

async function invalidateProductAllCaches(productId: string) {
  try {
    await cacheService.invalidateProductCache(productId);
    invalidateProductCache(productId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true }
    });

    revalidatePath('/dashboard/products');
    if (product?.slug) {
      revalidatePath(`/products/${product.slug}`);
    }
    revalidatePath(`/products/${productId}`);
    revalidatePath(`/product/${productId}`);
    revalidatePath('/');
  } catch (err) {
    console.error('Error during automatic media cache invalidation:', err);
  }
}

export async function POST(req: NextRequest) {
    // RBAC: Only SUPER_ADMIN, ADMIN, EDITOR
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
        
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const rl = await rateLimit(`upload:${ip}`, 20, 60);
        if (!rl.allowed) {
            return NextResponse.json({ error: 'Too many requests', retryAfter: rl.retryAfter }, { status: 429 });
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const productId = formData.get('productId');

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG, WEBP images or MP4, WebM, MOV videos are allowed.' }, { status: 400 });
        }

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        // Image-specific size limit (2MB)
        if (isImage && file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image too large. Max size is 2MB.' }, { status: 413 });
        }

        // Video-specific size limit (15MB)
        if (isVideo && file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'Video too large. Max size is 15MB.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudinary = getCloudinary();
        const resourceType = isImage ? 'image' : 'video';
        const folder = isImage ? 'digitalshop/products/images' : 'digitalshop/products/videos';

        const uploadResult: any = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: resourceType,
                    overwrite: false,
                    transformation: isImage ? [{ quality: 'auto', fetch_format: 'auto' }] : undefined,
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error('[UPLOAD] Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                },
            );
            stream.end(buffer);
        });

        const prodId = typeof productId === 'string' && productId.length > 0 ? productId : null;

        if (isImage) {
            const createdImage = await prisma.image.create({
                data: {
                    image: uploadResult.secure_url as string,
                    secureUrl: uploadResult.secure_url as string,
                    publicId: uploadResult.public_id as string,
                    width: uploadResult.width as number | undefined,
                    height: uploadResult.height as number | undefined,
                    format: uploadResult.format as string | undefined,
                    bytes: uploadResult.bytes as number | undefined,
                    productId: prodId,
                },
            });
            if (prodId) {
                await invalidateProductAllCaches(prodId);
            }
            return NextResponse.json({ success: true, type: 'image', data: createdImage }, { status: 200 });
        } else {
            if (!prodId) {
                return NextResponse.json({ error: 'Product ID is required for video uploads' }, { status: 400 });
            }
            const createdVideo = await prisma.video.create({
                data: {
                    url: uploadResult.secure_url as string,
                    thumbnailUrl: uploadResult.secure_url?.replace(/\.[^/.]+$/, '.jpg') || null, // Generates static poster frame from video
                    productId: prodId,
                },
            });
            await invalidateProductAllCaches(prodId);
            return NextResponse.json({ success: true, type: 'video', data: createdVideo }, { status: 200 });
        }
    } catch (err) {
        console.error('[UPLOAD] Upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

// GET: list images AND videos by productId
export async function GET(req: NextRequest) {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
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
            orderBy: { sortOrder: 'asc' }, // Order by sortOrder ascending so custom sorting works
        });
        const videos = await prisma.video.findMany({
            where: { productId },
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json({ images, videos }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    // RBAC: Only SUPERADMIN, ADMIN, EDITOR can edit
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
        return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'setFeatured') {
            const { imageId, productId } = body;
            if (!imageId || !productId) {
                return NextResponse.json({ error: 'Image ID and Product ID are required' }, { status: 400 });
            }

            // Set all other images for this product as isFeatured: false
            await prisma.image.updateMany({
                where: { productId },
                data: { isFeatured: false }
            });

            // Set this image as isFeatured: true
            await prisma.image.update({
                where: { id: imageId },
                data: { isFeatured: true }
            });

            await invalidateProductAllCaches(productId);

            return NextResponse.json({ success: true }, { status: 200 });
        }

        if (action === 'reorder') {
            const { images } = body; // Array of { id, sortOrder }
            if (!Array.isArray(images)) {
                return NextResponse.json({ error: 'Images array is required for reordering' }, { status: 400 });
            }

            for (const item of images) {
                await prisma.image.update({
                    where: { id: item.id },
                    data: { sortOrder: item.sortOrder }
                });
            }

            if (images.length > 0) {
                const firstImg = await prisma.image.findUnique({
                    where: { id: images[0].id },
                    select: { productId: true }
                });
                if (firstImg?.productId) {
                    await invalidateProductAllCaches(firstImg.productId);
                }
            }

            return NextResponse.json({ success: true }, { status: 200 });
        }

        if (action === 'toggleVisibility') {
            const { imageId, isVisible } = body;
            if (!imageId) {
                return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
            }

            const updatedImage = await prisma.image.update({
                where: { id: imageId },
                data: { isVisible }
            });

            if (updatedImage.productId) {
                await invalidateProductAllCaches(updatedImage.productId);
            }

            return NextResponse.json({ success: true }, { status: 200 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (err) {
        console.error('[UPLOAD PATCH] error:', err);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
