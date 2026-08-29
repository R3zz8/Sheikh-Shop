import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { getCloudinary } from '@/lib/cloudinary-safe';

export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const portfolioSchema = z.object({
  title: z.string().min(1, 'عنوان نمونه‌کار الزامی است'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, 'تصویر پروژه الزامی است'),
  imagePublicId: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional().default([]),
  projectUrl: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const items = await prisma.webPortfolio.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[ADMIN_WEB_PORTFOLIO_GET_ERROR]', error);
    return NextResponse.json({ message: 'خطا در دریافت لیست نمونه‌کارها' }, { status: 500 });
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
        description: formData.get('description')?.toString() || null,
        projectUrl: formData.get('projectUrl')?.toString() || null,
        category: formData.get('category')?.toString() || null,
        displayOrder: formData.get('displayOrder') ? parseInt(formData.get('displayOrder')!.toString(), 10) : 0,
        isActive: formData.get('isActive')?.toString() !== 'false',
      };

      const techRaw = formData.get('technologies')?.toString();
      if (techRaw) {
        try {
          bodyData.technologies = JSON.parse(techRaw);
        } catch {
          bodyData.technologies = techRaw.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      if (file && file instanceof File) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return NextResponse.json({ message: 'فرمت فایل غیرمجاز است' }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json({ message: 'حجم تصویر بیش از حد مجاز است' }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const cloudinary = getCloudinary();

        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'digitalshop/web-portfolio',
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

    if (uploadedImageUrl) {
      bodyData.imageUrl = uploadedImageUrl;
      bodyData.imagePublicId = uploadedImagePublicId;
    }

    const validation = portfolioSchema.safeParse(bodyData);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const newItem = await prisma.webPortfolio.create({
      data: validation.data,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('[ADMIN_WEB_PORTFOLIO_POST_ERROR]', error);
    return NextResponse.json({ message: 'خطا در ایجاد نمونه‌کار' }, { status: 500 });
  }
}
