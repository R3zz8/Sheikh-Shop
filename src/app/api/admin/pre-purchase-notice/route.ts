import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { prisma } from '@/utils/prisma';
import { cacheService } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';
import { getPrePurchaseNoticeAdmin } from '@/lib/services/getPrePurchaseNotice';

export const dynamic = 'force-dynamic';

const noticeSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(255, 'عنوان نباید بیش از ۲۵۵ کاراکتر باشد'),
  message: z.string().min(1, 'متن اطلاعیه الزامی است'),
  phoneNumber: z.string().min(1, 'شماره تماس الزامی است').max(30, 'شماره تماس نامعتبر است'),
  isEnabled: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const item = await getPrePurchaseNoticeAdmin();
    return NextResponse.json(item ?? null);
  } catch (error) {
    console.error('[PRE_PURCHASE_NOTICE_ADMIN_GET]', error);
    return NextResponse.json({ message: 'خطا در دریافت تنظیمات اطلاعیه' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.ADMIN)) {
      return NextResponse.json({ message: 'دسترسی غیرمجاز. فقط ادمین اجازه دسترسی دارد.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = noticeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors, message: validation.error.errors[0]?.message || 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const { title, message, phoneNumber, isEnabled } = validation.data;

    const existingItem = await prisma.prePurchaseNotice.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let savedItem;
    if (existingItem) {
      savedItem = await prisma.prePurchaseNotice.update({
        where: { id: existingItem.id },
        data: {
          title,
          message,
          phoneNumber,
          isEnabled,
          updatedBy: user.email || user.id,
        },
      });
    } else {
      savedItem = await prisma.prePurchaseNotice.create({
        data: {
          title,
          message,
          phoneNumber,
          isEnabled,
          updatedBy: user.email || user.id,
        },
      });
    }

    // Invalidate Redis cache
    await cacheService.del('pre_purchase_notice_active');

    try {
      revalidatePath('/');
      revalidatePath('/dashboard/pre-purchase-notice');
    } catch (e) {
      // Ignore static context revalidation issues during tests
    }

    return NextResponse.json(savedItem, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PRE_PURCHASE_NOTICE_ADMIN_POST]', errorMessage, error);
    return NextResponse.json(
      {
        message: 'خطا در به روزرسانی اطلاعیه پیش از خرید',
        ...(process.env.NODE_ENV === 'development' ? { error: errorMessage } : {}),
      },
      { status: 500 }
    );
  }
}
