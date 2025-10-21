
import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const categorySlug = searchParams.get("category");

    if (!categorySlug) {
        return NextResponse.json({error: "Category slug is required"}, {status: 400});
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                category: {
                    slug: categorySlug,
                },
            },
            include: {
                images: true,
                discounts: true,
                units: true,
            },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
