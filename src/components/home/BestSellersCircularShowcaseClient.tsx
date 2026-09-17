'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Crown } from 'lucide-react';
import type { BestSellerProductData } from '@/lib/services/getBestSellers';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';

interface BestSellersCircularShowcaseClientProps {
  products: BestSellerProductData[];
}

export default function BestSellersCircularShowcaseClient({
  products,
}: BestSellersCircularShowcaseClientProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Consistent initial state between SSR and initial client mount to prevent hydration mismatch
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic responsive itemsPerPage calculation after mount
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsPerPage(2); // Mobile: 2 items
      } else if (width < 1024) {
        setItemsPerPage(3); // Tablet: 3 items
      } else {
        setItemsPerPage(5); // Desktop: 5 items
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalProducts = products.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  // Reset page if out of bounds after resize
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [itemsPerPage, totalPages, currentPage]);

  const handleNext = useCallback(() => {
    if (isTransitioning || totalPages <= 1) return;
    setIsTransitioning(true);
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, totalPages]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || totalPages <= 1) return;
    setIsTransitioning(true);
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning, totalPages]);

  // Autoplay functionality
  useEffect(() => {
    if (isPaused || totalPages <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalPages, handleNext]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !e.changedTouches || !e.changedTouches[0]) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // RTL Swipe: Swipe Left moves to next, Swipe Right moves to prev
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!products || products.length === 0) {
    return null;
  }

  // Calculate visible slice of products for current page
  const startIndex = currentPage * itemsPerPage;
  let visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  // If fewer products remain on final page, loop back to fill row neatly
  if (visibleProducts.length < itemsPerPage && products.length >= itemsPerPage) {
    const fillCount = itemsPerPage - visibleProducts.length;
    visibleProducts = [...visibleProducts, ...products.slice(0, fillCount)];
  }

  return (
    <section
      className="relative w-full py-12 md:py-16 overflow-hidden select-none font-vazirmatn"
      aria-label="محصولات پرفروش شیخ"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={containerRef}
    >
      {/* Background ambient lighting glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-amber-600/10 blur-[120px] rounded-full transform -translate-y-6" />
        <div className="w-[350px] h-[200px] bg-orange-500/10 blur-[90px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-3 tracking-wider shadow-sm">
            <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 animate-pulse" />
            <span>BEST SELLERS</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100 bg-clip-text text-transparent drop-shadow-md">
            محبوب‌ترین انتخاب‌های شیخ
          </h2>

          {/* Subtitle */}
          <p className="text-stone-300 text-xs sm:text-sm md:text-base mt-2 opacity-85">
            پرفروش‌ترین محصولات فروشگاه شیخ
          </p>
        </div>

        {/* Carousel Showcase Container */}
        <div
          className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[310px] flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Navigation Chevron Left (Previous Page in RTL) */}
          {totalPages > 1 && (
            <button
              onClick={handlePrev}
              disabled={isTransitioning}
              aria-label="صفحه قبلی محصولات پرفروش"
              className="absolute left-1 sm:left-2 md:left-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600/30 hover:border-amber-400/60 transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Animated Visible Products Group */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{
                opacity: 0,
                scale: 0.85,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.75,
                filter: 'blur(12px)',
              }}
              transition={{
                duration: 0.45,
                ease: [0.25, 1, 0.5, 1],
              }}
              className="w-full flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-8 sm:px-12 md:px-16"
            >
              {visibleProducts.map((product, idx) => {
                const primaryImage =
                  product.images?.find((img) => img.isFeatured)?.secureUrl ||
                  product.images?.[0]?.secureUrl ||
                  product.images?.[0]?.image ||
                  '/images/placeholder.jpg';

                const optimizedImageUrl = getOptimizedCloudinaryUrl(primaryImage, {
                  width: 320,
                  quality: 75,
                  crop: 'limit',
                });

                const productUrl = `/products/${product.slug || product.id}`;

                return (
                  <motion.div
                    key={`${product.id}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <Link
                      href={productUrl}
                      className="flex flex-col items-center focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-full"
                    >
                      {/* Double Glowing Golden Ring Outer Wrapper */}
                      <div className="relative p-1 sm:p-1.5 md:p-2 rounded-full transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-1">
                        {/* Outer Glow Ring */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/40 via-yellow-500/20 to-amber-600/40 blur-md group-hover:blur-lg opacity-70 group-hover:opacity-100 transition-all duration-500" />

                        {/* Golden Double Border Frame */}
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full p-[2px] bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-xl shadow-amber-950/40 overflow-hidden">
                          {/* Inner Border Ring Spacer */}
                          <div className="w-full h-full rounded-full p-[2px] bg-stone-950/90 relative overflow-hidden flex items-center justify-center">
                            {/* Inner Circle Image Container */}
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-amber-950/40 flex items-center justify-center">
                              <Image
                                src={optimizedImageUrl}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 120px, (max-width: 768px) 150px, (max-width: 1024px) 180px, 200px"
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                priority={currentPage === 0 && idx < 2}
                              />

                              {/* Decorative Radial Glass Reflection Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Product Title */}
                      <h3 className="mt-3 text-xs sm:text-sm md:text-base font-bold text-stone-200 group-hover:text-amber-300 transition-colors duration-300 text-center max-w-[110px] sm:max-w-[140px] md:max-w-[170px] line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Chevron Right (Next Page in RTL) */}
          {totalPages > 1 && (
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              aria-label="صفحه بعدی محصولات پرفروش"
              className="absolute right-1 sm:right-2 md:right-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-stone-900/70 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600/30 hover:border-amber-400/60 transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Circular Pagination Indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const isActive = pageIdx === currentPage;
              return (
                <button
                  key={pageIdx}
                  onClick={() => {
                    if (isTransitioning || pageIdx === currentPage) return;
                    setIsTransitioning(true);
                    setDirection(pageIdx > currentPage ? 1 : -1);
                    setCurrentPage(pageIdx);
                    setTimeout(() => setIsTransitioning(false), 600);
                  }}
                  aria-label={`رفتن به صفحه ${pageIdx + 1} پرفروش‌ها`}
                  className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                    isActive
                      ? 'w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-md shadow-amber-500/50 scale-110'
                      : 'w-2.5 h-2.5 bg-stone-800 border border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
