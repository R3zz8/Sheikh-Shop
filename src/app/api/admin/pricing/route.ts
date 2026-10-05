import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { cacheService } from '@/lib/cache/redis';
import { invalidateProductCache } from '@/lib/cache';
import { revalidatePath } from 'next/cache';
import { InventoryStatus, ProductStatus } from '@prisma/client';

function normalizeCode(rawCode: string): string {
  if (!rawCode) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return rawCode
    .trim()
    .split('')
    .map((c) => {
      const pIdx = persianDigits.indexOf(c);
      if (pIdx !== -1) return String(pIdx);
      const aIdx = arabicDigits.indexOf(c);
      if (aIdx !== -1) return String(aIdx);
      return c;
    })
    .join('');
}

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز. فقط مدیران سیستم مجاز به استفاده از این بخش هستند.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get('code');

    if (!rawCode || !rawCode.trim()) {
      return NextResponse.json({ success: false, error: 'لطفاً کد محصول را وارد کنید.' }, { status: 400 });
    }

    const code = normalizeCode(rawCode);

    // Exact search by SKU / product code
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { sku: { equals: code, mode: 'insensitive' } },
          { id: { equals: code, mode: 'insensitive' } },
        ],
      },
      include: {
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
            isFeatured: true,
          },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        error: `محصولی با کد "${code}" پیدا نشد.`,
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        quantity: product.quantity,
        inventoryStatus: product.inventoryStatus,
        status: product.status,
        category: product.category,
        categoryType: product.categoryType,
        slug: product.slug,
        brand: product.brand,
        image: product.images[0]?.secureUrl || product.images[0]?.image || null,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Admin GET Pricing Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'خطای سرور در بازخوانی اطلاعات قیمت.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز.' }, { status: 403 });
    }

    const body = await req.json();
    const { code: rawCode, productId, basePrice, quantity, inventoryStatus, status } = body;

    let targetProduct = null;

    if (productId) {
      targetProduct = await prisma.product.findUnique({
        where: { id: productId },
      });
    } else if (rawCode) {
      const code = normalizeCode(rawCode);
      targetProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: { equals: code, mode: 'insensitive' } },
            { id: { equals: code, mode: 'insensitive' } },
          ],
        },
      });
    }

    if (!targetProduct) {
      return NextResponse.json({ success: false, error: 'محصول مورد نظر یافت نشد.' }, { status: 404 });
    }

    // Input Validation
    const parsedPrice = typeof basePrice === 'number' ? basePrice : parseFloat(basePrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ success: false, error: 'قیمت پایه باید یک عدد معتبر و بزرگتر یا مساوی صفر باشد.' }, { status: 400 });
    }

    const parsedQuantity = typeof quantity === 'number' ? quantity : parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return NextResponse.json({ success: false, error: 'موجودی انبار باید یک عدد صحیح معتبر باشد.' }, { status: 400 });
    }

    const validInventoryStatuses: InventoryStatus[] = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'COMING_SOON', 'DISCONTINUED'];
    if (inventoryStatus && !validInventoryStatuses.includes(inventoryStatus)) {
      return NextResponse.json({ success: false, error: 'وضعیت موجودی نامعتبر است.' }, { status: 400 });
    }

    const validProductStatuses: ProductStatus[] = ['ACTIVE', 'INACTIVE', 'DRAFT'];
    if (status && !validProductStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'وضعیت انتشار محصول نامعتبر است.' }, { status: 400 });
    }

    // Auto-derive effective inventoryStatus if quantity changes and inventoryStatus not explicitly given
    let finalInventoryStatus = inventoryStatus || targetProduct.inventoryStatus;
    if (!inventoryStatus && parsedQuantity !== targetProduct.quantity) {
      if (parsedQuantity === 0) {
        finalInventoryStatus = 'OUT_OF_STOCK';
      } else if (parsedQuantity <= targetProduct.lowStockThreshold) {
        finalInventoryStatus = 'LOW_STOCK';
      } else {
        finalInventoryStatus = 'AVAILABLE';
      }
    }

    // Atomic update
    const updatedProduct = await prisma.product.update({
      where: { id: targetProduct.id },
      data: {
        basePrice: parsedPrice,
        quantity: parsedQuantity,
        inventoryStatus: finalInventoryStatus,
        ...(status ? { status } : {}),
      },
      include: {
        images: {
          select: {
            id: true,
            image: true,
            secureUrl: true,
          },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    // Audit trail logging
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PRICING_UPDATED',
          metadata: {
            productId: updatedProduct.id,
            productName: updatedProduct.name,
            productCode: updatedProduct.sku,
            previous: {
              basePrice: targetProduct.basePrice,
              quantity: targetProduct.quantity,
              inventoryStatus: targetProduct.inventoryStatus,
              status: targetProduct.status,
            },
            new: {
              basePrice: updatedProduct.basePrice,
              quantity: updatedProduct.quantity,
              inventoryStatus: updatedProduct.inventoryStatus,
              status: updatedProduct.status,
            },
          },
        },
      });
    } catch (auditErr) {
      console.warn('[Pricing AuditLog Warning]', auditErr);
    }

    // Cache invalidations & Path revalidations
    await cacheService.invalidateProductCache(updatedProduct.id);
    invalidateProductCache(updatedProduct.id);

    revalidatePath('/dashboard/pricing');
    revalidatePath('/dashboard/products');
    revalidatePath('/');
    if (updatedProduct.slug) {
      revalidatePath(`/products/${updatedProduct.slug}`);
    }
    revalidatePath(`/products/${updatedProduct.id}`);

    return NextResponse.json({
      success: true,
      message: 'قیمت و وضعیت موجودی محصول با موفقیت در سیستم ثبت شد.',
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        basePrice: updatedProduct.basePrice,
        quantity: updatedProduct.quantity,
        inventoryStatus: updatedProduct.inventoryStatus,
        status: updatedProduct.status,
        category: updatedProduct.category,
        categoryType: updatedProduct.categoryType,
        slug: updatedProduct.slug,
        brand: updatedProduct.brand,
        image: updatedProduct.images[0]?.secureUrl || updatedProduct.images[0]?.image || null,
        updatedAt: updatedProduct.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[Admin PATCH Pricing Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'خطا در ثبت تغییرات قیمت.' }, { status: 500 });
  }
}
