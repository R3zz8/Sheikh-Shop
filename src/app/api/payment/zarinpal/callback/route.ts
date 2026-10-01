import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { verifyZarinPalPayment } from "@/lib/payment/zarinpal";
import { atomicDecrementProductStock } from "@/lib/inventory";
import { TipaxClient } from "@/lib/tipax/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authority = searchParams.get("Authority") || searchParams.get("authority");
  const status = searchParams.get("Status") || searchParams.get("status");

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";
  const baseUrl = appUrl.replace(/\/$/, "");

  if (!authority) {
    return NextResponse.redirect(
      `${baseUrl}/payment/callback?status=failed&reason=missing_authority`
    );
  }

  // Handle cancelled or unsuccessful payment status from ZarinPal (Status !== OK)
  if (status !== "OK") {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { authority },
        include: { order: true },
      });

      if (transaction) {
        await prisma.transaction.update({
          where: { authority },
          data: { status: "CANCELLED" },
        }).catch(() => null);

        if (transaction.orderId) {
          await prisma.order.update({
            where: { id: transaction.orderId },
            data: { status: "CANCELLED" },
          }).catch(() => null);
        }
      }
    } catch (err) {
      console.error("[ZarinPal Callback NOK Error]", err);
    }

    return NextResponse.redirect(
      `${baseUrl}/payment/callback?status=failed&reason=payment_cancelled_by_user`
    );
  }

  try {
    // Look up transaction and order
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
      console.error(`[ZarinPal Callback] Transaction or order not found for authority: ${authority}`);
      return NextResponse.redirect(
        `${baseUrl}/payment/callback?status=failed&reason=order_not_found`
      );
    }

    const order = transaction.order;

    // Fast-path for already completed/paid orders (idempotent response on page refresh)
    if (
      (order.status === "COMPLETED" || order.status === "PROCESSING" || order.paymentStatus === "PAID") &&
      transaction.status === "COMPLETED"
    ) {
      return NextResponse.redirect(
        `${baseUrl}/payment/callback?status=success&orderId=${order.id}&ref_id=${encodeURIComponent(
          transaction.reference || ""
        )}&amount=${transaction.amount}&authority=${encodeURIComponent(authority)}`
      );
    }

    // Always use trusted order amount from DB in Toman
    const trustedAmountToman = Number(order.totalPrice) || Number(order.total) || transaction.amount;

    // Call ZarinPal server-to-server payment verification
    const verifyResult = await verifyZarinPalPayment({
      amountToman: trustedAmountToman,
      authority,
    });

    const verifyData = verifyResult.data;
    const isSuccessCode = verifyData && (verifyData.code === 100 || verifyData.code === 101);

    if (isSuccessCode) {
      const refId = String(verifyData.ref_id || transaction.reference || "0");

      // Perform atomic database state transition and side effects
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Re-check order status inside transaction boundary to prevent concurrent race conditions
        const currentOrder = await tx.order.findUnique({
          where: { id: order.id },
        });

        if (currentOrder?.status === "COMPLETED" || currentOrder?.paymentStatus === "PAID") {
          return; // Already processed concurrently
        }

        // 1. Update Transaction
        await tx.transaction.update({
          where: { authority },
          data: {
            status: "COMPLETED",
            reference: refId,
          },
        });

        // 2. Update Order with PaymentStatus = PAID & OrderStatus = PROCESSING
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
        });

        // 3. Stock decrement (handled safely without aborting verified payment)
        for (const item of order.items) {
          try {
            await atomicDecrementProductStock(item.productId, item.quantity);
          } catch (stockErr) {
            console.warn(`[ZarinPal Callback Stock Warning] Decrement failed for item ${item.productId}:`, stockErr);
          }
        }

        // 4. Empty User Cart
        if (order.userId) {
          await tx.cartItem.deleteMany({
            where: { userId: order.userId },
          });
        }

        // 5. Convert Affiliate Referral if exists
        if (order.referral && !order.referral.isConverted) {
          await tx.referral.update({
            where: { id: order.referral.id },
            data: { isConverted: true },
          });

          await tx.affiliate.update({
            where: { id: order.referral.affiliateId },
            data: {
              totalSales: { increment: 1 },
              commissionEarned: { increment: Number(order.total) * 0.05 }, // 5% referral commission
            },
          });
        }
      });

      // 6. Post-Payment Tipax Order Registration with Idempotency Guard
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
            items: order.items.map((i: { productName?: string | null; quantity: number; price: number | Prisma.Decimal }) => ({
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
            };

            await prisma.order.update({
              where: { id: order.id },
              data: {
                trackingCode,
                shippingAddress: updatedAddress,
              },
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
          }
        } catch (tipaxErr: any) {
          console.error('[Tipax Order Creation Post-Payment Exception]', tipaxErr);
          const updatedAddress = {
            ...shippingAddr,
            tipaxStatus: 'FAILED',
            tipaxError: tipaxErr?.message || 'خطا در ارتباط با سامانه تیپاکس',
            tipaxFailedAt: new Date().toISOString(),
          };

          await prisma.order.update({
            where: { id: order.id },
            data: {
              shippingAddress: updatedAddress,
            },
          });
        }
      }

      return NextResponse.redirect(
        `${baseUrl}/payment/callback?status=success&orderId=${order.id}&ref_id=${encodeURIComponent(
          refId
        )}&amount=${trustedAmountToman}&authority=${encodeURIComponent(authority)}`
      );
    } else {
      // Verification failed
      const errorCode = verifyData?.code || (verifyResult.errors?.[0]?.code ?? -1);

      await prisma.transaction.update({
        where: { authority },
        data: { status: "FAILED" },
      }).catch(() => null);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      }).catch(() => null);

      return NextResponse.redirect(
        `${baseUrl}/payment/callback?status=failed&reason=verification_failed&code=${errorCode}`
      );
    }
  } catch (error: any) {
    console.error("[ZarinPal Callback Processing Error]", error);
    return NextResponse.redirect(
      `${baseUrl}/payment/callback?status=failed&reason=server_error`
    );
  }
}
