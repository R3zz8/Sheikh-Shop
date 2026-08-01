import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'شناسه محصول الزامی است.' }, { status: 400 });
        }

        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            // User is not logged in
            return NextResponse.json({
                loggedIn: false,
                purchased: false,
                userReview: null,
            });
        }

        // Check if user has purchased the product
        const completedOrder = await prisma.order.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
                items: {
                    some: {
                        productId,
                    },
                },
            },
        });

        // Check if user has already reviewed the product
        const userReview = await prisma.review.findFirst({
            where: {
                productId,
                userId,
            },
        });

        return NextResponse.json({
            loggedIn: true,
            purchased: !!completedOrder,
            userReview,
        });

    } catch (error) {
        console.error('[CHECK PURCHASE ERROR]', error);
        return NextResponse.json({ error: 'خطا در بررسی وضعیت خرید.' }, { status: 500 });
    }
}
