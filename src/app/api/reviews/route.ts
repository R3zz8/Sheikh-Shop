import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/actions/auth/session';
import { z } from 'zod';
import { stripHtmlTags } from '@/lib/seo/sanitize';

const createReviewSchema = z.object({
    productId: z.string().min(1, 'شناسه محصول الزامی است.'),
    rating: z.number().int().min(1).max(5, 'امتیاز باید بین ۱ تا ۵ باشد.'),
    title: z.string().min(1, 'عنوان دیدگاه الزامی است.').max(255, 'عنوان دیدگاه بسیار طولانی است.'),
    comment: z.string().min(1, 'متن دیدگاه الزامی است.'),
    pros: z.array(z.string()).optional().default([]),
    cons: z.array(z.string()).optional().default([]),
    images: z.array(z.string()).optional().default([]),
    videos: z.array(z.string()).optional().default([]),
});

// GET /api/reviews - Get approved reviews with sorting, pagination, filtering, and stats
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get('productId');
        const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, highest_rating, lowest_rating, helpful
        const ratingFilter = searchParams.get('rating'); // 1 to 5
        const verifiedFilter = searchParams.get('verified') === 'true';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '5', 10);

        if (!productId) {
            return NextResponse.json({ error: 'شناسه محصول الزامی است.' }, { status: 400 });
        }

        // Build where clause for APPROVED reviews
        const whereClause: any = {
            productId,
            status: 'APPROVED',
        };

        if (ratingFilter) {
            const r = parseInt(ratingFilter, 10);
            if (!isNaN(r)) {
                whereClause.rating = r;
            }
        }

        if (verifiedFilter) {
            whereClause.isVerified = true;
        }

        // Define sorting
        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'oldest') {
            orderBy = { createdAt: 'asc' };
        } else if (sortBy === 'highest_rating') {
            orderBy = { rating: 'desc' };
        } else if (sortBy === 'lowest_rating') {
            orderBy = { rating: 'asc' };
        } else if (sortBy === 'helpful') {
            orderBy = { helpfulCount: 'desc' };
        }

        // Execute in parallel: paginated reviews, total count, and global review statistics
        const [reviews, totalCount, allApprovedReviews] = await Promise.all([
            prisma.review.findMany({
                where: whereClause,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            profilePicture: true,
                        }
                    }
                }
            }),
            prisma.review.count({ where: whereClause }),
            // Fetch raw rating and isVerified of all approved reviews for statistics
            prisma.review.findMany({
                where: { productId, status: 'APPROVED' },
                select: { rating: true, isVerified: true },
            }),
        ]);

        // Calculate stats
        const totalReviews = allApprovedReviews.length;
        const sumRatings = allApprovedReviews.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
        const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 0;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        allApprovedReviews.forEach((r: { rating: number }) => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingDistribution[r.rating as 5 | 4 | 3 | 2 | 1]++;
            }
        });

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            success: true,
            data: reviews,
            stats: {
                totalReviews,
                averageRating,
                ratingDistribution,
            },
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        });

    } catch (error) {
        console.error('[GET REVIEWS ERROR]', error);
        return NextResponse.json({ error: 'خطا در دریافت دیدگاه‌ها.' }, { status: 500 });
    }
}

// POST /api/reviews - Submit a new review
export async function POST(req: NextRequest) {
    try {
        let userId: string;
        try {
            userId = await getCurrentUserId();
        } catch {
            return NextResponse.json({ error: 'برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید.' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });

        if (!user) {
            return NextResponse.json({ error: 'کاربر معتبر یافت نشد.' }, { status: 404 });
        }

        const body = await req.json();
        const validated = createReviewSchema.parse(body);

        // Security Check: Verify that the productId actually exists in the database
        const productExists = await prisma.product.findUnique({
            where: { id: validated.productId },
            select: { id: true },
        });
        if (!productExists) {
            return NextResponse.json({ error: 'محصول مورد نظر یافت نشد.' }, { status: 404 });
        }

        // Check if user has already submitted a review for this product (to prevent duplicate submissions)
        const existingReview = await prisma.review.findFirst({
            where: {
                productId: validated.productId,
                userId,
            },
        });

        if (existingReview) {
            return NextResponse.json({ error: 'شما قبلاً برای این محصول دیدگاه ثبت کرده‌اید.' }, { status: 400 });
        }

        // Check if user has purchased the product
        const completedOrder = await prisma.order.findFirst({
            where: {
                userId,
                status: 'COMPLETED',
                items: {
                    some: {
                        productId: validated.productId,
                    },
                },
            },
        });

        const userName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.email.split('@')[0];

        // Sanitize inputs to prevent XSS and malformed HTML injections
        const sanitizedTitle = stripHtmlTags(validated.title);
        const sanitizedComment = stripHtmlTags(validated.comment);
        const sanitizedPros = validated.pros.map(pro => stripHtmlTags(pro)).filter(Boolean);
        const sanitizedCons = validated.cons.map(con => stripHtmlTags(con)).filter(Boolean);

        // Create the review
        const review = await prisma.review.create({
            data: {
                productId: validated.productId,
                userId,
                userName,
                rating: validated.rating,
                title: sanitizedTitle,
                comment: sanitizedComment,
                pros: sanitizedPros,
                cons: sanitizedCons,
                images: validated.images,
                videos: validated.videos,
                isVerified: !!completedOrder,
                status: 'PENDING', // default status
            },
        });

        return NextResponse.json({
            success: true,
            message: 'دیدگاه شما با موفقیت ثبت شد و پس از بررسی مدیر منتشر خواهد شد.',
            data: review,
        }, { status: 201 });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'اطلاعات وارد شده نامعتبر است.', details: error.errors }, { status: 400 });
        }
        console.error('[POST REVIEW ERROR]', error);
        return NextResponse.json({ error: 'خطا در ثبت دیدگاه.' }, { status: 500 });
    }
}
