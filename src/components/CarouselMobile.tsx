'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Type definition for carousel images
type CarouselImage = { 
  id?: string | number; 
  publicId?: string; 
  public_id?: string; 
  src?: string;
  url: string; 
  alt: string; 
  title: string; 
  ctaText?: string;
  ctaLink?: string;
};

import { useQuery } from '@tanstack/react-query';

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
    url: slide.image,
    alt: slide.title,
    title: slide.title,
    ctaText: 'Shop Now',
    ctaLink: slide.link
  }));
};

export default function MobileCarousel({ 
  autoPlayInterval = 5000,
  showPagination = true,
  showNavigation = false
}: MobileCarouselProps) {
  const { data: images = [], isLoading, isError } = useQuery({
    queryKey: ['mobileCarousel'],
    queryFn: fetchCarouselData
  });

  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);

  // Function to handle image load failures
  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  // Function to get image source with fallback
  const getImageSource = useCallback((imageUrl: string) => {
    return failedImages.has(imageUrl) ? FALLBACK_IMAGE : imageUrl;
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
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black mx-auto max-w-sm sm:max-w-md h-[220px] sm:h-[280px] flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || images.length === 0) {
    return (
      <div className="w-full block md:hidden" aria-hidden={false}>
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black mx-auto max-w-sm sm:max-w-md h-[220px] sm:h-[280px] flex items-center justify-center">
          <p className="text-white">Could not load slides.</p>
        </div>
      </div>
    );
  }

  return (
    // Strictly mobile-only visibility
    <div className="w-full block md:hidden" aria-hidden={false}>
      {/* Carousel Container - Mobile-only with IranYadak style design */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-black mx-auto max-w-sm sm:max-w-md">
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
          {images.map((img, index) => (
            <SwiperSlide key={img.id || index}>
              {/* Card container */}
              <div className="h-full p-3">
                <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black border border-white/10">
                  {/* Content row: left text, right image */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="flex-1 px-5 py-4 flex flex-col h-full">
                      {/* Shop name */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-amber-500/90 flex items-center justify-center shadow">
                          <span className="text-[12px] leading-none">👑</span>
                        </div>
                        <span className="text-amber-300 text-sm font-semibold tracking-wide">Sheikh Shop</span>
                      </div>
                      {/* Title */}
                      <motion.h2
                        className="text-3xl sm:text-4xl font-extrabold text-amber-50 leading-tight mb-4 text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      >
                        {img.title}
                      </motion.h2>
                      {/* CTA at bottom-left */}
                      <div className="mt-auto">
                        {img.ctaText && (
                          <motion.button
                            onClick={() => handleCTAClick(img.ctaLink)}
                            className="px-6 py-3 rounded-full bg-amber-50 text-stone-900 font-bold text-sm shadow-lg active:scale-95 transition-all"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            aria-label={`${img.ctaText} for ${img.title}`}
                          >
                            {img.ctaText}
                          </motion.button>
                        )}
                      </div>
                    </div>
                    {/* Right-aligned product image */}
                    <div className="w-1/2 h-full relative">
                      <Image
                        src={getImageSource(img.url)}
                        alt={img.alt}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 50vw, 50vw"
                        priority={index === 0}
                        onError={() => handleImageError(img.url)}
                      />
                    </div>
                  </div>
                  {/* Cream highlight bottom section */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-amber-50/90" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows - Enhanced for mobile */}
        {showNavigation && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/25 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/35 hover:scale-110 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/40 z-20 border border-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            
            <button
              className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/25 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/35 hover:scale-110 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/40 z-20 border border-white/20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </>
        )}

        {/* Custom Pagination - IranYadak Raised Pill Style */}
        {showPagination && images.length > 1 && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-20">
            <div className="swiper-pagination-custom flex items-center justify-center gap-3 px-6 py-2 bg-amber-50 rounded-full shadow-xl ring-1 ring-stone-200">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  className={`swiper-pagination-bullet-custom transition-all duration-500 focus:outline-none ${
                    index === activeIndex 
                      ? 'w-2.5 h-2.5 bg-stone-900 rounded-full shadow' 
                      : 'w-2.5 h-2.5 bg-stone-400/60 rounded-full hover:bg-stone-500/80'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
          background: linear-gradient(to right, #f97316, #ea580c) !important;
          transform: scale(1.2) !important;
        }
      `}</style>
    </div>
  );
}
