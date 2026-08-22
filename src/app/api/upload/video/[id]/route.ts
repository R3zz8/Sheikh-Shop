import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('/upload/')) return null;
  const parts = url.split('/upload/')[1];
  if (!parts) return null;
  // Remove version prefix if present (e.g., v123456789/)
  const withoutVersion = parts.replace(/^v\d+\//, '');
  // Remove extension (e.g., .mp4, .webm)
  const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
  return publicId;
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Find video record to get url and productId
    const videoRecord = await prisma.video.findUnique({
      where: { id },
      select: { id: true, url: true, productId: true },
    });

    if (!videoRecord) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const productId = videoRecord.productId;

    // Destroy Cloudinary asset if publicId can be derived
    if (videoRecord.url) {
      const publicId = extractCloudinaryPublicId(videoRecord.url);
      if (publicId) {
        try {
          const cloudinary = getCloudinary();
          await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        } catch (cldErr) {
          console.error('[VIDEO DELETE] Cloudinary destroy error:', cldErr);
        }
      }
    }

    // Delete video from database
    await prisma.video.delete({ where: { id } });

    // Invalidate product caches and static pages
    if (productId) {
      try {
        await cacheService.invalidateProductCache(productId);
        invalidateProductCache(productId);

        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { slug: true },
        });

        revalidatePath('/dashboard/products');
        if (product?.slug) {
          revalidatePath(`/products/${product.slug}`);
        }
        revalidatePath(`/products/${productId}`);
        revalidatePath(`/product/${productId}`);
        revalidatePath('/');
      } catch (cacheErr) {
        console.error('[VIDEO DELETE] Cache invalidation error:', cacheErr);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[VIDEO DELETE] Error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
