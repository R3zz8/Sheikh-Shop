'use client';

import { motion } from 'framer-motion';

export default function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto"
                >
                    {/* Main product card skeleton */}
                    <div className="relative group">
                        <div className="relative bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-4 md:p-8 shadow-xl">
                            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
                                {/* Left side - Image Gallery Skeleton */}
                                <div className="space-y-4">
                                    <div className="aspect-square bg-white/10 rounded-xl animate-pulse">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-16 h-16 bg-amber-200/20 rounded-full animate-spin"></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="w-16 h-16 bg-white/10 rounded-lg animate-pulse"></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right side - Product Info Skeleton */}
                                <div className="space-y-6">
                                    {/* Title skeleton */}
                                    <div className="space-y-3">
                                        <div className="h-8 bg-amber-200/20 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-6 bg-amber-200/20 rounded w-1/2 animate-pulse"></div>
                                    </div>

                                    {/* Price skeleton */}
                                    <div className="space-y-2">
                                        <div className="h-12 bg-amber-200/20 rounded w-1/3 animate-pulse"></div>
                                        <div className="h-4 bg-amber-200/20 rounded w-1/4 animate-pulse"></div>
                                    </div>

                                    {/* Rating skeleton */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="w-5 h-5 bg-amber-200/20 rounded animate-pulse"></div>
                                            ))}
                                        </div>
                                        <div className="h-4 bg-amber-200/20 rounded w-24 animate-pulse"></div>
                                    </div>

                                    {/* Category skeleton */}
                                    <div className="h-8 bg-white/10 rounded-full w-20 animate-pulse"></div>

                                    {/* Stock status skeleton */}
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 bg-amber-200/20 rounded animate-pulse"></div>
                                        <div className="h-4 bg-amber-200/20 rounded w-32 animate-pulse"></div>
                                    </div>

                                    {/* Unit selection skeleton */}
                                    <div className="space-y-4">
                                        <div className="h-6 bg-amber-200/20 rounded w-1/3 animate-pulse"></div>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description skeleton */}
                                    <div className="space-y-2">
                                        <div className="h-6 bg-amber-200/20 rounded w-1/4 animate-pulse"></div>
                                        <div className="space-y-1">
                                            <div className="h-4 bg-amber-200/20 rounded w-full animate-pulse"></div>
                                            <div className="h-4 bg-amber-200/20 rounded w-5/6 animate-pulse"></div>
                                            <div className="h-4 bg-amber-200/20 rounded w-4/6 animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* Add to cart button skeleton */}
                                    <div className="h-12 bg-amber-200/20 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
