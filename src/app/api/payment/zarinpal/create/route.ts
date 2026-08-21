import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createZarinPalPaymentRequest, getZarinPalStartPayUrl } from "@/lib/payment/zarinpal";
import { getServerUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    let userId = user?.id;

    const body = await req.json().catch(() => ({}));
    const { items: bodyItems, shippingAddress, contactInfo } = body;

    // Fetch user cart from DB
    let cartItems: Array<{
      productId: string;
      quantity: number;
      product: {
        id: string;
        basePrice: number | Prisma.Decimal;
        shippingCost?: number | Prisma.Decimal | null;
        units?: Array<{ id: string; price: number | Prisma.Decimal }>;
      };
    }> = [];

    if (userId) {
      cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              units: true,
            },
          },
        },
      });
    }

    // Fallback if DB cart is empty or guest checkout
    if (cartItems.length === 0 && Array.isArray(bodyItems) && bodyItems.length > 0) {
      // Re-verify all product prices directly from the database to guarantee amount security
      const productIds = bodyItems.map((i: { productId?: string; id?: string }) => i.productId || i.id).filter((id): id is string => Boolean(id));
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { units: true },
      });

      type DbProductWithUnits = Prisma.ProductGetPayload<{ include: { units: true } }>;
      const productMap = new Map<string, DbProductWithUnits>(
        dbProducts.map((p: DbProductWithUnits) => [p.id, p])
      );

      cartItems = bodyItems.map((item: { productId?: string; id?: string; quantity?: number | string }) => {
        const pId = item.productId || item.id;
        if (!pId) {
          throw new Error("شناسه محصول معتبر نیست");
        }
        const dbP = productMap.get(pId);
        if (!dbP) {
          throw new Error(`محصول با شناسه ${pId} یافت نشد`);
        }
        return {
          productId: pId,
          quantity: Math.max(1, parseInt(String(item.quantity || 1), 10)),
          product: {
            id: String(dbP.id),
            basePrice: Number(dbP.basePrice),
            shippingCost: dbP.shippingCost ? Number(dbP.shippingCost) : null,
            units: Array.isArray(dbP.units)
              ? dbP.units.map((u: Prisma.ProductUnitGetPayload<{}>) => ({ id: String(u.id), price: Number(u.price) }))
              : [],
          },
        };
      });
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "سبد خرید شما خالی است" },
        { status: 400 }
      );
    }

    // Calculate authoritative subtotal strictly on the server side
    let subtotalToman = 0;
    const orderItemData: Array<{
      productId: string;
      quantity: number;
      price: number;
      shippingCost?: number;
    }> = [];

    for (const item of cartItems) {
      const unitPrice = Number(item.product.basePrice) || 0;
      const itemSubtotal = unitPrice * item.quantity;
      subtotalToman += itemSubtotal;

      orderItemData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
        shippingCost: Number(item.product.shippingCost) || 0,
      });
    }

    const shippingCostToman = 200000; // Flat shipping cost in Toman
    const totalPriceToman = subtotalToman + shippingCostToman;

    // Create user if guest user email/username provided and not authenticated
    if (!userId) {
      const email = contactInfo?.email || `guest_${Date.now()}@sheikhshops.com`;
      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            username: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            password: `guest_${Date.now()}`,
            role: "USER",
          },
        });
      }
      userId = dbUser.id;
    }

    // Create pending Order in database
    const order = await prisma.order.create({
      data: {
        userId,
        total: subtotalToman,
        shippingCost: shippingCostToman,
        totalPrice: totalPriceToman,
        status: "PENDING",
        items: {
          create: orderItemData.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            shippingCost: i.shippingCost,
          })),
        },
      },
    });

    // App URL construction for ZarinPal callback
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";
    const callbackUrl = `${appUrl.replace(/\/$/, "")}/api/payment/zarinpal/callback`;

    // Initiate ZarinPal payment request
    const zarinpalRes = await createZarinPalPaymentRequest({
      amountToman: totalPriceToman,
      description: `پرداخت سفارش شماره ${order.id} فروشگاه شیخ`,
      callbackUrl,
      orderId: order.id,
      email: contactInfo?.email,
      mobile: contactInfo?.phone || contactInfo?.mobile,
    });

    const resData = zarinpalRes?.data;
    const resErrors = zarinpalRes?.errors;

    if (resData && resData.code === 100 && resData.authority) {
      const authority = String(resData.authority);

      // Persist pending Transaction token mapped to Order ID
      await prisma.transaction.create({
        data: {
          authority,
          amount: totalPriceToman,
          status: "PENDING",
          description: `سفارش ${order.id}`,
          orderId: order.id,
        },
      });

      const startPayUrl = getZarinPalStartPayUrl(authority);

      return NextResponse.json({
        success: true,
        authority,
        url: startPayUrl,
        orderId: order.id,
      });
    }

    const errorMessage =
      Array.isArray(resErrors) && resErrors.length > 0 && resErrors[0]?.message
        ? resErrors[0].message
        : "خطا در ارتباط با درگاه پرداخت زرین‌پال";

    return NextResponse.json(
      { error: errorMessage, code: resData?.code },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[ZarinPal Create API Error]", error);
    return NextResponse.json(
      { error: error.message || "خطای سرور در ایجاد درخواست پرداخت" },
      { status: 500 }
    );
  }
}
