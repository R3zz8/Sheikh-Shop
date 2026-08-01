import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

const adminUpdateSchema = z.object({
    reviewId: z.string().min(1, 'شناسه دیدگاه الزامی است.'),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    reply: z.string().optional().nullable(),
});

// Helper to check admin access
async function verifyAdminAccess() {
    const userId = await getCurrentUserId();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
    });
    if (!user || !['SUPERADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
        throw new Error('عدم دسترسی کافی');
    }
    return user;
}

// GET /api/reviews/admin - List all reviews for moderation
export async function GET(req: NextRequest) {
    try {
        try {
            await verifyAdminAccess();
        } catch {
            return NextResponse.json({ error: 'شما مجاز به انجام این عملیات نیستید.' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status'); // PENDING, APPROVED, REJECTED
        const productId = searchParams.get('productId');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const whereClause: any = {};
        if (status) {
            whereClause.status = status;
        }
        if (productId) {
            whereClause.productId = productId;
        }

        const [reviews, totalCount] = await Promise.all([
            prisma.review.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        }
                    }
                }
            }),
            prisma.review.count({ where: whereClause }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: reviews,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        });

    } catch (error) {
        console.error('[ADMIN GET REVIEWS ERROR]', error);
        return NextResponse.json({ error: 'خطا در دریافت لیست دیدگاه‌ها.' }, { status: 500 });
    }
}

// PATCH /api/reviews/admin - Moderate a review (approve/reject/reply)
export async function PATCH(req: NextRequest) {
    try {
        try {
            await verifyAdminAccess();
        } catch {
            return NextResponse.json({ error: 'شما مجاز به انجام این عملیات نیستید.' }, { status: 403 });
        }

        const body = await req.json();
        const validated = adminUpdateSchema.parse(body);

        const dataToUpdate: any = {};
        if (validated.status !== undefined) {
            dataToUpdate.status = validated.status;
        }
        if (validated.reply !== undefined) {
            dataToUpdate.reply = validated.reply;
        }

        const updatedReview = await prisma.review.update({
            where: { id: validated.reviewId },
            data: dataToUpdate,
        });

        return NextResponse.json({
            success: true,
            message: 'دیدگاه با موفقیت بروزرسانی شد.',
            data: updatedReview,
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'اطلاعات وارد شده نامعتبر است.', details: error.errors }, { status: 400 });
        }
        console.error('[ADMIN PATCH REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در بروزرسانی دیدگاه.' }, { status: 500 });
    }
}

// DELETE /api/reviews/admin - Admin deletion of a review
export async function DELETE(req: NextRequest) {
    try {
        try {
            await verifyAdminAccess();
        } catch {
            return NextResponse.json({ error: 'شما مجاز به انجام این عملیات نیستید.' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const reviewId = searchParams.get('reviewId');

        if (!reviewId) {
            return NextResponse.json({ error: 'شناسه دیدگاه الزامی است.' }, { status: 400 });
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        return NextResponse.json({
            success: true,
            message: 'دیدگاه با موفقیت حذف شد.',
        });

    } catch (error) {
        console.error('[ADMIN DELETE REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در حذف دیدگاه.' }, { status: 500 });
    }
}
