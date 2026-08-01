'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft, Calendar, HelpCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface Review {
    id: string;
    userName: string;
    rating: number;
    title: string | null;
    comment: string;
    pros: string[];
    cons: string[];
    images: string[];
    videos: string[];
    isVerified: boolean;
    helpfulCount: number;
    helpfulUserIds: string[];
    reply: string | null;
    createdAt: string;
}

interface Stats {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
}

interface DynamicReviewSectionProps {
    productId: string;
    refreshTrigger: number;
}

export default function DynamicReviewSection({
    productId,
    refreshTrigger,
}: DynamicReviewSectionProps) {
    const { data: user } = useUser();

    // List & Stats state
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Filters, Sorting & Pagination state
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest_rating, lowest_rating, helpful
    const [ratingFilter, setRatingFilter] = useState<string>('all'); // 'all', '1', '2', '3', '4', '5'
    const [verifiedFilter, setVerifiedFilter] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Lightbox & Video Player modal states
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | null>(null);

    // Fetch reviews from our API
    const fetchReviews = useCallback(async () => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                productId,
                sortBy,
                page: String(page),
                limit: '5',
            });
            if (ratingFilter !== 'all') {
                queryParams.append('rating', ratingFilter);
            }
            if (verifiedFilter) {
                queryParams.append('verified', 'true');
            }

            const res = await fetch(`/api/reviews?${queryParams.toString()}`);
            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    setReviews(result.data || []);
                    setStats(result.stats || null);
                    setTotalPages(result.pagination?.totalPages || 1);
                    setTotalCount(result.pagination?.totalCount || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    }, [productId, sortBy, ratingFilter, verifiedFilter, page]);

    // Reset pagination to page 1 on filter/sort changes
    useEffect(() => {
        setPage(1);
    }, [sortBy, ratingFilter, verifiedFilter]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [fetchReviews, refreshTrigger]);

    // Handle Helpful Vote Toggle
    const handleHelpfulVote = async (reviewId: string) => {
        if (!user) {
            toast.error('برای ثبت بازخورد مفید بودن ابتدا وارد حساب کاربری خود شوید.');
            return;
        }

        try {
            const res = await fetch(`/api/reviews/${reviewId}/vote`, {
                method: 'POST',
            });

            if (res.ok) {
                const result = await res.json();

                // Optimistically update helpful count local state
                setReviews(prevReviews =>
                    prevReviews.map(rev => {
                        if (rev.id === reviewId) {
                            return {
                                ...rev,
                                helpfulCount: result.helpfulCount,
                                helpfulUserIds: result.voted
                                    ? [...rev.helpfulUserIds, user.id]
                                    : rev.helpfulUserIds.filter(uid => uid !== user.id),
                            };
                        }
                        return rev;
                    })
                );

                toast.success(result.message);
            } else {
                const errData = await res.json();
                toast.error(errData.error || 'خطا در ثبت رای.');
            }
        } catch (error) {
            console.error('Vote helpful error:', error);
            toast.error('خطا در ارتباط با سرور.');
        }
    };

    // Calculate percentage helper
    const getDistributionPercent = (count: number) => {
        if (!stats || stats.totalReviews === 0) return 0;
        return Math.round((count / stats.totalReviews) * 100);
    };

    return (
        <div className="space-y-10 font-vazirmatn text-right" dir="rtl">

            {/* 1. Review Statistics Dashboard */}
            {stats && stats.totalReviews > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-gradient-to-br from-[#120a06]/40 to-[#0a0503]/40 border border-amber-500/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                    {/* Left Column: Big Average Score */}
                    <div className="flex flex-col items-center justify-center text-center p-4 border-b lg:border-b-0 lg:border-l border-stone-850/80">
                        <div className="text-5xl font-black text-amber-400 mb-2">{stats.averageRating}</div>
                        <div className="flex items-center gap-0.5 mb-2">
                            {Array.from({ length: 5 }, (_, i) => {
                                const starFill = i + 1 <= Math.round(stats.averageRating);
                                return <Star key={i} className={`w-5 h-5 ${starFill ? 'fill-amber-400 text-amber-400' : 'text-stone-800'}`} />;
                            })}
                        </div>
                        <div className="text-xs text-stone-400">میانگین امتیاز از مجموع {stats.totalReviews} دیدگاه</div>
                    </div>

                    {/* Middle Column: Rating Progress Distribution */}
                    <div className="lg:col-span-2 flex flex-col justify-center gap-3 p-4">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = stats.ratingDistribution[stars as 5 | 4 | 3 | 2 | 1] || 0;
                            const percent = getDistributionPercent(count);
                            return (
                                <div key={stars} className="flex items-center gap-3 text-xs w-full">
                                    <span className="w-12 text-stone-400 text-left font-bold flex items-center justify-end gap-1">
                                        <span>{stars}</span>
                                        <Star className="w-3.5 h-3.5 fill-amber-500/40 text-amber-500/40" />
                                    </span>
                                    <div className="flex-1 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-900">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8 }}
                                            className="h-full bg-gradient-to-l from-amber-500 to-yellow-500 rounded-full"
                                        />
                                    </div>
                                    <span className="w-10 text-stone-500 text-right">{percent}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Sorting and Filtering Bars */}
            <div className="bg-[#120a06]/20 border border-stone-850/80 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-stone-400 ml-2 font-bold">فیلتر بر اساس:</span>

                    {/* Rating filter */}
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="bg-black/60 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2 focus:border-amber-500/30 cursor-pointer"
                    >
                        <option value="all">همه امتیازها</option>
                        <option value="5">فقط ۵ ستاره</option>
                        <option value="4">فقط ۴ ستاره</option>
                        <option value="3">فقط ۳ ستاره</option>
                        <option value="2">فقط ۲ ستاره</option>
                        <option value="1">فقط ۱ ستاره</option>
                    </select>

                    {/* Verified buyer filter */}
                    <button
                        type="button"
                        onClick={() => setVerifiedFilter(!verifiedFilter)}
                        className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                            verifiedFilter
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                                : 'bg-black/30 border-stone-800 text-stone-400 hover:text-stone-300'
                        }`}
                    >
                        فقط خریداران تایید شده
                    </button>
                </div>

                {/* Sorting */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400 ml-2 font-bold">مرتب‌سازی:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-black/60 border border-stone-800 text-stone-300 text-xs rounded-xl px-3 py-2 focus:border-amber-500/30 cursor-pointer font-bold"
                    >
                        <option value="newest">جدیدترین دیدگاه‌ها</option>
                        <option value="oldest">قدیمی‌ترین دیدگاه‌ها</option>
                        <option value="highest_rating">بیشترین امتیاز</option>
                        <option value="lowest_rating">کمترین امتیاز</option>
                        <option value="helpful">مفیدترین نظرات</option>
                    </select>
                </div>
            </div>

            {/* 3. Real Dynamic Reviews List */}
            {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center bg-black/5 border border-stone-900 rounded-3xl min-h-[200px]">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs text-stone-500">درحال بارگذاری دیدگاه‌های کاربران...</span>
                </div>
            ) : reviews.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-black/5 border border-stone-900 rounded-3xl min-h-[200px] space-y-3">
                    <MessageSquare className="w-10 h-10 text-stone-700" />
                    <p className="text-sm font-bold text-stone-400">هنوز دیدگاهی برای این کالا ثبت یا تایید نشده است.</p>
                    <p className="text-xs text-stone-500">شما اولین نفری باشید که تجربه خود را درباره این محصول ثبت می‌نمایید!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <AnimatePresence mode="wait">
                        {reviews.map((review, index) => {
                            const userHasVoted = user && review.helpfulUserIds.includes(user.id);
                            const displayDate = new Date(review.createdAt).toLocaleDateString('fa-IR');

                            return (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-gradient-to-br from-[#120a06]/40 to-[#0a0503]/40 border border-stone-850/60 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4 relative overflow-hidden"
                                >
                                    {/* Top Metadata row */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850/40 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1c120e] border border-amber-500/10 flex items-center justify-center shadow-inner">
                                                <span className="text-xs font-black text-amber-500">{review.userName.substring(0, 1)}</span>
                                            </div>
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs sm:text-sm font-black text-stone-200">{review.userName}</span>
                                                    {review.isVerified && (
                                                        <span className="inline-flex items-center gap-0.5 bg-green-500/10 border border-green-500/25 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            خریدار رسمی
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-800'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 self-end sm:self-auto text-[10px] text-stone-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{displayDate}</span>
                                        </div>
                                    </div>

                                    {/* Review Body */}
                                    <div className="space-y-3">
                                        {review.title && (
                                            <h4 className="text-sm font-black text-amber-100">{review.title}</h4>
                                        )}
                                        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-justify whitespace-pre-wrap">{review.comment}</p>
                                    </div>

                                    {/* Pros & Cons */}
                                    {(review.pros.length > 0 || review.cons.length > 0) && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/20 p-3.5 rounded-2xl border border-stone-900/60 text-xs">
                                            {/* Pros */}
                                            {review.pros.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="font-bold text-green-400">✓ نقاط قوت:</div>
                                                    <ul className="space-y-1 text-stone-400 list-disc list-inside pr-1.5">
                                                        {review.pros.map((p, i) => (
                                                            <li key={i}>{p}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Cons */}
                                            {review.cons.length > 0 && (
                                                <div className="space-y-1.5 border-t sm:border-t-0 sm:border-r border-stone-850/60 pt-2 sm:pt-0 sm:pr-4">
                                                    <div className="font-bold text-red-400">✗ نقاط ضعف:</div>
                                                    <ul className="space-y-1 text-stone-400 list-disc list-inside pr-1.5">
                                                        {review.cons.map((c, i) => (
                                                            <li key={i}>{c}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Uploaded Files Previews */}
                                    {(review.images.length > 0 || review.videos.length > 0) && (
                                        <div className="flex flex-wrap gap-2.5 mt-1">
                                            {/* Images */}
                                            {review.images.map((imgUrl, i) => (
                                                <motion.div
                                                    key={`img-${i}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => setLightboxImage(imgUrl)}
                                                    className="w-14 h-14 rounded-xl border border-stone-800 bg-stone-950/40 p-1 overflow-hidden cursor-pointer"
                                                >
                                                    <img src={imgUrl} alt="بررسی پیوست کالا" className="w-full h-full object-cover rounded-lg" />
                                                </motion.div>
                                            ))}

                                            {/* Videos */}
                                            {review.videos.map((vidUrl, i) => (
                                                <motion.div
                                                    key={`vid-${i}`}
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => setVideoPlayerUrl(vidUrl)}
                                                    className="w-14 h-14 rounded-xl border border-stone-800 bg-stone-950/40 p-1 overflow-hidden relative cursor-pointer"
                                                >
                                                    <video src={vidUrl} className="w-full h-full object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
                                                        <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                                                            <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-stone-950 ml-0.5" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Helpful feedback row */}
                                    <div className="flex items-center justify-between mt-2 pt-3 border-t border-stone-850/40">
                                        <span className="text-[10px] text-stone-500">آیا این دیدگاه برای شما مفید بود؟</span>
                                        <button
                                            type="button"
                                            onClick={() => handleHelpfulVote(review.id)}
                                            className={`inline-flex items-center gap-1.5 text-xs py-1.5 px-3.5 rounded-xl border transition-all cursor-pointer ${
                                                userHasVoted
                                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold shadow-md shadow-amber-500/5'
                                                    : 'bg-black/30 border-stone-850 text-stone-400 hover:text-stone-300'
                                            }`}
                                        >
                                            <ThumbsUp className={`w-3.5 h-3.5 ${userHasVoted ? 'fill-amber-400' : ''}`} />
                                            <span>مفید بود ({review.helpfulCount})</span>
                                        </button>
                                    </div>

                                    {/* Nestled Admin Reply */}
                                    {review.reply && (
                                        <div className="mt-4 bg-gradient-to-br from-[#1c120c]/60 to-[#120a06]/60 border border-amber-500/5 rounded-2xl p-4 flex flex-col gap-1.5 text-xs shadow-inner">
                                            <div className="flex items-center gap-1.5 text-amber-400 font-black">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>پاسخ رسمی پشتیبانی شیخ شاپ</span>
                                            </div>
                                            <p className="text-stone-400 leading-relaxed text-justify whitespace-pre-wrap">{review.reply}</p>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Localized numeric pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8 font-black">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-stone-850 bg-black/40 hover:bg-stone-900 rounded-xl text-stone-400 disabled:opacity-20 cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => {
                                const pageNumber = i + 1;
                                const isCurrent = pageNumber === page;
                                return (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => setPage(pageNumber)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                                            isCurrent
                                                ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-stone-950 shadow-md shadow-amber-500/10'
                                                : 'border border-stone-850 bg-black/40 text-stone-400 hover:bg-stone-900'
                                        }`}
                                    >
                                        {pageNumber.toLocaleString('fa-IR')}
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-stone-850 bg-black/40 hover:bg-stone-900 rounded-xl text-stone-400 disabled:opacity-20 cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 4. Luxury Image Lightbox Overlay */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-4xl max-h-[85vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-4 right-4 z-[110] w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
                            >
                                ✕
                            </button>
                            <img src={lightboxImage} alt="بزرگنمایی پیوست" className="max-w-full max-h-[80vh] object-contain rounded-3xl border border-stone-800 shadow-2xl" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 5. Luxury Video Modal Player Overlay */}
            <AnimatePresence>
                {videoPlayerUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                        onClick={() => setVideoPlayerUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="relative max-w-2xl w-full bg-stone-950 border border-stone-850 rounded-[2rem] overflow-hidden p-2 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setVideoPlayerUrl(null)}
                                className="absolute top-4 right-4 z-[110] w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
                            >
                                ✕
                            </button>
                            <video src={videoPlayerUrl} controls autoPlay playsInline className="w-full rounded-2xl aspect-video" />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
