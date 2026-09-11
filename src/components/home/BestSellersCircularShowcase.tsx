'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, ArrowLeft, Star, Crown } from 'lucide-react';
import { formatToToman } from '@/lib/currency';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';

interface ProductItem {
  id: string;
  name: string;
  slug: string | null;
  description?: string | null;
  excerpt?: string | null;
  basePrice: number;
  category: string;
  categoryType?: string;
  isBestSeller?: boolean;
  images: {
    id: string;
    secureUrl?: string | null;
    image?: string | null;
    isFeatured?: boolean;
  }[];
  units?: any[];
  discounts?: any[];
}

interface BestSellersCircularShowcaseProps {
  initialProducts?: ProductItem[];
}

export default function BestSellersCircularShowcase({
  initialProducts = [],
}: BestSellersCircularShowcaseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(5);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch from client if initialProducts wasn't provided
  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetch('/api/best-sellers?limit=10')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setProducts(data.data);
          }
        })
        .catch((err) => console.error('Failed to load best sellers:', err));
    }
  }, [initialProducts]);

  // Autoplay functionality
  const nextSlide = useCallback(() => {
    if (products.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % products.length);
    triggerParticles();
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + products.length) % products.length);
    triggerParticles();
  }, [products.length]);

  useEffect(() => {
    if (isHovered || prefersReducedMotion || products.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, prefersReducedMotion, products.length, nextSlide]);

  const triggerParticles = () => {
    if (prefersReducedMotion) return;
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      size: Math.random() * 6 + 3,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      prevSlide();
    } else if (e.key === 'ArrowLeft') {
      nextSlide();
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  const activeProduct = products[activeIndex] || products[0];
  if (!activeProduct) return null;

  const activeImageRaw =
    activeProduct.images?.[0]?.secureUrl || activeProduct.images?.[0]?.image || '/placeholder.png';
  const activeImageOptimized = getOptimizedCloudinaryUrl(activeImageRaw, { width: 600, quality: 80 });

  const activePriceFormatted = formatToToman(activeProduct.basePrice || 0);

  // Get displayed group of products around activeIndex
  const visibleProducts = [];
  const total = products.length;
  const half = Math.floor(itemsPerPage / 2);

  for (let i = -half; i <= half; i++) {
    if (itemsPerPage === 2 && i === half) continue; // For mobile (2 items), take 0 and 1
    const idx = (activeIndex + i + total) % total;
    const prod = products[idx];
    if (prod) {
      visibleProducts.push({
        product: prod,
        index: idx,
        offset: i,
      });
    }
  }

  return (
    <section
      aria-label="محبوب‌ترین انتخاب‌های شیخ"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative my-16 px-4 py-12 md:py-20 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 border-y border-amber-500/20 overflow-hidden font-vazirmatn focus:outline-none"
      dir="rtl"
    >
      {/* Golden Ambient Lighting & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-500/15 via-orange-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs md:text-sm font-semibold mb-3 backdrop-blur-md shadow-lg shadow-amber-500/10">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>حلقه طلایی شاهکارها</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent mb-3 tracking-tight">
            محبوب‌ترین انتخاب‌های شیخ
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium">
            پرفروش‌ترین و محبوب‌ترین شاهکارهای اصیل در اکوسیستم شیخ
          </p>
        </div>

        {/* Circular Ring Geometry Container */}
        <div className="relative min-h-[460px] md:min-h-[520px] flex flex-col items-center justify-between">
          {/* Main Central Spotlight & Ring Decorator */}
          <div className="absolute top-28 md:top-36 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[420px] md:w-[580px] h-[300px] sm:h-[420px] md:h-[580px] rounded-full border border-amber-500/20 bg-stone-900/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(245,158,11,0.15)] flex items-center justify-center pointer-events-none">
            <div className="w-[82%] h-[82%] rounded-full border border-amber-500/15 border-dashed animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full" />
          </div>

          {/* Golden Particle Burst Effect */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.5, x: p.x, y: p.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ width: p.size, height: p.size }}
                className="absolute top-1/2 left-1/2 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] pointer-events-none z-30"
              />
            ))}
          </AnimatePresence>

          {/* Active Product Highlight Card (Center Showcase) */}
          <div className="relative z-20 mb-8 md:mb-12 w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="bg-stone-900/80 border border-amber-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] text-center relative overflow-hidden group"
              >
                {/* Gold Ray Light Reflection */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

                {/* Product Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs mb-4 shadow-md shadow-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-stone-950" />
                  <span>انتخاب ویژه - پرفروش‌ترین</span>
                </div>

                {/* Featured Product Image with Circular Podium */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/10 to-transparent blur-xl" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border border-amber-500/20 bg-stone-950/60 p-4 flex items-center justify-center">
                    <Image
                      src={activeImageOptimized}
                      alt={activeProduct.name}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 192px, 224px"
                      priority
                    />
                  </div>
                </div>

                {/* Product Meta */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-stone-100 mb-2 line-clamp-1">
                  {activeProduct.name}
                </h3>

                <p className="text-stone-400 text-xs sm:text-sm line-clamp-2 mb-4 max-w-sm mx-auto min-h-[2rem]">
                  {activeProduct.excerpt || activeProduct.description || 'محصول فاخر و ویژه اکوسیستم شیخ با بالاترین سطح رضایت مشتریان'}
                </p>

                {/* Price & CTA Button */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-800/80">
                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block font-medium">قیمت ویژه شیخ</span>
                    <span className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono">
                      {activePriceFormatted}
                    </span>
                  </div>

                  <Link
                    href={`/products/${activeProduct.slug || activeProduct.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 active:scale-95"
                  >
                    <span>مشاهده و خرید</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Circular Arc / Selector Nodes */}
          <div className="relative z-20 w-full max-w-4xl flex items-center justify-center gap-3 sm:gap-4 md:gap-6 px-2">
            {/* Prev Button */}
            <button
              onClick={prevSlide}
              aria-label="محصول قبلی"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 hover:border-amber-400 transition-all shadow-lg active:scale-90 shrink-0"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Circular Thumbnail Node Ring */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-5 overflow-visible">
              {visibleProducts.map(({ product, index }) => {
                const isSelected = index === activeIndex;
                const imgRaw =
                  product.images?.[0]?.secureUrl || product.images?.[0]?.image || '/placeholder.png';
                const imgOptimized = getOptimizedCloudinaryUrl(imgRaw, { width: 120, quality: 75 });

                return (
                  <button
                    key={`${product.id}-${index}`}
                    onClick={() => {
                      setActiveIndex(index);
                      triggerParticles();
                    }}
                    aria-label={`انتخاب ${product.name}`}
                    className={`relative group rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 ring-4 ring-amber-400 ring-offset-2 ring-offset-stone-950 scale-110 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                        : 'w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-60 hover:opacity-100 border border-stone-700 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-950 p-1">
                      <Image
                        src={imgOptimized}
                        alt={product.name}
                        fill
                        className="object-cover rounded-full"
                        sizes="80px"
                      />
                    </div>
                    {isSelected && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={nextSlide}
              aria-label="محصول بعدی"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-stone-900/90 border border-amber-500/30 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-stone-950 hover:border-amber-400 transition-all shadow-lg active:scale-90 shrink-0"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
