'use client';

import { motion } from 'framer-motion';
import type { ProductsWithImages } from '@/types';
import ImageGallery from './ImageGallery';
import ProductInfo from './ProductInfo';
import { useLuxuryUnboxing } from '@/components/3d/LuxuryUnboxingProvider';
import { Sparkles, Gift, Heart, ArrowRight, HelpCircle, Star, MessageSquare } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProductDetailSkeleton from '@/components/ui/ProductDetailSkeleton';
import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Dynamic lazy imports to minimize first load JS bundle size
const LazyBundleRecommendations = dynamic(
    () => import('@/components/recommendations/BundleRecommendations'),
    { ssr: false, loading: () => <div className="h-48 bg-white/5 animate-pulse rounded-3xl" /> }
);

const LazyProductRecommendations = dynamic(
    () => import('@/components/recommendations/ProductRecommendations'),
    { ssr: false, loading: () => <div className="h-48 bg-white/5 animate-pulse rounded-3xl" /> }
);

const LazyReviewSection = dynamic(
    () => import('./ReviewSection'),
    { ssr: false, loading: () => <div className="h-48 bg-white/5 animate-pulse rounded-3xl" /> }
);

const LazyMarkdownDescription = dynamic(
    () => import('./MarkdownDescription'),
    { ssr: false, loading: () => <div className="h-32 bg-white/5 animate-pulse rounded-3xl" /> }
);

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
            className="w-full bg-[#120a06]/80 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center gap-4 text-center mt-2"
        >
            {/* Soft decorative background glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Glowing Golden Crown Logo */}
            <motion.div
                animate={{ rotateY: [0, 360], scale: [1, 1.04, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/15"
            >
                👑
            </motion.div>

            <div>
                <h3 className="text-sm font-black text-amber-200 flex items-center justify-center gap-1.5 leading-none">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>تجربه لوکس آنباکس سه‌بعدی كالا</span>
                </h3>
                <p className="text-[11px] text-stone-300 mt-2 max-w-xs mx-auto leading-relaxed">
                    پیش از نهایی کردن سفارش، حس جادویی گشودن جعبه چرمی این محصول گران‌بها را با گرافیک سه‌بعدی و ذرات زرین لمس کنید.
                </p>
            </div>

            {/* Large Luxury CTA */}
            <button
                onClick={() => triggerUnboxing(product)}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 text-stone-950 font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/10 border border-amber-400/20 transition-all text-xs flex items-center justify-center gap-2 group/btn"
                aria-label="مشاهده تجربه آنباکس"
            >
                <Gift className="w-4.5 h-4.5 text-stone-950 group-hover/btn:rotate-12 transition-transform duration-300" />
                <span>شروع تجربه آنباکس کالا 🎁</span>
            </button>

            <span className="text-[9px] text-amber-500/70 font-black tracking-wider block">هر خرید، آغاز یک داستان لوکس</span>
        </motion.div>
    );
}

export default function ProductDetailPage({ product, allProducts = [] }: ProductDetailPageProps) {
    if (!product) {
        return <ProductDetailSkeleton />;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-stone-950 to-neutral-950 text-white relative overflow-hidden font-vazirmatn">

                {/* Visual Ambient glow gradients (Apple/Dyson-style) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-[160px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-500/2 rounded-full blur-[200px] animate-pulse delay-1000" />
                    <div className="absolute inset-0 bg-neutral-950/20" />
                </div>

                <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
                    <div className="max-w-7xl mx-auto space-y-16 md:space-y-24">

                        {/* 1. HERO / MAIN STAGE SECTION */}
                        <section className="relative group">
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/10 rounded-[36px] blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-1000" />

                            <div className="relative bg-neutral-900/40 backdrop-blur-2xl border border-white/5 rounded-[32px] p-5 md:p-12 shadow-2xl">
                                <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">

                                    {/* GALLERY COLUMN (Left) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <ErrorBoundary fallback={
                                            <div className="bg-neutral-900/60 rounded-3xl p-8 text-center border border-white/5">
                                                <p className="text-stone-400">امکان بارگذاری گالری تصویر وجود ندارد.</p>
                                            </div>
                                        }>
                                            <ImageGallery images={product.images} productName={product.name} />

                                            {/* Luxury Unboxing Interactive block */}
                                            <UnboxingTriggerSection product={product} />
                                        </ErrorBoundary>
                                    </div>

                                    {/* INFO / PURCHASE COLUMN (Right) */}
                                    <div className="lg:col-span-7">
                                        <ErrorBoundary fallback={
                                            <div className="bg-neutral-900/60 rounded-3xl p-8 text-center border border-white/5">
                                                <p className="text-stone-400">امکان بارگذاری مشخصات خرید وجود ندارد.</p>
                                            </div>
                                        }>
                                            <ProductInfo product={product} />
                                        </ErrorBoundary>
                                    </div>

                                </div>
                            </div>
                        </section>

                        {/* 2. PRODUCT STORY SECTION (Only when description exists) */}
                        {product.description && (
                            <section className="space-y-6 max-w-4xl mx-auto" dir="rtl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                        👑
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black bg-gradient-to-l from-amber-200 via-white to-amber-100 bg-clip-text text-transparent">
                                        روایت و داستان این شاهکار
                                    </h2>
                                    <div className="flex-1 h-px bg-gradient-to-l from-amber-500/10 to-transparent"></div>
                                </div>

                                <div className="bg-neutral-900/20 border border-white/5 rounded-3xl p-6 md:p-8 hover:border-white/10 transition-all leading-relaxed text-stone-300">
                                    <LazyMarkdownDescription content={product.description} />
                                </div>
                            </section>
                        )}

                        {/* 3. BUNDLE DEALS SECTION (Only if other products exist) */}
                        {allProducts.length > 0 && (
                            <section className="space-y-6">
                                <ErrorBoundary fallback={null}>
                                    <LazyBundleRecommendations
                                        currentProduct={product}
                                        products={allProducts}
                                        limit={2}
                                    />
                                </ErrorBoundary>
                            </section>
                        )}

                        {/* 4. RELATED PRODUCTS SECTION */}
                        {allProducts.length > 0 && (
                            <section className="space-y-6">
                                <ErrorBoundary fallback={null}>
                                    <LazyProductRecommendations
                                        currentProduct={product}
                                        products={allProducts}
                                        type="cross_sell"
                                        limit={3}
                                        title="محصولاتی که احتمالاً می‌پسندید"
                                        showReason={false}
                                    />
                                </ErrorBoundary>
                            </section>
                        )}

                        {/* 5. FAQ SECTION (Premium collapsible accordion) */}
                        <section className="space-y-6 max-w-4xl mx-auto" dir="rtl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                    <HelpCircle className="w-4 h-4" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black bg-gradient-to-l from-amber-200 via-white to-amber-100 bg-clip-text text-transparent">
                                    پرسش‌های متداول مشتریان
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-l from-amber-500/10 to-transparent"></div>
                            </div>

                            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
                                <Accordion type="single" collapsible className="w-full space-y-4">
                                    <AccordionItem value="faq-1" className="border-b border-white/5 pb-2">
                                        <AccordionTrigger className="text-stone-200 hover:text-amber-300 font-bold text-sm text-right hover:no-underline flex items-center justify-between py-4">
                                            <span>کیفیت و اصالت محصولات چگونه تضمین می‌شود؟</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-stone-400 text-xs leading-relaxed pt-2">
                                            تمامی محصولات ارائه‌شده در فروشگاه بزرگ شیخ دارای شناسنامه اصالت و نشان تضمین کیفیت طلا هستند. ما کالاها را مستقیماً از مبدأ ارگانیک یا شرکت‌های رسمی تأمین می‌کنیم.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="faq-2" className="border-b border-white/5 pb-2">
                                        <AccordionTrigger className="text-stone-200 hover:text-amber-300 font-bold text-sm text-right hover:no-underline flex items-center justify-between py-4">
                                            <span>نحوه بسته‌بندی و ارسال کالا به تهران و شهرستان به چه صورت است؟</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-stone-400 text-xs leading-relaxed pt-2">
                                            سفارشات تهران از طریق پیک لوکس اختصاصی در کمتر از ۲ ساعت ارسال می‌شود. سفارشات شهرستان نیز با پوشش بیمه طلایی کالا و بسته‌بندی ضربه‌گیر ویژه از طریق پست پیشتاز ارسال می‌گردد.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="faq-3" className="border-b border-white/5 pb-2">
                                        <AccordionTrigger className="text-stone-200 hover:text-amber-300 font-bold text-sm text-right hover:no-underline flex items-center justify-between py-4">
                                            <span>آیا امکان لغو یا تعویض سفارش پس از پرداخت وجود دارد؟</span>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-stone-400 text-xs leading-relaxed pt-2">
                                            بله، به دلیل پایبندی به منشور حقوق خریدار، تا پیش از آماده‌سازی و تحویل لجستیک می‌توانید سفارش خود را به‌طور کامل لغو کرده و وجه آن را مسترد نمایید.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </section>

                        {/* 6. CUSTOMER REVIEWS SECTION */}
                        <section className="space-y-6 max-w-4xl mx-auto" dir="rtl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-black bg-gradient-to-l from-amber-200 via-white to-amber-100 bg-clip-text text-transparent">
                                    نظرات و تجربیات خریداران کالا
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-l from-amber-500/10 to-transparent"></div>
                            </div>

                            <div className="bg-neutral-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
                                <ErrorBoundary fallback={
                                    <div className="text-center text-stone-500 text-xs">خطایی در لود بخش دیدگاه‌ها رخ داد.</div>
                                }>
                                    <LazyReviewSection product={product} />
                                </ErrorBoundary>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
