import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { createZarinPalPaymentRequest, getZarinPalStartPayUrl } from "@/lib/payment/zarinpal";
import { getServerUser } from "@/lib/auth/server-auth";
import { calculateCartShipping, calculateSubtotal } from "@/lib/shipping";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    let userId = user?.id;

    const body = await req.json().catch(() => ({}));

    // Support both nested payload ({ items, shippingAddress, contactInfo }) and flat payload
    const bodyItems = body.items || [];
    const contactInfo = body.contactInfo || {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      phone: body.mobile || body.phone || '',
      mobile: body.mobile || body.phone || '',
    };
    const shippingAddress = body.shippingAddress || {
      province: body.province || '',
      city: body.city || '',
      address: body.address || '',
      postalCode: body.postalCode || body.zipCode || '',
      recipientName: body.recipientName || `${contactInfo.firstName} ${contactInfo.lastName}`.trim(),
      recipientPhone: body.recipientPhone || contactInfo.phone,
    };
    const orderNotes = body.orderNotes || body.description || '';

    // Fetch user cart from DB if logged in
    let cartItems: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number | Prisma.Decimal;
      product: {
        id: string;
        basePrice: number | Prisma.Decimal;
        shippingCost?: number | Prisma.Decimal | null;
        allowFreeShipping?: boolean | null;
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

    // Fallback for guest checkout or when DB cart is empty but items were passed from client
    if (cartItems.length === 0 && Array.isArray(bodyItems) && bodyItems.length > 0) {
      const productIds = bodyItems
        .map((i: { productId?: string; id?: string }) => i.productId || i.id)
        .filter((id): id is string => Boolean(id));

      if (productIds.length > 0) {
        const dbProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { units: true },
        });

        type DbProductWithUnits = Prisma.ProductGetPayload<{ include: { units: true } }>;
        const productMap = new Map<string, DbProductWithUnits>(
          dbProducts.map((p: DbProductWithUnits) => [p.id, p])
        );

        cartItems = bodyItems
          .map((item: { productId?: string; id?: string; quantity?: number | string }) => {
            const pId = item.productId || item.id;
            if (!pId) return null;
            const dbP = productMap.get(pId);
            if (!dbP) return null;
            return {
              productId: pId,
              quantity: Math.max(1, parseInt(String(item.quantity || 1), 10)),
              product: {
                id: String(dbP.id),
                basePrice: Number(dbP.basePrice),
                shippingCost: dbP.shippingCost ? Number(dbP.shippingCost) : null,
                allowFreeShipping: dbP.allowFreeShipping ?? false,
                units: Array.isArray(dbP.units)
                  ? dbP.units.map((u: Prisma.ProductUnitGetPayload<{}>) => ({ id: String(u.id), price: Number(u.price) }))
                  : [],
              },
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);
      }
    }

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "سبد خرید شما خالی است" },
        { status: 400 }
      );
    }

    // Calculate authoritative subtotal and dynamic shipping cost
    let subtotalToman = 0;
    const orderItemData: Array<{
      productId: string;
      quantity: number;
      price: number;
      shippingCost?: number;
    }> = [];

    for (const item of cartItems) {
      const unitPrice = Number(item.unitPrice || item.product.basePrice) || 0;
      const itemSubtotal = unitPrice * item.quantity;
      subtotalToman += itemSubtotal;

      const itemShippingCost = item.product.allowFreeShipping
        ? 0
        : (item.product.shippingCost !== undefined && item.product.shippingCost !== null)
          ? Number(item.product.shippingCost)
          : 200000;

      orderItemData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: unitPrice,
        shippingCost: itemShippingCost,
      });
    }

    // Calculate dynamic shipping cost for entire order using shipping resolver
    const shippingItems = cartItems.map((item) => ({
      quantity: item.quantity,
      product: {
        shippingCost: item.product.shippingCost ? Number(item.product.shippingCost) : null,
        allowFreeShipping: item.product.allowFreeShipping ?? false,
      },
    }));
    const shippingCostToman = calculateCartShipping(shippingItems);
    const totalPriceToman = subtotalToman + shippingCostToman;

    // Handle guest user provisioning
    if (!userId) {
      const email = contactInfo.email?.trim() || `guest_${Date.now()}@sheikhshops.com`;
      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email,
            username: `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            password: `guest_${Date.now()}`,
            firstName: contactInfo.firstName?.trim() || null,
            lastName: contactInfo.lastName?.trim() || null,
            role: "USER",
          },
        });
      } else if (contactInfo.firstName || contactInfo.lastName) {
        // Update user names if missing
        await prisma.user.update({
          where: { id: dbUser.id },
          data: {
            firstName: dbUser.firstName || contactInfo.firstName?.trim() || null,
            lastName: dbUser.lastName || contactInfo.lastName?.trim() || null,
          },
        });
      }
      userId = dbUser.id;
    }

    // Construct shipping description for order audit
    const fullShippingNote = [
      `تحویل‌گیرنده: ${shippingAddress.recipientName || `${contactInfo.firstName} ${contactInfo.lastName}`}`,
      `تماس: ${shippingAddress.recipientPhone || contactInfo.phone}`,
      `آدرس: استان ${shippingAddress.province}، شهر ${shippingAddress.city}، ${shippingAddress.address}`,
      `کدپستی: ${shippingAddress.postalCode}`,
      orderNotes ? `توضیحات: ${orderNotes}` : '',
    ].filter(Boolean).join(' | ');

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
      description: `پرداخت سفارش ${order.id} | ${fullShippingNote.slice(0, 200)}`,
      callbackUrl,
      orderId: order.id,
      email: contactInfo.email || undefined,
      mobile: contactInfo.phone || contactInfo.mobile || undefined,
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
          description: `سفارش ${order.id} | ${fullShippingNote.slice(0, 200)}`,
          orderId: order.id,
        },
      });

      const startPayUrl = getZarinPalStartPayUrl(authority);

      return NextResponse.json({
        success: true,
        authority,
        url: startPayUrl,
        paymentUrl: startPayUrl,
        orderId: order.id,
      });
    }

    const errorMessage =
      Array.isArray(resErrors) && resErrors.length > 0 && resErrors[0]?.message
        ? resErrors[0].message
        : "خطا در ارتباط با درگاه پرداخت زرین‌پال";

    return NextResponse.json(
      { success: false, error: errorMessage, code: resData?.code },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[ZarinPal Create API Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "خطای سرور در ایجاد درخواست پرداخت" },
      { status: 500 }
    );
  }
}
