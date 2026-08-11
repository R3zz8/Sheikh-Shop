import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userRole = request.headers.get('x-user-role');
    if (!userRole || !['SUPERADMIN', 'ADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { id: productId } = await params;
    if (!productId) {
      return NextResponse.json({ error: 'شناسه کالا نامعتبر است' }, { status: 400 });
    }

    const body = await request.json();
    const { attributeIds } = body;

    if (!Array.isArray(attributeIds)) {
      return NextResponse.json(
        { error: 'فرمت داده‌های ارسالی ویژگی‌ها نامعتبر است' },
        { status: 400 }
      );
    }

    // Verify product existence
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'کالا یافت نشد' }, { status: 404 });
    }

    // Perform atomic synchronization of assigned attributes inside a transaction
    await prisma.$transaction(async (tx: any) => {
      // Fetch currently assigned attributes
      const existingProductAttributes = await tx.productAttribute.findMany({
        where: { productId },
      });

      const existingAttrIds = existingProductAttributes.map((pa: any) => pa.attributeId);

      // Determine additions and deletions
      const toDelete = existingAttrIds.filter((id: string) => !attributeIds.includes(id));
      const toAdd = attributeIds.filter((id: string) => !existingAttrIds.includes(id));

      // 1. Delete removed product attributes
      if (toDelete.length > 0) {
        await tx.productAttribute.deleteMany({
          where: {
            productId,
            attributeId: { in: toDelete },
          },
        });
      }

      // 2. Add new product attributes
      if (toAdd.length > 0) {
        await tx.productAttribute.createMany({
          data: toAdd.map((attributeId: string) => ({
            productId,
            attributeId,
          })),
        });
      }
    });

    // Proactive Cache Invalidation
    try {
      await cacheService.invalidateProductCache(productId);
      invalidateProductCache(productId);
      revalidatePath(`/products/${product.slug}`);
      revalidatePath(`/dashboard/products/${productId}`);
    } catch (cacheError) {
      console.error('[API_PRODUCT_ATTRIBUTES_CACHE_INVALIDATION] Non-blocking cache error:', cacheError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API_POST_PRODUCT_ATTRIBUTES] Error:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره‌سازی ویژگی‌های کالا' },
      { status: 500 }
    );
  }
}