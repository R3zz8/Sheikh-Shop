import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const slideSchema = z.object({
  title: z.string().min(1, 'عنوان ویترین تبلیغاتی الزامی است').max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد'),
  imageUrl: z.string().min(1, 'تصویر ویترین الزامی است'),
  imagePublicId: z.string().nullable().optional(),
  productId: z.string().min(1, 'محصول مرتبط الزامی است'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const slides = await prisma.marketingShowcaseSlide.findMany({
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
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error('[MARKETING_SHOWCASE_GET]', error);
    return NextResponse.json({ message: 'خطا در دریافت اسلایدهای ویترین تبلیغاتی' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = slideSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const { title, imageUrl, imagePublicId, productId, sortOrder, isActive } = validation.data;

    // Verify linked product existence
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: 'محصول انتخاب‌شده در دیتابیس یافت نشد.' }, { status: 404 });
    }

    const newSlide = await prisma.marketingShowcaseSlide.create({
      data: {
        title,
        imageUrl,
        imagePublicId: imagePublicId || null,
        productId,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
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

    // Invalidate Cache
    await cacheService.del('marketing_showcase_slides_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/marketing-showcase');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('[MARKETING_SHOWCASE_POST]', error);
    return NextResponse.json({ message: 'خطا در ایجاد اسلاید ویترین تبلیغاتی' }, { status: 500 });
  }
}
