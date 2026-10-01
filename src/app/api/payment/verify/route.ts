import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifyZarinPalPayment } from '@/lib/payment/zarinpal';
import { atomicDecrementProductStock } from '@/lib/inventory';
import { TipaxClient } from '@/lib/tipax/client';

const paymentVerifySchema = z.object({
  authority: z.string().min(1, 'Authority is required'),
  status: z.union([z.string(), z.number()]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validationResult = paymentVerifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'شناسه ارجاع پرداخت نامعتبر است.',
        },
        { status: 400 }
      );
    }

    const { authority, status } = validationResult.data;
    const statusStr = status ? String(status) : null;

    // Look up transaction and associated order
    const transaction = await prisma.transaction.findUnique({
      where: { authority },
      include: {
        order: {
          include: {
            items: true,
            referral: true,
          },
        },
      },
    });

    if (!transaction || !transaction.order) {
      return NextResponse.json(
        {
          success: false,
          error: 'سفارش یا تراکنش مربوط به این پرداخت یافت نشد.',
        },
        { status: 404 }
      );
    }

    const order = transaction.order;

    // If payment status from gateway callback param is not OK
    if (statusStr && statusStr !== 'OK' && statusStr !== '100' && statusStr !== 'success') {
      await prisma.transaction.update({
        where: { authority },
        data: { status: 'CANCELLED' },
      }).catch(() => null);

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      }).catch(() => null);

      return NextResponse.json(
        {
          success: false,
          error: 'پرداخت توسط کاربر لغو شد.',
        },
        { status: 400 }
      );
    }

    const trustedAmountToman = Number(order.totalPrice) || Number(order.total) || transaction.amount;

    // Fast-path: Order is already paid (idempotent response)
    if (
      (order.status === 'COMPLETED' || order.status === 'PROCESSING' || order.paymentStatus === 'PAID') &&
      transaction.status === 'COMPLETED'
    ) {
      return NextResponse.json({
        success: true,
        message: 'پرداخت قبلاً با موفقیت انجام و ثبت شده است.',
        authority,
        reference: transaction.reference || '0',
        orderId: order.id,
        amount: trustedAmountToman,
      });
    }

    // Call ZarinPal server-to-server payment verification
    const verifyResult = await verifyZarinPalPayment({
      amountToman: trustedAmountToman,
      authority,
    });

    const verifyData = verifyResult.data;
    const isSuccessCode = verifyData && (verifyData.code === 100 || verifyData.code === 101);

    if (isSuccessCode) {
      const refId = String(verifyData.ref_id || transaction.reference || '0');

      // Atomic DB state updates
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const currentOrder = await tx.order.findUnique({
          where: { id: order.id },
        });

        if (currentOrder?.status === 'COMPLETED' || currentOrder?.paymentStatus === 'PAID') {
          return;
        }

        // 1. Update Transaction
        await tx.transaction.update({
          where: { authority },
          data: {
            status: 'COMPLETED',
            reference: refId,
          },
        });

        // 2. Update Order
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'PROCESSING',
          },
        });

        // 3. Decrement stock
        for (const item of order.items) {
          try {
            await atomicDecrementProductStock(item.productId, item.quantity);
          } catch (stockErr) {
            console.warn(`[Payment Verify Stock Warning] Stock decrement failed for product ${item.productId}:`, stockErr);
          }
        }

        // 4. Empty User Cart
        if (order.userId) {
          await tx.cartItem.deleteMany({
            where: { userId: order.userId },
          });
        }

        // 5. Convert Affiliate Referral
        if (order.referral && !order.referral.isConverted) {
          await tx.referral.update({
            where: { id: order.referral.id },
            data: { isConverted: true },
          });

          await tx.affiliate.update({
            where: { id: order.referral.affiliateId },
            data: {
              totalSales: { increment: 1 },
              commissionEarned: { increment: Number(order.total) * 0.05 },
            },
          });
        }
      });

      // Post-Payment Tipax Order Registration
      const shippingAddr = (order.shippingAddress as Record<string, any>) || {};
      const existingTipaxOrderId = shippingAddr.tipaxOrderId;

      if (!order.trackingCode && !existingTipaxOrderId) {
        try {
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
            await prisma.order.update({
              where: { id: order.id },
              data: {
                trackingCode,
                shippingAddress: {
                  ...shippingAddr,
                  tipaxOrderId: tipaxResult.tipaxOrderId || trackingCode,
                  tipaxStatus: 'REGISTERED',
                  tipaxRegisteredAt: new Date().toISOString(),
                },
              },
            });
          }
        } catch (tipaxErr) {
          console.error('[Tipax Order Registration Error in Verify Route]', tipaxErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'پرداخت با موفقیت تایید شد.',
        authority,
        reference: refId,
        orderId: order.id,
        amount: trustedAmountToman,
      });
    } else {
      const errorCode = verifyData?.code || (verifyResult.errors?.[0]?.code ?? -1);

      await prisma.transaction.update({
        where: { authority },
        data: { status: 'FAILED' },
      }).catch(() => null);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      }).catch(() => null);

      return NextResponse.json(
        {
          success: false,
          error: `تایید پرداخت از سوی درگاه زرین‌پال انجام نشد (کد خطا: ${errorCode}).`,
          code: errorCode,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[ZarinPal Verification Route Exception]', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'خطای سرور در تایید پرداخت',
      },
      { status: 500 }
    );
  }
}
