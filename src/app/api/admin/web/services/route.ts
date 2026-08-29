import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { getCloudinary } from '@/lib/cloudinary-safe';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const serviceSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(255),
  slug: z.string().min(1, 'اسلاگ الزامی است').max(255),
  shortDescription: z.string().min(1, 'توضیحات کوتاه الزامی است').max(500),
  fullDescription: z.string().optional().nullable(),
  startingPrice: z.number().int().nonnegative().default(0),
  previousPrice: z.number().int().optional().nullable(),
  currency: z.string().default('تومان'),
  isStartingFrom: z.boolean().default(true),
  features: z.array(z.string()).optional().default([]),
  estimatedDelivery: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  ctaText: z.string().optional().nullable(),
  ctaUrl: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const services = await prisma.webService.findMany({
      include: {
        packages: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('[ADMIN_WEB_SERVICES_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت لیست خدمات وب' }, { status: 500 });
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
    let bodyData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      bodyData = {
        title: formData.get('title')?.toString(),
        slug: formData.get('slug')?.toString(),
        shortDescription: formData.get('shortDescription')?.toString(),
        fullDescription: formData.get('fullDescription')?.toString() || null,
        startingPrice: formData.get('startingPrice') ? parseInt(formData.get('startingPrice')!.toString(), 10) : 0,
        previousPrice: formData.get('previousPrice') ? parseInt(formData.get('previousPrice')!.toString(), 10) : null,
        currency: formData.get('currency')?.toString() || 'تومان',
        isStartingFrom: formData.get('isStartingFrom')?.toString() === 'true',
        estimatedDelivery: formData.get('estimatedDelivery')?.toString() || null,
        icon: formData.get('icon')?.toString() || null,
        displayOrder: formData.get('displayOrder') ? parseInt(formData.get('displayOrder')!.toString(), 10) : 0,
        isActive: formData.get('isActive')?.toString() !== 'false',
        isFeatured: formData.get('isFeatured')?.toString() === 'true',
        ctaText: formData.get('ctaText')?.toString() || 'مشاهده و سفارش',
        ctaUrl: formData.get('ctaUrl')?.toString() || '/web#calculator',
        seoTitle: formData.get('seoTitle')?.toString() || null,
        seoDescription: formData.get('seoDescription')?.toString() || null,
      };

      const featuresRaw = formData.get('features')?.toString();
      if (featuresRaw) {
        try {
          bodyData.features = JSON.parse(featuresRaw);
        } catch {
          bodyData.features = featuresRaw.split('\n').map((s) => s.trim()).filter(Boolean);
        }
      }

      if (file && file instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json({ message: 'فرمت فایل غیرمجاز است. فقط JPG، PNG، WEBP و AVIF مجاز هستند.' }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: 'حجم تصویر بیش از حد مجاز است. حداکثر حجم ۵ مگابایت می‌باشد.' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cloudinary = getCloudinary();

        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'digitalshop/web-services',
              resource_type: 'image',
              transformation: [{ quality: 'auto', fetch_format: 'auto' }],
            },
            (error: any, result: any) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });

        uploadedImageUrl = uploadResult.secure_url as string;
        uploadedImagePublicId = uploadResult.public_id as string;
      }
    } else {
      bodyData = await req.json();
    }

    const validation = serviceSchema.safeParse(bodyData);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check duplicate slug
    const existing = await prisma.webService.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return NextResponse.json({ message: 'خدماتی با این اسلاگ قبلاً ثبت شده است' }, { status: 400 });
    }

    const newService = await prisma.webService.create({
      data: {
        ...data,
        imageUrl: uploadedImageUrl,
        imagePublicId: uploadedImagePublicId,
      },
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_WEB_SERVICES_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در ایجاد خدمت جدید' }, { status: 500 });
  }
}
