import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { processBackInStockNotifications } from '@/lib/notifications';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز است.' }, { status: 403 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        quantity: true,
        inventoryStatus: true,
        lowStockThreshold: true,
        allowBackInStockNotification: true,
        _count: {
          select: {
            backInStockSubscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('[Admin GET Inventory Error]', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز است.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      select: { quantity: true, inventoryStatus: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'محصول یافت نشد.' }, { status: 404 });
    }

    const updateData: any = {};

    if (typeof body.quantity === 'number' && body.quantity >= 0) {
      updateData.quantity = body.quantity;
    }

    if (body.inventoryStatus) {
      updateData.inventoryStatus = body.inventoryStatus;
    }

    if (typeof body.lowStockThreshold === 'number' && body.lowStockThreshold >= 0) {
      updateData.lowStockThreshold = body.lowStockThreshold;
    }

    if (typeof body.allowBackInStockNotification === 'boolean') {
      updateData.allowBackInStockNotification = body.allowBackInStockNotification;
    }

    // Auto update inventory status if quantity reaches 0 or becomes positive
    const newQuantity = updateData.quantity !== undefined ? updateData.quantity : existing.quantity;
    if (newQuantity === 0 && !updateData.inventoryStatus) {
      updateData.inventoryStatus = 'OUT_OF_STOCK';
    } else if (newQuantity > 0 && existing.quantity === 0 && !updateData.inventoryStatus) {
      updateData.inventoryStatus = 'AVAILABLE';
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Invalidate cache and revalidate paths
    await cacheService.invalidateProductCache(id);
    if (existing.slug) {
      revalidatePath(`/products/${existing.slug}`);
    }
    revalidatePath('/');

    // Check if product went from out-of-stock to restocked
    const wasOutOfStock = existing.quantity === 0 || existing.inventoryStatus === 'OUT_OF_STOCK';
    const isNowAvailable = updatedProduct.quantity > 0 && updatedProduct.inventoryStatus === 'AVAILABLE';

    let notificationResult = null;
    if (wasOutOfStock && isNowAvailable) {
      notificationResult = await processBackInStockNotifications(id);
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      restockNotification: notificationResult,
    });
  } catch (error: any) {
    console.error('[Admin PATCH Inventory Error]', error);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  }
}
