import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const updateSlideSchema = z.object({
  title: z.string().min(1, 'عنوان ویترین تبلیغاتی الزامی است').max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد').optional(),
  imageUrl: z.string().min(1, 'تصویر ویترین الزامی است').optional(),
  imagePublicId: z.string().nullable().optional(),
  productId: z.string().min(1, 'محصول مرتبط الزامی است').optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'شناسه اسلاید الزامی است' }, { status: 400 });
    }

    const existingSlide = await prisma.marketingShowcaseSlide.findUnique({
      where: { id },
    });

    if (!existingSlide) {
      return NextResponse.json({ message: 'اسلاید ویترین مورد نظر یافت نشد.' }, { status: 404 });
    }

    const body = await req.json();
    const validation = updateSlideSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Verify linked product if productId is being updated
    if (updateData.productId && updateData.productId !== existingSlide.productId) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: updateData.productId },
      });

      if (!existingProduct) {
        return NextResponse.json({ message: 'محصول جدید انتخاب‌شده در دیتابیس یافت نشد.' }, { status: 404 });
      }
    }

    const oldImagePublicId = existingSlide.imagePublicId;

    // 1. Database Update First
    const updatedSlide = await prisma.marketingShowcaseSlide.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    // 2. Safe Image Replacement Cleanup (only after DB update succeeds)
    if (
      updateData.imagePublicId !== undefined &&
      oldImagePublicId &&
      oldImagePublicId !== updateData.imagePublicId
    ) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (destroyErr) {
        console.error('[MARKETING_SHOWCASE_PATCH] Failed to destroy old Cloudinary asset:', destroyErr);
      }
    }

    // Invalidate Cache
    await cacheService.del('marketing_showcase_slides_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/marketing-showcase');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json(updatedSlide);
  } catch (error) {
    console.error('[MARKETING_SHOWCASE_PATCH]', error);
    return NextResponse.json({ message: 'خطا در ویرایش اسلاید ویترین تبلیغاتی' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'شناسه اسلاید الزامی است' }, { status: 400 });
    }

    const slide = await prisma.marketingShowcaseSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return NextResponse.json({ message: 'اسلاید ویترین مورد نظر یافت نشد.' }, { status: 404 });
    }

    // 1. Delete DB Record First
    await prisma.marketingShowcaseSlide.delete({
      where: { id },
    });

    // 2. Cleanup Cloudinary asset if public ID exists
    if (slide.imagePublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(slide.imagePublicId);
      } catch (destroyErr) {
        console.error('[MARKETING_SHOWCASE_DELETE] Failed to delete Cloudinary asset:', destroyErr);
      }
    }

    // Invalidate Cache
    await cacheService.del('marketing_showcase_slides_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/marketing-showcase');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json({ message: 'اسلاید ویترین با موفقیت حذف شد.' });
  } catch (error) {
    console.error('[MARKETING_SHOWCASE_DELETE]', error);
    return NextResponse.json({ message: 'خطا در حذف اسلاید ویترین تبلیغاتی' }, { status: 500 });
  }
}
