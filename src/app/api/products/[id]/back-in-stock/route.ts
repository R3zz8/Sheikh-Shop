import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { normalizePersianDigits, isValidIranianMobile } from '@/lib/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const user = await getServerUser();
    const body = await request.json().catch(() => ({}));

    let rawEmail = body.email ? String(body.email).trim().toLowerCase() : null;
    let rawPhone = body.phone || body.mobile ? String(body.phone || body.mobile).trim() : null;

    if (rawPhone) {
      rawPhone = normalizePersianDigits(rawPhone);
      if (!isValidIranianMobile(rawPhone)) {
        return NextResponse.json(
          { error: 'شماره موبایل وارد شده معتبر نیست.' },
          { status: 400 }
        );
      }
    }

    if (!user && !rawEmail && !rawPhone) {
      return NextResponse.json(
        { error: 'لطفاً ایمیل یا شماره موبایل خود را وارد کنید.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, allowBackInStockNotification: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'محصول یافت نشد.' }, { status: 404 });
    }

    if (!product.allowBackInStockNotification) {
      return NextResponse.json(
        { error: 'اطلاع‌رسانی موجودی برای این محصول فعال نیست.' },
        { status: 400 }
      );
    }

    // Duplicate active subscription checks
    if (user?.id) {
      const existingUserSub = await prisma.backInStockSubscription.findFirst({
        where: {
          productId,
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      if (existingUserSub) {
        return NextResponse.json(
          { message: 'درخواست اطلاع‌رسانی شما قبلاً ثبت شده است.', subscription: existingUserSub },
          { status: 200 }
        );
      }
    }

    if (rawEmail) {
      const existingEmailSub = await prisma.backInStockSubscription.findFirst({
        where: {
          productId,
          email: rawEmail,
          status: 'ACTIVE',
        },
      });

      if (existingEmailSub) {
        return NextResponse.json(
          { message: 'درخواست اطلاع‌رسانی با این ایمیل قبلاً ثبت شده است.', subscription: existingEmailSub },
          { status: 200 }
        );
      }
    }

    if (rawPhone) {
      const existingPhoneSub = await prisma.backInStockSubscription.findFirst({
        where: {
          productId,
          phone: rawPhone,
          status: 'ACTIVE',
        },
      });

      if (existingPhoneSub) {
        return NextResponse.json(
          { message: 'درخواست اطلاع‌رسانی با این شماره قبلاً ثبت شده است.', subscription: existingPhoneSub },
          { status: 200 }
        );
      }
    }

    const newSub = await prisma.backInStockSubscription.create({
      data: {
        productId,
        userId: user?.id || null,
        email: rawEmail || (user?.email ? user.email.toLowerCase() : null),
        phone: rawPhone || null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'درخواست شما با موفقیت ثبت شد. به محض موجود شدن محصول به شما اطلاع می‌دهیم.',
      subscription: newSub,
    });
  } catch (error: any) {
    console.error('[BackInStock POST Error]', error);
    return NextResponse.json(
      { error: 'خطایی در ثبت درخواست رخ داد.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const user = await getServerUser();
    const body = await request.json().catch(() => ({}));

    const email = body.email ? String(body.email).trim().toLowerCase() : user?.email?.toLowerCase();
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!user && !email && !phone) {
      return NextResponse.json({ error: 'کاربر احراز هویت نشده است.' }, { status: 401 });
    }

    await prisma.backInStockSubscription.updateMany({
      where: {
        productId,
        OR: [
          user?.id ? { userId: user.id } : {},
          email ? { email } : {},
          phone ? { phone } : {},
        ].filter((cond) => Object.keys(cond).length > 0),
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'درخواست اطلاع‌رسانی با موفقیت لغو شد.',
    });
  } catch (error: any) {
    console.error('[BackInStock DELETE Error]', error);
    return NextResponse.json({ error: 'خطا در لغو درخواست.' }, { status: 500 });
  }
}
