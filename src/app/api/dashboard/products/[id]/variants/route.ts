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
    const { variants } = body;

    if (!Array.isArray(variants)) {
      return NextResponse.json(
        { error: 'فرمت داده‌های ارسالی تنوع‌ها نامعتبر است' },
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

    // Execute atomic product variants sync inside a transaction
    await prisma.$transaction(async (tx: any) => {
      // 1. Fetch existing ProductUnit records for this product
      const existingUnits = await tx.productUnit.findMany({
        where: { productId },
        include: { values: true },
      });

      const existingUnitIds = existingUnits.map((u: any) => u.id);
      const incomingUnitIds = variants.map((v: any) => v.id).filter(Boolean);

      // Determine units to delete (existing units not present in incoming payload)
      const toDeleteUnitIds = existingUnitIds.filter((id: string) => !incomingUnitIds.includes(id));

      if (toDeleteUnitIds.length > 0) {
        await tx.productUnit.deleteMany({
          where: {
            id: { in: toDeleteUnitIds },
            productId,
          },
        });
      }

      // Process each incoming variant
      for (const variant of variants) {
        const { id, name, price, oldPrice, sku, stock, isActive, attributeValueIds } = variant;

        let unitId = id;

        if (id && existingUnitIds.includes(id)) {
          // Update existing ProductUnit record
          await tx.productUnit.update({
            where: { id },
            data: {
              name,
              price: price,
              oldPrice: oldPrice || null,
              sku: sku || null,
              stock: stock,
              isActive: isActive !== false,
            },
          });
        } else {
          // Create a completely new ProductUnit record
          const createdUnit = await tx.productUnit.create({
            data: {
              productId,
              name,
              price: price,
              oldPrice: oldPrice || null,
              sku: sku || null,
              stock: stock,
              isActive: isActive !== false,
            },
          });
          unitId = createdUnit.id;
        }

        // Synchronize ProductUnitValue mappings for this variant
        if (Array.isArray(attributeValueIds)) {
          const existingMappings = await tx.productUnitValue.findMany({
            where: { productUnitId: unitId },
          });

          const existingValIds = existingMappings.map((m: any) => m.attributeValueId);

          const toDeleteVals = existingValIds.filter((valId: string) => !attributeValueIds.includes(valId));
          const toAddVals = attributeValueIds.filter((valId: string) => !existingValIds.includes(valId));

          // Delete obsolete mappings
          if (toDeleteVals.length > 0) {
            await tx.productUnitValue.deleteMany({
              where: {
                productUnitId: unitId,
                attributeValueId: { in: toDeleteVals },
              },
            });
          }

          // Create new mappings
          if (toAddVals.length > 0) {
            // Filter to make sure attributeValue exists to prevent foreign key errors
            const validAttrVals = await tx.attributeValue.findMany({
              where: { id: { in: toAddVals } },
              select: { id: true },
            });
            const validAttrValIds = validAttrVals.map((v: any) => v.id);

            if (validAttrValIds.length > 0) {
              await tx.productUnitValue.createMany({
                data: validAttrValIds.map((attributeValueId: string) => ({
                  productUnitId: unitId,
                  attributeValueId,
                })),
              });
            }
          }
        }
      }
    });

    // Proactive Cache Invalidation
    try {
      await cacheService.invalidateProductCache(productId);
      invalidateProductCache(productId);
      revalidatePath(`/products/${product.slug}`);
      revalidatePath(`/dashboard/products/${productId}`);
    } catch (cacheError) {
      console.error('[API_PRODUCT_VARIANTS_CACHE_INVALIDATION] Non-blocking cache error:', cacheError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API_POST_PRODUCT_VARIANTS] Error:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره‌سازی تنوع‌های کالا' },
      { status: 500 }
    );
  }
}