import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAccess } from '@/lib/checkAccess';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'شما دسترسی لازم برای این عملیات را ندارید.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی نامعتبر است.' }, { status: 400 });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد.' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'فایل تصویر ارسال نشده است.' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'فرمت تصویر نامعتبر است. فرمت‌های مجاز: JPG, PNG, WEBP, AVIF' }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: 'حجم تصویر نباید بیشتر از ۲ مگابایت باشد.' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinary = getCloudinary();
    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'digitalshop/categories',
          resource_type: 'image',
          overwrite: false,
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });

    const newImageUrl = uploadResult.secure_url as string;
    const newImagePublicId = uploadResult.public_id as string;
    const oldPublicId = existingCategory.imagePublicId;

    // Update DB with new image URL and publicId
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        image: newImageUrl,
        imagePublicId: newImagePublicId,
      }
    });

    // Destroy old asset safely AFTER DB update
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (destroyErr) {
        console.error('[CATEGORY IMAGE REPLACE] Failed to delete old asset from Cloudinary:', destroyErr);
      }
    }

    // Invalidate cache
    await cacheService.del('categories_list_false_false');
    await cacheService.del('categories_list_true_false');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/categories');
    } catch (e) {
      // Ignore static generation store missing in unit tests
    }

    return NextResponse.json({
      success: true,
      data: updatedCategory
    }, { status: 200 });

  } catch (error: any) {
    console.error('[CATEGORY IMAGE UPLOAD ERROR]:', error);
    return NextResponse.json({ error: error.message || 'خطا در بارگذاری تصویر دسته‌بندی.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await checkAccess(req, ['SUPERADMIN', 'ADMIN', 'EDITOR']);
    if (!allowed) {
      return NextResponse.json({ error: 'شما دسترسی لازم برای این عملیات را ندارید.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'شناسه دسته‌بندی نامعتبر است.' }, { status: 400 });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ error: 'دسته‌بندی یافت نشد.' }, { status: 404 });
    }

    // Every category MUST have exactly one image. Standalone deletion that leaves a category without an image is prohibited.
    return NextResponse.json({
      error: 'هر دسته‌بندی باید همواره دارای یک تصویر باشد. برای تغییر تصویر فعلی، لطفاً تصویر جدید بارگذاری کنید.'
    }, { status: 400 });

  } catch (error: any) {
    console.error('[CATEGORY IMAGE DELETE ERROR]:', error);
    return NextResponse.json({ error: 'خطا در عملیات تصویر دسته‌بندی.' }, { status: 500 });
  }
}
