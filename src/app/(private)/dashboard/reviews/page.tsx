'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRequireRole } from '@/hooks/useRBAC';
import { Star, MessageSquare, Check, X, Trash2, CornerDownLeft, Calendar, User, Eye, ArrowRight, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Spinner from '@/components/Spinner';

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
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reply: string | null;
    createdAt: string;
    product: {
        id: string;
        name: string;
        slug: string | null;
    };
}

export default function AdminReviewsDashboard() {
    const hasAccess = useRequireRole(['ADMIN', 'SUPERADMIN']);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusData] = useState<string>('all'); // all, PENDING, APPROVED, REJECTED
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Reply inline forms state
    const [replyingToId, setReplyingToId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Media lightbox preview
    const [lightboxMedia, setLightboxMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                page: String(page),
                limit: '10',
            });
            if (statusFilter !== 'all') {
                queryParams.append('status', statusFilter);
            }

            const res = await fetch(`/api/reviews/admin?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setReviews(data.data || []);
                    setTotalPages(data.pagination?.totalPages || 1);
                }
            } else {
                toast.error('خطا در دریافت دیدگاه‌ها از سرور.');
            }
        } catch (error) {
            console.error('Error fetching admin reviews:', error);
            toast.error('خطای ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasAccess) {
            fetchReviews();
        }
    }, [hasAccess, statusFilter, page]);

    // Moderate Review (Status Change)
    const handleModerate = async (reviewId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            setActionLoading(reviewId);
            const res = await fetch('/api/reviews/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, status }),
            });

            if (res.ok) {
                toast.success(status === 'APPROVED' ? 'دیدگاه با موفقیت تایید و منتشر شد.' : 'دیدگاه با موفقیت رد شد.');
                // Update local state
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status } : r));
            } else {
                const data = await res.json();
                toast.error(data.error || 'خطا در بروزرسانی وضعیت.');
            }
        } catch (error) {
            console.error('Moderation error:', error);
            toast.error('خطای سرور.');
        } finally {
            setActionLoading(null);
        }
    };

    // Submit Reply to Review
    const handleSaveReply = async (reviewId: string) => {
        if (!replyText.trim()) {
            toast.error('لطفاً متن پاسخ را بنویسید.');
            return;
        }

        try {
            setActionLoading(reviewId);
            const res = await fetch('/api/reviews/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, reply: replyText }),
            });

            if (res.ok) {
                toast.success('پاسخ شما با موفقیت ثبت شد.');
                // Update local state
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r));
                setReplyingToId(null);
                setReplyText('');
            } else {
                const data = await res.json();
                toast.error(data.error || 'خطا در ثبت پاسخ.');
            }
        } catch (error) {
            console.error('Reply submission error:', error);
            toast.error('خطای سرور.');
        } finally {
            setActionLoading(null);
        }
    };

    // Delete Review
    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('آیا از حذف دائم این دیدگاه اطمینان دارید؟')) {
            return;
        }

        try {
            setActionLoading(reviewId);
            const res = await fetch(`/api/reviews/admin?reviewId=${reviewId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('دیدگاه با موفقیت حذف شد.');
                setReviews(prev => prev.filter(r => r.id !== reviewId));
            } else {
                const data = await res.json();
                toast.error(data.error || 'خطا در حذف دیدگاه.');
            }
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error('خطای سرور.');
        } finally {
            setActionLoading(null);
        }
    };

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#060402] text-right p-6 font-vazirmatn" dir="rtl">
                <div className="bg-[#120a06]/40 border border-red-500/10 rounded-2xl p-8 max-w-md text-center space-y-4">
                    <h1 className="text-xl font-black text-red-400">عدم دسترسی</h1>
                    <p className="text-xs text-stone-400 leading-relaxed">شما دسترسی کافی برای مشاهده بخش مدیریت دیدگاه‌های کاربران را ندارید.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 p-6 sm:p-10 font-vazirmatn text-right" dir="rtl">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-900 pb-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-stone-400 text-xs">
                            <a href="/dashboard" className="hover:text-amber-400 flex items-center gap-1">
                                <ArrowRight className="w-3 h-3" />
                                <span>بازگشت به پیشخوان</span>
                            </a>
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent flex items-center gap-2">
                            <span>مدیریت نظرات و دیدگاه‌های کاربران</span>
                        </h1>
                        <p className="text-xs text-stone-400">تایید، رد، پاسخ‌دهی و حذف دائم دیدگاه‌های ثبت‌شده برای محصولات</p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex flex-wrap gap-1.5 bg-stone-900/40 border border-stone-850 p-1 rounded-xl">
                        {[
                            { value: 'all', label: 'همه نظرات' },
                            { value: 'PENDING', label: 'در انتظار تایید' },
                            { value: 'APPROVED', label: 'تایید شده' },
                            { value: 'REJECTED', label: 'رد شده' },
                        ].map((btn) => (
                            <button
                                key={btn.value}
                                onClick={() => {
                                    setStatusData(btn.value);
                                    setPage(1);
                                }}
                                className={`text-[11px] font-black px-4 py-2 rounded-lg transition-all cursor-pointer ${
                                    statusFilter === btn.value
                                        ? 'bg-amber-500 text-stone-950'
                                        : 'text-stone-400 hover:text-stone-200'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                        <Spinner />
                        <span className="text-xs text-stone-500 mt-3">در حال بارگذاری دیدگاه‌ها...</span>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-24 text-center bg-[#120a06]/10 border border-stone-900 rounded-[2rem] flex flex-col items-center justify-center space-y-3">
                        <MessageSquare className="w-12 h-12 text-stone-800" />
                        <p className="text-sm font-bold text-stone-400">هیچ دیدگاهی یافت نشد.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => {
                            const isPending = review.status === 'PENDING';
                            const isApproved = review.status === 'APPROVED';
                            const isRejected = review.status === 'REJECTED';
                            const formattedDate = new Date(review.createdAt).toLocaleDateString('fa-IR');

                            return (
                                <motion.div
                                    key={review.id}
                                    layout
                                    className="bg-stone-900/20 border border-stone-850 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
                                >
                                    {/* Action Loading overlay */}
                                    {actionLoading === review.id && (
                                        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-xs">
                                            <Spinner />
                                        </div>
                                    )}

                                    {/* Grid Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                                        {/* Left col: user, rating, date */}
                                        <div className="space-y-3 border-b lg:border-b-0 lg:border-l border-stone-850/60 pb-4 lg:pb-0 lg:pl-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-full bg-stone-950 flex items-center justify-center border border-amber-500/10">
                                                    <User className="w-4 h-4 text-amber-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-black text-stone-200 block">{review.userName}</span>
                                                    <span className="text-[10px] text-stone-500 block flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{formattedDate}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-850'}`} />
                                                ))}
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] text-stone-500 block font-bold">محصول مربوطه:</span>
                                                <a
                                                    href={`/products/${review.product.slug || review.product.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-black text-amber-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{review.product.name}</span>
                                                </a>
                                            </div>

                                            {/* Status Badge */}
                                            <div>
                                                {isApproved ? (
                                                    <span className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full">تایید شده</span>
                                                ) : isRejected ? (
                                                    <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full">رد شده</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full">در انتظار بررسی</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle col: Review Title and text body */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="space-y-2">
                                                {review.title && (
                                                    <h3 className="text-sm font-black text-stone-200">{review.title}</h3>
                                                )}
                                                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-justify">{review.comment}</p>
                                            </div>

                                            {/* Pros & Cons */}
                                            {(review.pros.length > 0 || review.cons.length > 0) && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/30 p-3 rounded-2xl border border-stone-850/60 text-xs">
                                                    {review.pros.length > 0 && (
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-green-400">✓ نقاط قوت:</div>
                                                            <ul className="text-stone-400 list-disc list-inside pr-1">
                                                                {review.pros.map((p, i) => <li key={i}>{p}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {review.cons.length > 0 && (
                                                        <div className="space-y-1 border-t sm:border-t-0 sm:border-r border-stone-850 pt-2 sm:pt-0 sm:pr-3">
                                                            <div className="font-bold text-red-400">✗ نقاط ضعف:</div>
                                                            <ul className="text-stone-400 list-disc list-inside pr-1">
                                                                {review.cons.map((c, i) => <li key={i}>{c}</li>)}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Media attachments */}
                                            {(review.images.length > 0 || review.videos.length > 0) && (
                                                <div className="flex flex-wrap gap-2">
                                                    {review.images.map((url, i) => (
                                                        <div
                                                            key={`img-${i}`}
                                                            onClick={() => setLightboxMedia({ type: 'image', url })}
                                                            className="w-12 h-14 rounded-lg border border-stone-800 p-1 bg-black/40 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors"
                                                        >
                                                            <img src={url} className="w-full h-full object-cover rounded-md" alt="پیوست" />
                                                        </div>
                                                    ))}
                                                    {review.videos.map((url, i) => (
                                                        <div
                                                            key={`vid-${i}`}
                                                            onClick={() => setLightboxMedia({ type: 'video', url })}
                                                            className="w-12 h-14 rounded-lg border border-stone-800 p-1 bg-black/40 overflow-hidden cursor-pointer hover:border-amber-500/40 transition-colors relative"
                                                        >
                                                            <video src={url} className="w-full h-full object-cover rounded-md" />
                                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
                                                                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                                                                    <div className="w-0 h-0 border-t-[2.5px] border-t-transparent border-b-[2.5px] border-b-transparent border-l-[4px] border-l-stone-950 ml-0.5" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Response support block */}
                                            {review.reply && (
                                                <div className="bg-[#1c120c]/60 border border-amber-500/10 rounded-2xl p-4 space-y-1 shadow-inner mt-2">
                                                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                                                        <CornerDownLeft className="w-3.5 h-3.5" />
                                                        <span>پاسخ ثبت شده پشتیبانی شیخ شاپ:</span>
                                                    </div>
                                                    <p className="text-xs text-stone-400 leading-relaxed text-justify whitespace-pre-wrap">{review.reply}</p>
                                                </div>
                                            )}

                                            {/* Reply Input Form */}
                                            {replyingToId === review.id && (
                                                <div className="space-y-3 mt-3 bg-black/20 p-4 border border-stone-850 rounded-2xl">
                                                    <label className="block text-xs font-bold text-stone-400">ثبت پاسخ پشتیبانی:</label>
                                                    <Textarea
                                                        placeholder="پاسخ خود را برای این کاربر ثبت نمایید..."
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        className="bg-black/60 border-stone-800 focus:border-amber-500/30 text-stone-300 text-xs rounded-xl"
                                                        rows={3}
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            onClick={() => {
                                                                setReplyingToId(null);
                                                                setReplyText('');
                                                            }}
                                                            className="bg-stone-900 border border-stone-800 text-stone-400 text-[11px] rounded-lg py-1 px-3"
                                                        >
                                                            انصراف
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleSaveReply(review.id)}
                                                            className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] rounded-lg font-black py-1 px-4"
                                                        >
                                                            ثبت پاسخ
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right col: Moderate actions */}
                                        <div className="flex flex-row lg:flex-col justify-end lg:justify-start gap-2 border-t lg:border-t-0 lg:border-r border-stone-850/60 pt-4 lg:pt-0 lg:pr-6 shrink-0 lg:items-stretch">

                                            {/* Approve button */}
                                            {!isApproved && (
                                                <Button
                                                    onClick={() => handleModerate(review.id, 'APPROVED')}
                                                    className="bg-green-950/20 border border-green-500/20 hover:bg-green-950/40 hover:border-green-500/40 text-green-400 text-[11px] rounded-xl font-bold py-2.5 px-4 flex-1 lg:flex-none flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    <span>تایید و انتشار</span>
                                                </Button>
                                            )}

                                            {/* Reject button */}
                                            {!isRejected && (
                                                <Button
                                                    onClick={() => handleModerate(review.id, 'REJECTED')}
                                                    className="bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 hover:border-red-500/40 text-red-400 text-[11px] rounded-xl font-bold py-2.5 px-4 flex-1 lg:flex-none flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    <span>رد کردن</span>
                                                </Button>
                                            )}

                                            {/* Reply button */}
                                            {replyingToId !== review.id && (
                                                <Button
                                                    onClick={() => {
                                                        setReplyingToId(review.id);
                                                        setReplyText(review.reply || '');
                                                    }}
                                                    className="bg-stone-900 border border-stone-800 hover:bg-stone-850 text-stone-300 text-[11px] rounded-xl font-bold py-2.5 px-4 flex-1 lg:flex-none flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                                >
                                                    <CornerDownLeft className="w-3.5 h-3.5" />
                                                    <span>{review.reply ? 'ویرایش پاسخ' : 'پاسخ دادن'}</span>
                                                </Button>
                                            )}

                                            {/* Delete button */}
                                            <Button
                                                onClick={() => handleDeleteReview(review.id)}
                                                className="bg-red-950/10 border border-red-500/10 hover:bg-red-950/30 hover:border-red-500/30 text-red-400/80 hover:text-red-400 text-[11px] rounded-xl font-bold py-2.5 px-4 flex-1 lg:flex-none flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>حذف دائم</span>
                                            </Button>
                                        </div>

                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Localized Pagination bar */}
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
                                            ? 'bg-amber-500 text-stone-950'
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

                {/* Fullscreen Lightbox Overlay for Admin Media */}
                <AnimatePresence>
                    {lightboxMedia && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
                            onClick={() => setLightboxMedia(null)}
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
                                    onClick={() => setLightboxMedia(null)}
                                    className="absolute top-4 right-4 z-[110] w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center border border-white/10 active:scale-90 transition-all cursor-pointer"
                                >
                                    ✕
                                </button>
                                {lightboxMedia.type === 'image' ? (
                                    <img src={lightboxMedia.url} alt="بزرگنمایی پیوست" className="max-w-full max-h-[80vh] object-contain rounded-3xl border border-stone-800 shadow-2xl" />
                                ) : (
                                    <video src={lightboxMedia.url} controls autoPlay playsInline className="max-w-2xl w-full rounded-2xl aspect-video" />
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
