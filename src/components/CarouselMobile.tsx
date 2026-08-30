'use client';

import React, { useCallback, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Type definition for carousel images
type CarouselImage = { 
  id?: string | number; 
  topTitle?: string;
  subtitle?: string;
  title: string; 
  ctaText?: string;
  ctaLink?: string;
  url: string;
  alt?: string;
};

// Fallback placeholder image for failed loads
const FALLBACK_IMAGE = '/noImage.jpg';

interface MobileCarouselProps {
  autoPlayInterval?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

const fetchCarouselData = async (): Promise<CarouselImage[]> => {
  const res = await fetch('/api/mobile-carousel');
  if (!res.ok) {
    throw new Error('Failed to fetch carousel data');
  }
  const data = await res.json();
  return data.map((slide: any) => ({
    id: slide.id,
    topTitle: slide.topTitle || 'فروشگاه شیخ',
    subtitle: slide.subtitle || 'international store',
    title: slide.title || 'کیفیت و اصالت بی‌نظیر را با ما تجربه کنید',
    ctaText: slide.ctaText || 'مشاهده فروشگاه',
    ctaLink: slide.link || '/products',
    url: slide.image || FALLBACK_IMAGE,
    alt: slide.title || 'Promotional Slide',
  }));
};

export default function MobileCarousel({ 
  autoPlayInterval = 5000,
  showPagination = true,
  showNavigation = false
}: MobileCarouselProps) {
  const { data: images = [], isLoading, isError } = useQuery({
    queryKey: ['mobileCarousel'],
    queryFn: fetchCarouselData,
    staleTime: 5 * 60 * 1000,
  });

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to handle image load failures
  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  // Function to get image source with fallback
  const getImageSource = useCallback((imageUrl: string) => {
    return (!imageUrl || failedImages.has(imageUrl)) ? FALLBACK_IMAGE : imageUrl;
  }, [failedImages]);

  // Handle CTA button click
  const handleCTAClick = useCallback((link?: string) => {
    if (link) {
      window.location.href = link;
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full block md:hidden" aria-hidden={false}>
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-neutral-950 mx-auto max-w-sm sm:max-w-md h-[220px] sm:h-[280px] flex items-center justify-center border border-amber-500/10">
          <p className="text-amber-200/60 font-vazirmatn text-sm animate-pulse">در حال بارگذاری پیشنهادها...</p>
        </div>
      </div>
    );
  }

  if (isError || images.length === 0) {
    return (
      <div className="w-full block md:hidden" aria-hidden={false}>
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-neutral-950 mx-auto max-w-sm sm:max-w-md h-[220px] sm:h-[280px] flex items-center justify-center border border-amber-500/10">
          <p className="text-amber-200/60 font-vazirmatn text-sm">خطا در بارگذاری تصاویر</p>
        </div>
      </div>
    );
  }

  return (
    // Strictly mobile-only visibility
    <div className="w-full block md:hidden" aria-hidden={false}>
      {/* Carousel Container - Mobile-only with premium dark-glass luxury design */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-stone-950 mx-auto max-w-sm sm:max-w-md border border-amber-500/10">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          centeredSlides={true}
          grabCursor={true}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: autoPlayInterval,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={showNavigation ? {
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          } : false}
          pagination={showPagination ? {
            clickable: true,
            el: '.swiper-pagination-custom',
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          } : false}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="h-[220px] sm:h-[280px]"
        >
          {images.map((img, index) => {
            const topTitle = img.topTitle || 'فروشگاه شیخ';
            const subtitle = img.subtitle || 'international store';
            const title = img.title || 'کیفیت و اصالت بی‌نظیر را با ما تجربه کنید';
            const ctaText = img.ctaText || 'مشاهده فروشگاه';
            const ctaLink = img.ctaLink || '/products';

            return (
              <SwiperSlide key={img.id || index}>
                {/* Card container */}
                <div className="h-full p-3">
                  <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-gradient-to-br from-neutral-900/90 to-stone-950/90 border border-amber-500/10">
                    {/* Content row: right text, left image (RTL Layout) */}
                    <div className="absolute inset-0 flex flex-row-reverse items-center" dir="rtl">
                      <div className="flex-1 px-5 py-4 flex flex-col h-full text-right items-start">
                        {/* Shop name / Top Title */}
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-amber-300 text-[11px] sm:text-xs font-semibold tracking-wide font-vazirmatn">{topTitle}</span>
                          <div className="w-5 h-5 rounded-md bg-amber-500/90 flex items-center justify-center shadow shadow-amber-500/20">
                            <span className="text-[10px] leading-none">👑</span>
                          </div>
                        </div>

                        {/* Title */}
                        <motion.h2
                          className="text-[17px] xs:text-[19px] sm:text-2xl font-extrabold text-amber-100 leading-tight mb-1 text-right font-vazirmatn select-none"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                        >
                          {title}
                        </motion.h2>

                        {/* Subtitle */}
                        <motion.p
                          className="text-stone-300 text-[10px] xs:text-[11px] sm:text-xs leading-relaxed mb-4 text-right font-vazirmatn select-none"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.15 }}
                        >
                          {subtitle}
                        </motion.p>

                        {/* CTA at bottom */}
                        <div className="mt-auto">
                          <motion.button
                            onClick={() => handleCTAClick(ctaLink)}
                            className="px-4 py-2 xs:px-5 xs:py-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-stone-950 font-extrabold text-xs shadow-lg shadow-amber-500/10 active:scale-95 transition-all font-vazirmatn"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label={`${ctaText} for ${title}`}
                          >
                            {ctaText}
                          </motion.button>
                        </div>
                      </div>

                      {/* Left-aligned product image */}
                      <div className="w-1/2 h-full relative">
                        <Image
                          src={getImageSource(img.url)}
                          alt={img.alt || title}
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 768px) 50vw, 50vw"
                          priority={index === 0}
                          onError={() => handleImageError(img.url)}
                        />
                      </div>
                    </div>

                    {/* Premium subtle gold gradient bar at the bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation Arrows - Enhanced for mobile */}
        {showNavigation && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-stone-800 hover:scale-105 z-20 border border-amber-500/10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-stone-800 hover:scale-105 z-20 border border-amber-500/10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Custom Pagination - Raised Pill Style */}
        {showPagination && images.length > 1 && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20">
            <div className="swiper-pagination-custom flex items-center justify-center gap-3 px-5 py-2 bg-neutral-900/90 border border-amber-500/20 backdrop-blur-md rounded-full shadow-2xl">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  className={`swiper-pagination-bullet-custom transition-all duration-500 focus:outline-none ${
                    index === activeIndex 
                      ? 'w-2.5 h-2.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/30'
                      : 'w-2 h-2 bg-stone-600/60 rounded-full hover:bg-stone-500/80'
                  }`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .swiper-button-prev-custom:after,
        .swiper-button-next-custom:after {
          display: none;
        }
        
        .swiper-pagination-custom {
          position: static !important;
          margin-top: 0 !important;
        }
        
        .swiper-pagination-bullet-custom {
          margin: 0 !important;
          opacity: 1 !important;
        }
        
        .swiper-pagination-bullet-active-custom {
          background: linear-gradient(to right, #f59e0b, #f97316) !important;
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}
