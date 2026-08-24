import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      sortOrder: z.number().int(),
    })
  ).min(1, 'حداقل یک آیتم برای مرتب‌سازی لازم است'),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || user.role !== UserRole.SUPERADMIN) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط سوپر ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = reorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: 'چیدمان ارسالی معتبر نیست' },
        { status: 400 }
      );
    }

    const { items } = validation.data;

    await prisma.$transaction(
      items.map((item) =>
        prisma.bmwCarouselItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    await cacheService.del('bmw_carousel_items_active');
    try {
      revalidatePath('/');
      revalidatePath('/dashboard/bmw-carousel');
    } catch (e) {
      // Ignore static generation context issues during tests
    }

    return NextResponse.json({ message: 'ترتیب تصاویر با موفقیت بروزرسانی شد' });
  } catch (error) {
    console.error('[BMW_CAROUSEL_REORDER_PATCH]', error);
    return NextResponse.json({ message: 'خطا در جابه‌جایی و مرتب‌سازی تصاویر' }, { status: 500 });
  }
}
