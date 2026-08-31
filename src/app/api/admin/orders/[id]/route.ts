import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-auth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: true,
        transactions: true,
        referral: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('[Admin GET Order Detail Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const { status, paymentStatus, trackingCode } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Order status transition safety rule: prevent DELIVERED -> PENDING directly
    if (existingOrder.status === OrderStatus.DELIVERED && status === OrderStatus.PENDING) {
      return NextResponse.json(
        { success: false, error: 'تغییر وضعیت مستقیم از تحویل داده شد به در انتظار امکان‌پذیر نیست.' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status && Object.values(OrderStatus).includes(status)) {
      updateData.status = status as OrderStatus;
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    if (trackingCode !== undefined) {
      updateData.trackingCode = trackingCode ? String(trackingCode).trim() : null;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        items: true,
        transactions: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'سفارش با موفقیت به‌روزرسانی شد.',
    });
  } catch (error: any) {
    console.error('[Admin PATCH Order Error]', error);
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
