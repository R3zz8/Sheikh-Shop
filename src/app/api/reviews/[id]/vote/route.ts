import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';

// POST /api/reviews/[id]/vote - Toggle helpful vote on a review
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            return NextResponse.json({ error: 'برای رای دادن باید وارد حساب خود شوید.' }, { status: 401 });
        }

        const review = await prisma.review.findUnique({
            where: { id },
            select: { id: true, helpfulUserIds: true },
        });

        if (!review) {
            return NextResponse.json({ error: 'دیدگاه مورد نظر یافت نشد.' }, { status: 404 });
        }

        let newHelpfulUserIds = [...review.helpfulUserIds];
        let voted: boolean;

        if (newHelpfulUserIds.includes(userId)) {
            // Toggle off (remove vote)
            newHelpfulUserIds = newHelpfulUserIds.filter(uid => uid !== userId);
            voted = false;
        } else {
            // Toggle on (add vote)
            newHelpfulUserIds.push(userId);
            voted = true;
        }

        // Update in database
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                helpfulUserIds: newHelpfulUserIds,
                helpfulCount: newHelpfulUserIds.length,
            },
        });

        return NextResponse.json({
            success: true,
            voted,
            helpfulCount: updatedReview.helpfulCount,
            message: voted ? 'با تشکر از ثبت رای شما.' : 'رای شما با موفقیت لغو شد.',
        });

    } catch (error) {
        console.error('[VOTE REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در ثبت رای.' }, { status: 500 });
    }
}
