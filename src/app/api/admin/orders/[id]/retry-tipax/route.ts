import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { TipaxClient } from '@/lib/tipax/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'دسترسی غیرمجاز (نیازمند نقش مدیریت)' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'سفارش مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    const shippingAddr = (order.shippingAddress as Record<string, any>) || {};
    const existingTipaxOrderId = shippingAddr.tipaxOrderId;

    // Strict idempotency guard: prevent duplicate shipments if trackingCode or tipaxOrderId already exists
    if (order.trackingCode || existingTipaxOrderId) {
      return NextResponse.json({
        success: true,
        alreadyRegistered: true,
        trackingCode: order.trackingCode || existingTipaxOrderId,
        message: 'این سفارش قبلاً در سامانه تیپاکس ثبت گردیده است.',
      });
    }

    // Attempt Tipax order registration
    const tipaxResult = await TipaxClient.createOrder({
      orderId: order.id,
      recipientName:
        shippingAddr.recipientName ||
        `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() ||
        'مشتری',
      recipientPhone: shippingAddr.recipientPhone || shippingAddr.phone || '09000000000',
      recipientMobile: shippingAddr.phone || shippingAddr.recipientPhone,
      recipientEmail: shippingAddr.email,
      province: shippingAddr.province || 'تهران',
      city: shippingAddr.city || 'تهران',
      address: shippingAddr.address || 'تهران',
      postalCode: shippingAddr.postalCode || '1111111111',
      totalValueToman: Number(order.subtotal) || Number(order.total) || 1000000,
      items: order.items.map((i: any) => ({
        productName: i.productName || undefined,
        quantity: i.quantity,
        priceToman: Number(i.price) || 0,
      })),
      orderNotes: shippingAddr.orderNotes,
    });

    if (tipaxResult.success && (tipaxResult.trackingCode || tipaxResult.tipaxOrderId)) {
      const trackingCode = tipaxResult.trackingCode || tipaxResult.tipaxOrderId;
      const updatedAddress = {
        ...shippingAddr,
        tipaxOrderId: tipaxResult.tipaxOrderId || trackingCode,
        tipaxStatus: 'REGISTERED',
        tipaxRegisteredAt: new Date().toISOString(),
        tipaxError: null,
      };

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingCode,
          shippingAddress: updatedAddress,
        },
      });

      return NextResponse.json({
        success: true,
        trackingCode,
        tipaxOrderId: tipaxResult.tipaxOrderId || trackingCode,
        order: updatedOrder,
        message: 'سفارش با موفقیت مجدداً در سامانه تیپاکس ثبت شد.',
      });
    } else {
      const updatedAddress = {
        ...shippingAddr,
        tipaxStatus: 'FAILED',
        tipaxError: tipaxResult.error || tipaxResult.message || 'خطا در ثبت سفارش در تیپاکس',
        tipaxFailedAt: new Date().toISOString(),
      };

      await prisma.order.update({
        where: { id: order.id },
        data: {
          shippingAddress: updatedAddress,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: tipaxResult.error || 'ارتباط با تیپاکس موفقیت‌آمیز نبود',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[Admin Retry Tipax Order Error]', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'خطای سرور در تلاش مجدد ثبت مرسوله تیپاکس',
      },
      { status: 500 }
    );
  }
}
