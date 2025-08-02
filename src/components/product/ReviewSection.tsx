'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Trash2, User } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { useReviews } from '@/hooks/useReviews';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import type { ProductsWithImages } from '@/types';

interface ReviewSectionProps {
    product: ProductsWithImages;
}

export default function ReviewSection({ product }: ReviewSectionProps) {
    const { data: user } = useUser();
    const {
        reviews,
        averageRating,
        totalReviews,
        isLoading,
        addReviewMutation,
        deleteReviewMutation,
        canDeleteReviews,
    } = useReviews(product.id);

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: '',
        userName: '',
    });

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            return;
        }

        await addReviewMutation.mutateAsync({
            productId: product.id,
            rating: reviewData.rating,
            comment: reviewData.comment,
            userName: reviewData.userName || user.email.split('@')[0],
        });

        setReviewData({ rating: 5, comment: '', userName: '' });
        setShowReviewForm(false);
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (confirm('Are you sure you want to delete this review?')) {
            await deleteReviewMutation.mutateAsync(reviewId);
        }
    };

    const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
        return Array.from({ length: 5 }, (_, i) => (
            <button
                key={i}
                type={interactive ? 'button' : undefined}
                onClick={interactive ? () => onRatingChange?.(i + 1) : undefined}
                className={cn(
                    'w-5 h-5 transition-colors duration-200',
                    i < rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-400 hover:text-amber-300',
                    interactive && 'cursor-pointer hover:scale-110'
                )}
            >
                <Star className="w-full h-full" />
            </button>
        ));
    };

    return (
        <div className="space-y-8">
            {/* Review Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <MessageSquare className="w-6 h-6 text-amber-300" />
                    <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">Customer Reviews</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                                {renderStars(averageRating)}
                            </div>
                            <span className="text-gray-300">
                                {averageRating.toFixed(1)}/5 average
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-300">{totalReviews} reviews</span>
                        </div>
                    </div>
                </div>

                {user && (
                    <Button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white"
                    >
                        Write a Review
                    </Button>
                )}
            </motion.div>

            {/* Review Form */}
            <AnimatePresence>
                {showReviewForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/8 backdrop-blur-sm border border-white/20 rounded-2xl p-6"
                    >
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Rating
                                </label>
                                <div className="flex items-center gap-1">
                                    {renderStars(reviewData.rating, true, (rating) =>
                                        setReviewData(prev => ({ ...prev, rating }))
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Name (optional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Your name"
                                    value={reviewData.userName}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, userName: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Review
                                </label>
                                <Textarea
                                    placeholder="Write your review..."
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                                    className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                                    required
                                />
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    disabled={addReviewMutation.isPending}
                                    className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700 text-white"
                                >
                                    {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowReviewForm(false)}
                                    className="border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reviews List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400">Loading reviews...</div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-400">No reviews yet. Be the first to review this product!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white/8 backdrop-blur-sm border border-white/20 rounded-xl p-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-amber-300 to-orange-300 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{review.userName}</div>
                                                <div className="flex items-center gap-2">
                                                    {renderStars(review.rating)}
                                                    <span className="text-sm text-gray-400">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                                    </div>

                                    {canDeleteReviews && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteReview(review.id)}
                                            disabled={deleteReviewMutation.isPending}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
} 