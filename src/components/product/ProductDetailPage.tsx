'use client';

import { motion } from 'framer-motion';
import type { ProductsWithImages } from '@/types';
import ImageGallery from './ImageGallery';
import ProductInfo from './ProductInfo';
import BundleRecommendations from '@/components/recommendations/BundleRecommendations';
import { useLuxuryUnboxing } from '@/components/3d/LuxuryUnboxingProvider';
import { Sparkles, Gift } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton';

interface ProductDetailPageProps {
    product: ProductsWithImages;
    allProducts?: ProductsWithImages[];
}

function UnboxingTriggerSection({ product }: { product: any }) {
    const { triggerUnboxing, config } = useLuxuryUnboxing();

    if (config?.isEnabled === false) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full bg-[#1e110d]/40 backdrop-blur-md border border-amber-500/15 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center gap-4 text-center mt-2"
        >
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />

            {/* Glowing Golden Crown Logo */}
            <motion.div
                animate={{ rotateY: [0, 360], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shadow-amber-500/25"
            >
                👑
            </motion.div>

            <div>
                <h3 className="text-sm font-black text-amber-100 flex items-center justify-center gap-1.5 leading-none">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>✨ تجربه باز کردن جعبه لوکس</span>
                </h3>
                <p className="text-[11px] text-stone-300 mt-2 max-w-xs mx-auto leading-relaxed">
                    پیش از سفارش، لذت گشودن نمادین جعبه چرمی این شاهکار را با جزئیات سه‌بعدی و غبار زرین لمس کنید.
                </p>
            </div>

            {/* Large Luxury CTA */}
            <button
                onClick={() => triggerUnboxing(product)}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-3 px-6 rounded-2xl shadow-lg shadow-amber-500/5 border border-amber-400/20 transition-all text-xs flex items-center justify-center gap-2 group/btn"
                aria-label="مشاهده تجربه آنباکس"
            >
                <Gift className="w-4 h-4 text-stone-950 group-hover/btn:rotate-12 transition-transform duration-300" />
                <span>مشاهده تجربه آنباکس کالا 🎁</span>
            </button>

            <span className="text-[9px] text-amber-500/60 font-semibold tracking-wider block">هر خرید، آغاز یک تجربه لوکس</span>
        </motion.div>
    );
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
                                        <div className="mobile-gallery-col mx-auto w-[50vw] max-w-[340px] md:max-w-none md:w-full flex flex-col gap-6">
                                            <ImageGallery images={product.images} productName={product.name} />

                                            {/* ✨ Luxury Unboxing Glass Card Section */}
                                            <UnboxingTriggerSection product={product} />
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