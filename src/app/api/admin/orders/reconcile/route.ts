import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerUser } from "@/lib/auth/server-auth";
import { verifyZarinPalPayment } from "@/lib/payment/zarinpal";
import { atomicDecrementProductStock } from "@/lib/inventory";
import { TipaxClient } from "@/lib/tipax/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user || (user.role !== "SUPERADMIN" && user.role !== "ADMIN")) {
      return NextResponse.json({ success: false, error: "عدم دسترسی مدیریت" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { authority, orderId } = body;

    let pendingTransactions = [];

    if (authority) {
      pendingTransactions = await prisma.transaction.findMany({
        where: { authority },
        include: { order: { include: { items: true, referral: true } } },
      });
    } else if (orderId) {
      pendingTransactions = await prisma.transaction.findMany({
        where: { orderId },
        include: { order: { include: { items: true, referral: true } } },
      });
    } else {
      pendingTransactions = await prisma.transaction.findMany({
        where: { status: "PENDING" },
        include: { order: { include: { items: true, referral: true } } },
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    }

    const results: Array<{
      authority: string;
      orderId: string | null;
      status: "RECONCILED" | "NOT_PAID" | "ERROR" | "ALREADY_COMPLETED";
      reference?: string;
      message: string;
    }> = [];

    for (const txRecord of pendingTransactions) {
      if (!txRecord.order) {
        results.push({
          authority: txRecord.authority,
          orderId: null,
          status: "ERROR",
          message: "سفارش مربوطه یافت نشد.",
        });
        continue;
      }

      const order = txRecord.order;

      if (order.paymentStatus === "PAID" && txRecord.status === "COMPLETED") {
        results.push({
          authority: txRecord.authority,
          orderId: order.id,
          status: "ALREADY_COMPLETED",
          reference: txRecord.reference || undefined,
          message: "سفارش قبلاً نهایی شده است.",
        });
        continue;
      }

      const trustedAmountToman = Number(order.totalPrice) || Number(order.total) || txRecord.amount;

      try {
        const verifyRes = await verifyZarinPalPayment({
          authority: txRecord.authority,
          amountToman: trustedAmountToman,
        });

        const vData = verifyRes.data;
        const isSuccess = vData && (vData.code === 100 || vData.code === 101);

        if (isSuccess) {
          const refId = String(vData.ref_id || txRecord.reference || "0");

          await prisma.$transaction(async (dbTx: Prisma.TransactionClient) => {
            await dbTx.transaction.update({
              where: { authority: txRecord.authority },
              data: { status: "COMPLETED", reference: refId },
            });

            await dbTx.order.update({
              where: { id: order.id },
              data: { paymentStatus: "PAID", status: "PROCESSING" },
            });

            for (const item of order.items) {
              try {
                await atomicDecrementProductStock(item.productId, item.quantity);
              } catch (e) {
                console.warn("[Reconcile Stock Warning]", e);
              }
            }

            if (order.userId) {
              await dbTx.cartItem.deleteMany({ where: { userId: order.userId } });
            }
          });

          results.push({
            authority: txRecord.authority,
            orderId: order.id,
            status: "RECONCILED",
            reference: refId,
            message: `پرداخت با موفقیت استعلام و سفارش نهایی شد. (کد پیگیری: ${refId})`,
          });
        } else {
          results.push({
            authority: txRecord.authority,
            orderId: order.id,
            status: "NOT_PAID",
            message: `زرین‌پال پرداخت را تایید نکرد (کد: ${vData?.code || -1}).`,
          });
        }
      } catch (verifyErr: any) {
        results.push({
          authority: txRecord.authority,
          orderId: order.id,
          status: "ERROR",
          message: verifyErr?.message || "خطا در استعلام پرداخت از زرین‌پال.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (error: any) {
    console.error("[Admin Order Reconcile Exception]", error);
    return NextResponse.json({ success: false, error: error?.message || "خطای سرور" }, { status: 500 });
  }
}
