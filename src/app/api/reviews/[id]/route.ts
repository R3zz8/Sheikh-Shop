import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';

const updateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(1).max(255).optional(),
    comment: z.string().min(1).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
});

// PATCH /api/reviews/[id] - Edit own review
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            return NextResponse.json({ error: 'برای ویرایش دیدگاه باید وارد حساب خود شوید.' }, { status: 401 });
        }

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: 'دیدگاه مورد نظر یافت نشد.' }, { status: 404 });
        }

        if (review.userId !== userId) {
            return NextResponse.json({ error: 'شما مجاز به ویرایش این دیدگاه نیستید.' }, { status: 403 });
        }

        const body = await req.json();
        const validated = updateReviewSchema.parse(body);

        // Update review status back to PENDING for moderation upon edits
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                ...validated,
                status: 'PENDING', // Re-evaluate upon edit
            },
        });

        return NextResponse.json({
            success: true,
            message: 'دیدگاه شما با موفقیت ویرایش شد و پس از بررسی مجدد مدیر منتشر خواهد شد.',
            data: updatedReview,
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'اطلاعات وارد شده نامعتبر است.', details: error.errors }, { status: 400 });
        }
        console.error('[PATCH REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در ویرایش دیدگاه.' }, { status: 500 });
    }
}

// DELETE /api/reviews/[id] - Delete own review
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            return NextResponse.json({ error: 'برای حذف دیدگاه باید وارد حساب خود شوید.' }, { status: 401 });
        }

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            return NextResponse.json({ error: 'دیدگاه مورد نظر یافت نشد.' }, { status: 404 });
        }

        if (review.userId !== userId) {
            return NextResponse.json({ error: 'شما مجاز به حذف این دیدگاه نیستید.' }, { status: 403 });
        }

        // Delete from database
        await prisma.review.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'دیدگاه شما با موفقیت حذف شد.',
        });

    } catch (error) {
        console.error('[DELETE REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در حذف دیدگاه.' }, { status: 500 });
    }
}
