'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, X, Upload, CheckCircle2, ShieldCheck, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface ReviewSubmissionCardProps {
    productId: string;
    productName: string;
    onReviewChange: () => void;
}

export default function ReviewSubmissionCard({
    productId,
    productName,
    onReviewChange,
}: ReviewSubmissionCardProps) {
    const { data: user, isLoading: isUserLoading } = useUser();
    const [statusData, setStatusData] = useState<{
        loggedIn: boolean;
        purchased: boolean;
        userReview: any | null;
    } | null>(null);

    const [isFetchingStatus, setIsFetchingStatus] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [rating, setRating] = useState(5);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [proInput, setProInput] = useState('');
    const [pros, setPros] = useState<string[]>([]);
    const [conInput, setConInput] = useState('');
    const [cons, setCons] = useState<string[]>([]);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchStatus = async () => {
        try {
            setIsFetchingStatus(true);
            const res = await fetch(`/api/reviews/check-purchase?productId=${productId}`);
            if (res.ok) {
                const data = await res.json();
                setStatusData(data);

                // If editing, don't override. But on load, if user has review, show status
                if (data.userReview && !isEditing) {
                    setRating(data.userReview.rating);
                    setTitle(data.userReview.title || '');
                    setComment(data.userReview.comment);
                    setPros(data.userReview.pros || []);
                    setCons(data.userReview.cons || []);
                    setUploadedImages(data.userReview.images || []);
                    setUploadedVideos(data.userReview.videos || []);
                }
            }
        } catch (error) {
            console.error('Error fetching review status:', error);
        } finally {
            setIsFetchingStatus(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchStatus();
        }
    }, [productId, user]);

    // Handle adding pros/cons
    const addPro = () => {
        if (proInput.trim() && !pros.includes(proInput.trim())) {
            setPros([...pros, proInput.trim()]);
            setProInput('');
        }
    };

    const removePro = (index: number) => {
        setPros(pros.filter((_, i) => i !== index));
    };

    const addCon = () => {
        if (conInput.trim() && !cons.includes(conInput.trim())) {
            setCons([...cons, conInput.trim()]);
            setConInput('');
        }
    };

    const removeCon = (index: number) => {
        setCons(cons.filter((_, i) => i !== index));
    };

    // Handle file uploads
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setIsUploading(true);
        const file = selectedFiles[0];
        if (!file) {
            setIsUploading(false);
            return;
        }

        // Validations
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('فرمت فایل نامعتبر است. تنها تصاویر و ویدیوهای استاندارد مجاز هستند.');
            setIsUploading(false);
            return;
        }

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (isImage && file.size > 2 * 1024 * 1024) {
            toast.error('حجم عکس انتخاب شده نباید بیشتر از ۲ مگابایت باشد.');
            setIsUploading(false);
            return;
        }

        if (isVideo && file.size > 15 * 1024 * 1024) {
            toast.error('حجم ویدیوی انتخاب شده نباید بیشتر از ۱۵ مگابایت باشد.');
            setIsUploading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/reviews/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const result = await res.json();
                if (result.success) {
                    if (result.type === 'image') {
                        setUploadedImages([...uploadedImages, result.url]);
                    } else {
                        setUploadedVideos([...uploadedVideos, result.url]);
                    }
                    toast.success('فایل با موفقیت بارگذاری شد.');
                } else {
                    toast.error(result.error || 'بارگذاری فایل با خطا مواجه شد.');
                }
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'خطا در ارتباط با سرور.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('خطای ارتباط با سرور جهت بارگذاری.');
        } finally {
            setIsUploading(false);
            // Clear input
            e.target.value = '';
        }
    };

    // Remove uploaded media locally before submitting
    const removeImage = (urlToRemove: string) => {
        setUploadedImages(uploadedImages.filter(url => url !== urlToRemove));
    };

    const removeVideo = (urlToRemove: string) => {
        setUploadedVideos(uploadedVideos.filter(url => url !== urlToRemove));
    };

    // Handle Form Submit (Insert or Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error('لطفاً عنوان دیدگاه را وارد کنید.');
            return;
        }
        if (!comment.trim()) {
            toast.error('لطفاً متن دیدگاه خود را بنویسید.');
            return;
        }
        if (rating < 1 || rating > 5) {
            toast.error('لطفاً امتیاز معتبر بین ۱ تا ۵ انتخاب کنید.');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                productId,
                rating,
                title,
                comment,
                pros,
                cons,
                images: uploadedImages,
                videos: uploadedVideos,
            };

            const isEditFlow = statusData?.userReview && isEditing;
            const endpoint = isEditFlow
                ? `/api/reviews/${statusData.userReview.id}`
                : '/api/reviews';
            const method = isEditFlow ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const result = await res.json();
                toast.success(result.message || 'دیدگاه شما با موفقیت ثبت شد.');

                // Reset edit flow
                setIsEditing(false);

                // Re-fetch status and update parent review list
                await fetchStatus();
                onReviewChange();
            } else {
                const errData = await res.json();
                toast.error(errData.error || 'خطا در ثبت دیدگاه.');
            }
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error('خطا در ثبت اطلاعات.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Review
    const handleDeleteReview = async () => {
        if (!statusData?.userReview) return;

        if (!confirm('آیا از حذف دیدگاه خود اطمینان دارید؟ این عملیات غیرقابل بازگشت است.')) {
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await fetch(`/api/reviews/${statusData.userReview.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('دیدگاه شما با موفقیت حذف شد.');
                setIsEditing(false);

                // Clear form state
                setRating(5);
                setTitle('');
                setComment('');
                setPros([]);
                setCons([]);
                setUploadedImages([]);
                setUploadedVideos([]);

                // Re-fetch status and update parent
                await fetchStatus();
                onReviewChange();
            } else {
                const errData = await res.json();
                toast.error(errData.error || 'خطا در حذف دیدگاه.');
            }
        } catch (error) {
            console.error('Delete review error:', error);
            toast.error('خطا در ارتباط با سرور جهت حذف دیدگاه.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isUserLoading || isFetchingStatus) {
        return (
            <div className="w-full bg-[#0d0907]/40 border border-amber-500/10 rounded-[2.5rem] p-8 flex items-center justify-center min-h-[150px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-stone-400 font-vazirmatn">در حال بررسی وضعیت دیدگاه...</span>
                </div>
            </div>
        );
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    // If User NOT logged in
    if (!user) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gradient-to-br from-[#120a06]/90 to-[#0a0503]/90 border border-amber-500/15 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group text-center space-y-6 font-vazirmatn"
                dir="rtl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all duration-700 pointer-events-none" />

                <div className="w-16 h-16 bg-[#18100b] border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner shadow-black/80">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-black text-amber-100">ثبت دیدگاه برای محصول</h3>
                    <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                        برای ثبت دیدگاه، تجربیات، مزایا و معایب کالا ابتدا باید وارد حساب کاربری خود شوید تا دیدگاه شما معتبر شناخته شود.
                    </p>
                </div>

                <div>
                    <a
                        href={`/login?redirect=${encodeURIComponent(currentUrl)}`}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-stone-950 font-black text-sm px-8 py-3.5 rounded-2xl shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <span>برای ثبت دیدگاه ابتدا وارد حساب کاربری خود شوید.</span>
                    </a>
                </div>
            </motion.div>
        );
    }

    // If User IS logged in AND has already submitted a review, AND is NOT in editing mode
    if (statusData?.userReview && !isEditing) {
        const review = statusData.userReview;
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gradient-to-br from-[#120a06]/90 to-[#0a0503]/90 border border-amber-500/15 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden group font-vazirmatn"
                dir="rtl"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-black text-amber-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>شما قبلاً برای این محصول دیدگاه ثبت کرده‌اید.</span>
                        </div>
                        <h3 className="text-lg font-black text-stone-100">دیدگاه ثبت شده شما</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-800'}`} />
                                ))}
                            </div>
                            <span className="text-xs text-stone-400">({review.rating} از ۵)</span>
                        </div>
                        <div className="bg-black/30 border border-stone-800/40 rounded-2xl p-4 mt-2 max-w-2xl">
                            <h4 className="text-sm font-bold text-stone-200 mb-1">{review.title}</h4>
                            <p className="text-xs text-stone-400 leading-relaxed text-justify">{review.comment}</p>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1">
                            وضعیت انتشار: {
                                review.status === 'APPROVED' ? <span className="text-green-400 font-bold">منتشر شده</span> :
                                review.status === 'REJECTED' ? <span className="text-red-400 font-bold">رد شده</span> :
                                <span className="text-amber-400 font-bold">در انتظار تایید مدیریت</span>
                            }
                        </div>
                    </div>

                    <div className="flex sm:flex-row flex-col gap-3 w-full md:w-auto shrink-0 mt-2 md:mt-0 border-t border-stone-850/60 pt-4 md:pt-0 md:border-t-0">
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-stone-900 border border-amber-500/20 hover:bg-stone-800 hover:border-amber-500/40 text-amber-300 font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>ویرایش دیدگاه</span>
                        </Button>
                        <Button
                            onClick={handleDeleteReview}
                            disabled={isSubmitting}
                            className="bg-red-950/40 border border-red-500/20 hover:bg-red-950/60 hover:border-red-500/40 text-red-400 font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'در حال حذف...' : 'حذف دیدگاه'}</span>
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Form to create or edit review
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-br from-[#120a06]/95 to-[#080402]/95 border border-amber-500/15 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl relative overflow-hidden font-vazirmatn"
            dir="rtl"
        >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-850/80 pb-6 mb-8">
                <div className="space-y-1.5">
                    <h3 className="text-xl font-black bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                        {isEditing ? 'ویرایش دیدگاه کالا' : 'ثبت دیدگاه جدید'}
                    </h3>
                    <p className="text-xs text-stone-400">
                        {isEditing ? `درحال ویرایش دیدگاه قبلی برای ${productName}` : `تجربه خود را درباره خرید ${productName} بنویسید.`}
                    </p>
                </div>

                {statusData?.purchased && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-4 py-2 rounded-full text-xs font-black text-amber-400 self-start sm:self-auto shadow-[0_4px_15px_rgba(245,158,11,0.1)]">
                        <ShieldCheck className="w-4 h-4" />
                        <span>✓ خرید این محصول تأیید شده است</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Rating */}
                <div className="space-y-2">
                    <label className="block text-xs font-black text-stone-300">امتیاز کالا (از ۱ تا ۵ ستاره)</label>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: 5 }, (_, i) => {
                            const starValue = i + 1;
                            const isFilled = hoveredRating !== null ? starValue <= hoveredRating : starValue <= rating;
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(starValue)}
                                    onMouseLeave={() => setHoveredRating(null)}
                                    onClick={() => setRating(starValue)}
                                    className="p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-transform duration-200 active:scale-95 cursor-pointer"
                                >
                                    <Star
                                        className={`w-8 h-8 transition-colors duration-200 ${
                                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-800'
                                        }`}
                                    />
                                </button>
                            );
                        })}
                        <span className="text-xs text-stone-500 mr-2">
                            {rating === 5 ? 'عالی و فوق‌العاده' :
                             rating === 4 ? 'بسیار خوب' :
                             rating === 3 ? 'معمولی و متوسط' :
                             rating === 2 ? 'ضعیف' : 'بسیار ضعیف و بد'}
                        </span>
                    </div>
                </div>

                {/* 2. Title */}
                <div className="space-y-2">
                    <label htmlFor="review-title" className="block text-xs font-black text-stone-300">عنوان دیدگاه</label>
                    <Input
                        id="review-title"
                        type="text"
                        placeholder="خلاصه تجربه خرید خود را بنویسید (مثلاً: کیفیت عالی، ارزش خرید بالا)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-black/40 border-stone-800/80 text-stone-200 placeholder-stone-600 focus:border-amber-500/40 rounded-xl py-6 text-sm"
                        required
                    />
                </div>

                {/* 3. Comment */}
                <div className="space-y-2">
                    <label htmlFor="review-comment" className="block text-xs font-black text-stone-300">متن دیدگاه</label>
                    <Textarea
                        id="review-comment"
                        placeholder="دیدگاه خود را با جزئیات کامل، کارایی محصول و ویژگی‌های متریال بنویسید..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="bg-black/40 border-stone-800/80 text-stone-200 placeholder-stone-600 focus:border-amber-500/40 rounded-2xl min-h-[120px] text-sm leading-relaxed"
                        required
                    />
                </div>

                {/* 4. Pros & Cons (Side by Side on Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pros */}
                    <div className="space-y-3 bg-green-950/5 border border-green-500/10 rounded-2xl p-4">
                        <label className="block text-xs font-black text-green-400">نقاط قوت</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="افزودن مزیت جدید..."
                                value={proInput}
                                onChange={(e) => setProInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addPro();
                                    }
                                }}
                                className="bg-black/40 border-green-500/15 focus:border-green-500/30 text-stone-200 text-xs rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={addPro}
                                className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl p-2 px-3 shrink-0 active:scale-95 transition-transform"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {pros.map((pro, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/15 text-green-400 text-[11px] font-bold px-3 py-1 rounded-full"
                                >
                                    <span>{pro}</span>
                                    <X
                                        className="w-3 h-3 hover:text-green-200 cursor-pointer"
                                        onClick={() => removePro(index)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Cons */}
                    <div className="space-y-3 bg-red-950/5 border border-red-500/10 rounded-2xl p-4">
                        <label className="block text-xs font-black text-red-400">نقاط ضعف</label>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="افزودن عیب جدید..."
                                value={conInput}
                                onChange={(e) => setConInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addCon();
                                    }
                                }}
                                className="bg-black/40 border-red-500/15 focus:border-red-500/30 text-stone-200 text-xs rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={addCon}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl p-2 px-3 shrink-0 active:scale-95 transition-transform"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {cons.map((con, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/15 text-red-400 text-[11px] font-bold px-3 py-1 rounded-full"
                                >
                                    <span>{con}</span>
                                    <X
                                        className="w-3 h-3 hover:text-red-200 cursor-pointer"
                                        onClick={() => removeCon(index)}
                                    />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. Image/Video uploader */}
                <div className="space-y-3">
                    <label className="block text-xs font-black text-stone-300">افزودن عکس یا ویدیوی بررسی کالا</label>

                    <div className="flex flex-col sm:flex-row gap-4 items-stretch justify-between bg-black/40 p-5 rounded-2xl border border-stone-850/80">
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-xs font-bold text-stone-300 mb-1">بارگذاری فایل‌های چندرسانه‌ای جدید</p>
                            <p className="text-[10px] text-stone-500 leading-relaxed">
                                تصاویر تا سقف ۲ مگابایت (JPG, PNG, WEBP) و ویدیوها تا سقف ۱۵ مگابایت (MP4, WebM, MOV)
                            </p>
                        </div>

                        <div className="relative shrink-0 flex items-center justify-center">
                            <input
                                id="review-media-upload-input"
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                disabled={isUploading || isSubmitting}
                                className="hidden"
                            />
                            <label
                                htmlFor="review-media-upload-input"
                                className={`inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 font-black text-xs py-3 px-6 rounded-xl cursor-pointer transition-colors ${
                                    isUploading ? 'opacity-40 cursor-not-allowed' : ''
                                }`}
                            >
                                {isUploading ? (
                                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                <span>{isUploading ? 'درحال بارگذاری...' : 'انتخاب عکس یا ویدیو'}</span>
                            </label>
                        </div>
                    </div>

                    {/* Media Previews List */}
                    <AnimatePresence>
                        {(uploadedImages.length > 0 || uploadedVideos.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 mt-3 bg-black/20 p-3 rounded-2xl border border-stone-900"
                            >
                                {uploadedImages.map((url, idx) => (
                                    <div key={`img-${idx}`} className="relative group aspect-square bg-stone-950 border border-stone-850 rounded-xl overflow-hidden p-1.5 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeImage(url)}
                                            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-black/80 hover:bg-red-500/90 text-stone-200 hover:text-white rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all pointer-events-auto cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <img src={url} alt="بررسی کالا" className="w-full h-full object-cover rounded-lg" />
                                    </div>
                                ))}

                                {uploadedVideos.map((url, idx) => (
                                    <div key={`vid-${idx}`} className="relative group aspect-square bg-stone-950 border border-stone-850 rounded-xl overflow-hidden p-1.5 flex flex-col items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeVideo(url)}
                                            className="absolute top-1.5 right-1.5 z-10 w-5 h-5 bg-black/80 hover:bg-red-500/90 text-stone-200 hover:text-white rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all pointer-events-auto cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <video src={url} className="w-full h-full object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-amber-500/80 flex items-center justify-center">
                                                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-stone-950 ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 6. Form CTA buttons */}
                <div className="flex sm:flex-row flex-col gap-3 justify-end border-t border-stone-850/80 pt-6">
                    {isEditing && (
                        <Button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-white font-bold text-xs py-3 px-6 rounded-xl order-2 sm:order-1"
                        >
                            انصراف
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={isSubmitting || isUploading}
                        className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:via-yellow-400 hover:to-orange-400 text-stone-950 font-black text-xs py-3.5 px-8 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform order-1 sm:order-2 shadow-lg shadow-amber-500/10"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        <span>{isSubmitting ? 'درحال ثبت...' : (isEditing ? 'ثبت ویرایش دیدگاه' : 'ثبت دیدگاه')}</span>
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}
