import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTipaxShippingQuote } from "@/lib/tipax/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { province, city, items } = body;

    if (!city || typeof city !== "string" || !city.trim()) {
      return NextResponse.json(
        { success: false, error: "شهر مقصد وارد نشده است" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "سبد خرید خالی است" },
        { status: 400 }
      );
    }

    // Extract product IDs
    const productIds = items
      .map((i: { productId?: string; id?: string }) => i.productId || i.id)
      .filter((id): id is string => Boolean(id));

    if (productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "کالاهای معتبر در سبد خرید یافت نشد" },
        { status: 400 }
      );
    }

    // Query trusted DB product weights, dimensions, and prices
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        weight: true,
        dimensions: true,
        basePrice: true,
        shippingCost: true,
        allowFreeShipping: true,
      },
    });

    type DbProductSelect = (typeof dbProducts)[number];
    const productMap = new Map<string, DbProductSelect>(dbProducts.map((p: DbProductSelect) => [p.id, p]));

    let totalValueToman = 0;
    const resolvedItems = items
      .map((item: { productId?: string; id?: string; quantity?: number; unitPrice?: number }) => {
        const pId = item.productId || item.id;
        if (!pId) return null;
        const dbProduct = productMap.get(pId);
        if (!dbProduct) return null;

        const quantity = Math.max(1, parseInt(String(item.quantity || 1), 10));
        const price = typeof item.unitPrice === "number" && item.unitPrice > 0 ? item.unitPrice : Number(dbProduct.basePrice) || 0;
        totalValueToman += price * quantity;

        return {
          quantity,
          product: {
            weight: dbProduct.weight ? Number(dbProduct.weight) : null,
            dimensions: dbProduct.dimensions,
            shippingCost: dbProduct.shippingCost ? Number(dbProduct.shippingCost) : null,
            allowFreeShipping: dbProduct.allowFreeShipping,
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Get dynamic Tipax quote from server-side Tipax client
    const quote = await getTipaxShippingQuote({
      destinationCityName: city.trim(),
      destinationProvinceName: province ? String(province).trim() : undefined,
      totalValueToman,
      items: resolvedItems,
    });

    return NextResponse.json({
      success: true,
      quote: {
        shippingCost: quote.shippingCostToman,
        currency: quote.currency,
        provider: quote.provider,
        isFallback: quote.isFallback,
        message: quote.message,
      },
    });
  } catch (error: any) {
    console.error("[Shipping Quote API Error]", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در دریافت استعلام هزینه ارسال",
        quote: {
          shippingCost: 200000,
          currency: "TOMAN",
          provider: "DEFAULT_FALLBACK",
          isFallback: true,
          message: "تعرفه عمومی ارسال",
        },
      },
      { status: 500 }
    );
  }
}
