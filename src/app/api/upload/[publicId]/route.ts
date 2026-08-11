import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // RBAC: Only SUPERADMIN, ADMIN, EDITOR can delete
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      console.warn('[UPLOAD DELETE RBAC] Unauthorized delete attempt');
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    const { publicId } = await params;
    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 });
    }

    // Find image to get productId before deletion for correct cache invalidation
    const imageRecord = await prisma.image.findFirst({
      where: { publicId: { equals: publicId } },
      select: { productId: true }
    });
    const productId = imageRecord?.productId;

    // Delete from Cloudinary first
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId);

    // Delete from database (publicId is optional field, match records that have it)
    await prisma.image.deleteMany({ where: { publicId: { equals: publicId } } });

    // Handle complete cache invalidation and static page revalidation
    if (productId) {
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
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Cloudinary delete error:', err);
    }
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
