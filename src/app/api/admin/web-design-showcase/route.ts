import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { getCloudinary } from '@/lib/cloudinary-safe';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const webDesignSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد'),
  description: z.string().min(1, 'توضیحات الزامی است'),
  services: z.array(z.string()).optional().default(['فروشگاهی', 'شرکتی', 'خدماتی', 'شخصی', 'اختصاصی']),
  ctaText: z.string().nullable().optional().default('مشاهده خدمات طراحی سایت'),
  ctaUrl: z.string().nullable().optional().default('/services/web-design'),
  isEnabled: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const item = await prisma.webDesignShowcase.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(item ?? null);
  } catch (error) {
    console.error('[WEB_DESIGN_SHOWCASE_ADMIN_GET]', error);
    return NextResponse.json({ message: 'خطا در دریافت تنظیمات خدمات طراحی سایت' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';

    let uploadedImageUrl: string | null = null;
    let uploadedImagePublicId: string | null = null;
    let title: string | undefined;
    let description: string | undefined;
    let services: string[] = ['فروشگاهی', 'شرکتی', 'خدماتی', 'شخصی', 'اختصاصی'];
    let ctaText: string | null = 'مشاهده خدمات طراحی سایت';
    let ctaUrl: string | null = '/services/web-design';
    let isEnabled: boolean = true;
    let removeImage: boolean = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      title = formData.get('title')?.toString();
      description = formData.get('description')?.toString();
      ctaText = formData.get('ctaText')?.toString() || ctaText;
      ctaUrl = formData.get('ctaUrl')?.toString() || ctaUrl;

      const servicesRaw = formData.get('services')?.toString();
      if (servicesRaw) {
        try {
          services = JSON.parse(servicesRaw);
        } catch (e) {
          services = servicesRaw.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }

      const isEnabledRaw = formData.get('isEnabled')?.toString();
      if (isEnabledRaw !== undefined) {
        isEnabled = isEnabledRaw === 'true';
      }

      const removeImageRaw = formData.get('removeImage')?.toString();
      if (removeImageRaw !== undefined) {
        removeImage = removeImageRaw === 'true';
      }

      if (file && file instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json(
            { message: 'فرمت فایل غیرمجاز است. فقط JPG، PNG، WEBP و AVIF مجاز هستند.' },
            { status: 400 }
          );
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json(
            { message: 'حجم تصویر بیش از حد مجاز است. حداکثر حجم ۵ مگابایت می‌باشد.' },
            { status: 413 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const cloudinary = getCloudinary();
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'digitalshop/web-design-showcase',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error: any, result: any) => {
              if (error) {
                console.error('[WEB_DESIGN_CLOUDINARY_UPLOAD_ERROR]', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });

        uploadedImageUrl = uploadResult.secure_url as string;
        uploadedImagePublicId = uploadResult.public_id as string;
      }
    } else {
      const body = await req.json();
      const validation = webDesignSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
          { status: 400 }
        );
      }

      title = validation.data.title;
      description = validation.data.description;
      services = validation.data.services;
      ctaText = validation.data.ctaText ?? null;
      ctaUrl = validation.data.ctaUrl ?? null;
      isEnabled = validation.data.isEnabled;

      if (body.imageUrl !== undefined) {
        uploadedImageUrl = body.imageUrl;
      }
      if (body.imagePublicId !== undefined) {
        uploadedImagePublicId = body.imagePublicId;
      }
      if (body.removeImage !== undefined) {
        removeImage = body.removeImage === true;
      }
    }

    if (!title || !description) {
      return NextResponse.json({ message: 'عنوان و توضیحات الزامی هستند' }, { status: 400 });
    }

    const existingItem = await prisma.webDesignShowcase.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let finalImageUrl = existingItem?.imageUrl || null;
    let finalImagePublicId = existingItem?.imagePublicId || null;

    if (uploadedImageUrl !== null) {
      finalImageUrl = uploadedImageUrl;
      finalImagePublicId = uploadedImagePublicId;
    } else if (removeImage) {
      finalImageUrl = null;
      finalImagePublicId = null;
    }

    let savedItem;
    if (existingItem) {
      savedItem = await prisma.webDesignShowcase.update({
        where: { id: existingItem.id },
        data: {
          title,
          description,
          services,
          imageUrl: finalImageUrl,
          imagePublicId: finalImagePublicId,
          ctaText,
          ctaUrl,
          isEnabled,
        },
      });

      // Delete old Cloudinary asset after successful DB update if replaced or removed
      if (existingItem.imagePublicId && (uploadedImagePublicId || removeImage) && existingItem.imagePublicId !== uploadedImagePublicId) {
        try {
          const cloudinary = getCloudinary();
          await cloudinary.uploader.destroy(existingItem.imagePublicId);
        } catch (destroyErr) {
          console.error('[WEB_DESIGN_CLOUDINARY_DELETE_ERROR]', destroyErr);
        }
      }
    } else {
      savedItem = await prisma.webDesignShowcase.create({
        data: {
          title,
          description,
          services,
          imageUrl: finalImageUrl,
          imagePublicId: finalImagePublicId,
          ctaText,
          ctaUrl,
          isEnabled,
        },
      });
    }

    await cacheService.del('web_design_showcase_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/web-design-showcase');
    } catch (e) {
      // Ignore static context issues in tests
    }

    return NextResponse.json(savedItem, { status: 200 });
  } catch (error) {
    console.error('[WEB_DESIGN_SHOWCASE_ADMIN_POST]', error);
    return NextResponse.json({ message: 'خطا در به روزرسانی خدمات طراحی سایت' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const existingItem = await prisma.webDesignShowcase.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (existingItem) {
      const oldPublicId = existingItem.imagePublicId;

      await prisma.webDesignShowcase.update({
        where: { id: existingItem.id },
        data: {
          imageUrl: null,
          imagePublicId: null,
        },
      });

      if (oldPublicId) {
        try {
          const cloudinary = getCloudinary();
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (destroyErr) {
          console.error('[WEB_DESIGN_CLOUDINARY_DELETE_ERROR]', destroyErr);
        }
      }
    }

    await cacheService.del('web_design_showcase_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/web-design-showcase');
    } catch (e) {
      // Ignore static context issues in tests
    }

    return NextResponse.json({ message: 'تصویر کارت با موفقیت حذف شد' }, { status: 200 });
  } catch (error) {
    console.error('[WEB_DESIGN_SHOWCASE_ADMIN_DELETE]', error);
    return NextResponse.json({ message: 'خطا در حذف تصویر کارت' }, { status: 500 });
  }
}
