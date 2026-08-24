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

const itemSchema = z.object({
  title: z.string().max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد').nullable().optional(),
  imageUrl: z.string().min(1, 'تصویر کروسل الزامی است'),
  imagePublicId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const items = await prisma.bmwCarouselItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[BMW_CAROUSEL_ADMIN_GET]', error);
    return NextResponse.json({ message: 'خطا در دریافت تصاویر کروسل ۳بعدی' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');
      const title = formData.get('title')?.toString() || null;
      const sortOrderRaw = formData.get('sortOrder')?.toString();
      const isActiveRaw = formData.get('isActive')?.toString();

      const sortOrder = sortOrderRaw !== undefined && sortOrderRaw !== '' ? parseInt(sortOrderRaw, 10) : 0;
      const isActive = isActiveRaw !== undefined ? isActiveRaw === 'true' : true;

      if (!file || !(file instanceof File)) {
        return NextResponse.json({ message: 'فایل تصویر ارسال نشده است' }, { status: 400 });
      }

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
              console.error('[BMW_CAROUSEL_CLOUDINARY_UPLOAD_ERROR]', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(buffer);
      });

      const newItem = await prisma.bmwCarouselItem.create({
        data: {
          title,
          imageUrl: uploadResult.secure_url as string,
          imagePublicId: uploadResult.public_id as string,
          sortOrder,
          isActive,
        },
      });

      await cacheService.del('bmw_carousel_items_active');
      try {
        revalidatePath('/');
        revalidatePath('/dashboard/bmw-carousel');
      } catch (e) {
        // Ignore static generation context issues during tests
      }

      return NextResponse.json(newItem, { status: 201 });
    }

    const body = await req.json();
    const validation = itemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const { title, imageUrl, imagePublicId, sortOrder, isActive } = validation.data;

    const newItem = await prisma.bmwCarouselItem.create({
      data: {
        title: title || null,
        imageUrl,
        imagePublicId: imagePublicId || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    });

    await cacheService.del('bmw_carousel_items_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/bmw-carousel');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('[BMW_CAROUSEL_ADMIN_POST]', error);
    return NextResponse.json({ message: 'خطا در ایجاد تصویر جدید کروسل ۳بعدی' }, { status: 500 });
  }
}
