'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUser } from './useUser';
import type { ReviewWithUser } from '@/types';

interface ReviewData {
    productId: string;
    rating: number;
    comment: string;
    userName: string;
}

interface ReviewsResponse {
    reviews: ReviewWithUser[];
    averageRating: number;
    totalReviews: number;
}

export const useReviews = (productId: string) => {
    const queryClient = useQueryClient();
    const { data: user } = useUser();

    // Fetch reviews for a product
    const {
        data: reviewsData,
        isLoading,
        error,
        refetch,
    } = useQuery<ReviewsResponse>({
        queryKey: ['reviews', productId],
        queryFn: async () => {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            if (!res.ok) {
                throw new Error('Failed to fetch reviews');
            }
            return res.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Add review mutation
    const addReviewMutation = useMutation({
        mutationFn: async (reviewData: ReviewData) => {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add review');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            toast.success('Review added successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to add review');
        },
    });

    // Delete review mutation (SUPERADMIN only)
    const deleteReviewMutation = useMutation({
        mutationFn: async (reviewId: string) => {
            const res = await fetch(`/api/reviews/${reviewId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete review');
            }

            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
            toast.success('Review deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete review');
        },
    });

    return {
        reviews: reviewsData?.reviews || [],
        averageRating: reviewsData?.averageRating || 0,
        totalReviews: reviewsData?.totalReviews || 0,
        isLoading,
        error,
        refetch,
        addReviewMutation,
        deleteReviewMutation,
        canDeleteReviews: user?.role === 'SUPERADMIN',
    };
}; 