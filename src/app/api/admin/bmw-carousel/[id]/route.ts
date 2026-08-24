import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const updateItemSchema = z.object({
  title: z.string().max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد').nullable().optional(),
  imageUrl: z.string().min(1, 'تصویر کروسل الزامی است').optional(),
  imagePublicId: z.string().nullable().optional(),
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
      return NextResponse.json({ message: 'شناسه تصویر الزامی است' }, { status: 400 });
    }

    const existingItem = await prisma.bmwCarouselItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json({ message: 'تصویر کروسل مورد نظر یافت نشد.' }, { status: 404 });
    }

    const oldImagePublicId = existingItem.imagePublicId;
    const contentType = req.headers.get('content-type') || '';

    let updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const titleRaw = formData.get('title');
      const sortOrderRaw = formData.get('sortOrder')?.toString();
      const isActiveRaw = formData.get('isActive')?.toString();

      if (titleRaw !== null && titleRaw !== undefined) {
        updateData.title = titleRaw.toString();
      }
      if (sortOrderRaw !== undefined && sortOrderRaw !== '') {
        updateData.sortOrder = parseInt(sortOrderRaw, 10);
      }
      if (isActiveRaw !== undefined) {
        updateData.isActive = isActiveRaw === 'true';
      }

      if (file && file instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json({ message: 'فرمت فایل غیرمجاز است. فقط JPG، PNG و WEBP مجاز هستند.' }, { status: 400 });
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: 'حجم تصویر بیش از حد مجاز است. حداکثر حجم ۲ مگابایت می‌باشد.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudinary = getCloudinary();
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'digitalshop/bmw-carousel',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error: any, result: any) => {
              if (error) {
                console.error('[BMW_CAROUSEL_CLOUDINARY_REPLACE_ERROR]', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });

        updateData.imageUrl = uploadResult.secure_url as string;
        updateData.imagePublicId = uploadResult.public_id as string;
      }
    } else {
      const body = await req.json();
      const validation = updateItemSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
          { status: 400 }
        );
      }
      updateData = validation.data;
    }

    // 1. Database Update First
    const updatedItem = await prisma.bmwCarouselItem.update({
      where: { id },
      data: updateData,
    });

    // 2. Safe Cloudinary Cleanup (only after DB update succeeds)
    if (
      updateData.imagePublicId !== undefined &&
      oldImagePublicId &&
      oldImagePublicId !== updateData.imagePublicId
    ) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(oldImagePublicId);
      } catch (destroyErr) {
        console.error('[BMW_CAROUSEL_PATCH] Failed to destroy old Cloudinary asset:', destroyErr);
      }
    }

    await cacheService.del('bmw_carousel_items_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/bmw-carousel');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('[BMW_CAROUSEL_ADMIN_PATCH]', error);
    return NextResponse.json({ message: 'خطا در ویرایش تصویر کروسل ۳بعدی' }, { status: 500 });
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
      return NextResponse.json({ message: 'شناسه تصویر الزامی است' }, { status: 400 });
    }

    const item = await prisma.bmwCarouselItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ message: 'تصویر کروسل مورد نظر یافت نشد.' }, { status: 404 });
    }

    // 1. Delete DB Record First
    await prisma.bmwCarouselItem.delete({
      where: { id },
    });

    // 2. Cleanup Cloudinary asset if public ID exists
    if (item.imagePublicId) {
      try {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(item.imagePublicId);
      } catch (destroyErr) {
        console.error('[BMW_CAROUSEL_DELETE] Failed to delete Cloudinary asset:', destroyErr);
      }
    }

    await cacheService.del('bmw_carousel_items_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/bmw-carousel');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json({ message: 'تصویر کروسل ۳بعدی با موفقیت حذف شد.' });
  } catch (error) {
    console.error('[BMW_CAROUSEL_ADMIN_DELETE]', error);
    return NextResponse.json({ message: 'خطا در حذف تصویر کروسل ۳بعدی' }, { status: 500 });
  }
}
