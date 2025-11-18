'use client';

import { motion } from 'framer-motion';
import type { ProductsWithImages } from '@/types';
import ImageGallery from './ImageGallery';
import ProductInfo from './ProductInfo';
import BundleRecommendations from '@/components/recommendations/BundleRecommendations';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton';

interface ProductDetailPageProps {
    product: ProductsWithImages;
    allProducts?: ProductsWithImages[];
}

export default function ProductDetailPage({ product, allProducts = [] }: ProductDetailPageProps) {
    if (!product) {
        return <ProductDetailSkeleton />;
    }

    return (
        <ErrorBoundary>
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
                        {/* Main product card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/15 via-yellow-200/15 to-orange-200/15 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />

                            <div className="relative bg-white/8 backdrop-blur-xl border border-white/15 rounded-3xl p-4 md:p-8 shadow-xl">
                                <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start mobile-two-col">
                                    {/* Image Gallery */}
                                    <ErrorBoundary fallback={
                                        <div className="bg-white/5 rounded-lg p-8 text-center">
                                            <p className="text-gray-300">Failed to load image gallery</p>
                                        </div>
                                    }>
                                        <div className="mobile-gallery-col mx-auto w-[50vw] max-w-[340px] md:max-w-none md:w-full">
                                            <ImageGallery images={product.images} productName={product.name} />
                                        </div>
                                    </ErrorBoundary>

                                    {/* Product Info */}
                                    <ErrorBoundary fallback={
                                        <div className="bg-white/5 rounded-lg p-8 text-center">
                                            <div className="animate-pulse">
                                                <div className="h-8 bg-amber-200/20 rounded w-3/4 mb-4"></div>
                                                <div className="h-6 bg-amber-200/20 rounded w-1/2 mb-4"></div>
                                                <div className="h-4 bg-amber-200/20 rounded w-2/3 mb-4"></div>
                                                <div className="h-4 bg-amber-200/20 rounded w-1/3"></div>
                                            </div>
                                            <p className="text-gray-300 mt-4">Failed to load product information</p>
                                        </div>
                                    }>
                                        <div className="mobile-info-col w-full">
                                            <ProductInfo product={product} />
                                        </div>
                                    </ErrorBoundary>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Recommendations */}
                    {allProducts.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="container mx-auto px-4 py-12"
                        >
                            <div className="space-y-12">
                                <ErrorBoundary fallback={
                                    <div className="bg-white/5 rounded-lg p-8 text-center">
                                        <p className="text-gray-300">Failed to load bundle recommendations</p>
                                    </div>
                                }>
                                    <BundleRecommendations
                                        currentProduct={product}
                                        products={allProducts}
                                        limit={2}
                                    />
                                </ErrorBoundary>

                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

/**
 * Mobile-only two-column layout
 */
<style jsx global>{`
  @media (max-width: 480px) {
    .mobile-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: start;
      column-gap: 12px;
      row-gap: 12px;
    }
    .mobile-gallery-col {
      grid-column: 1 / span 1;
    }
    .mobile-info-col {
      grid-column: 2 / span 1;
    }
  }
`}</style>