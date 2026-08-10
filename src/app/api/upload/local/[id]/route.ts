import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // RBAC: Only SUPERADMIN, ADMIN, EDITOR can delete
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      console.warn('[UPLOAD DELETE LOCAL RBAC] Unauthorized delete attempt');
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Find the image first
    const image = await prisma.image.findUnique({
      where: { id },
      select: { id: true, image: true, publicId: true, productId: true }
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete local file if it exists and is not a Cloudinary URL
    if (image.image && !image.image.startsWith('http') && !image.publicId) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const imagePath = path.join(process.cwd(), 'public', image.image);
        await fs.unlink(imagePath);
      } catch (fileError) {
        // Continue even if file doesn't exist
        console.warn('Could not delete local image file:', image.image);
      }
    }

    // Delete from database
    await prisma.image.delete({
      where: { id }
    });

    // Handle complete cache invalidation and static page revalidation
    if (image.productId) {
      await cacheService.invalidateProductCache(image.productId);
      invalidateProductCache(image.productId);

      const product = await prisma.product.findUnique({
        where: { id: image.productId },
        select: { slug: true }
      });

      revalidatePath('/dashboard/products');
      if (product?.slug) {
        revalidatePath(`/products/${product.slug}`);
      }
      revalidatePath(`/products/${image.productId}`);
      revalidatePath(`/product/${image.productId}`);
      revalidatePath('/');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Local image delete error:', err);
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
