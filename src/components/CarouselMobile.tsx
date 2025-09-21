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

// Mock data matching the design reference
const mockImages: CarouselImage[] = [
  {
    id: 1,
    url: '/dates.jpg',
    alt: 'Artisan Dates',
    title: 'Artisan Dates',
    ctaText: 'Discover',
    ctaLink: '/categories/dates'
  },
  {
    id: 2,
    url: '/honey.jpg',
    alt: 'Pure Honey',
    title: 'Pure Honey',
    ctaText: 'Shop Now',
    ctaLink: '/categories/honey'
  },
  {
    id: 3,
    url: '/saffron.jpg',
    alt: 'Saffron Collection',
    title: 'Saffron Collection',
    ctaText: 'Explore',
    ctaLink: '/categories/saffron'
  }
];

// Fallback placeholder image for failed loads
const FALLBACK_IMAGE = '/noImage.jpg';

interface MobileCarouselProps {
  images?: CarouselImage[];
  autoPlayInterval?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export default function MobileCarousel({ 
  images = mockImages, 
  autoPlayInterval = 5000,
  showPagination = true,
  showNavigation = true
}: MobileCarouselProps) {
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

  return (
    <div className="w-full block md:hidden">
      {/* Carousel Container - Mobile-only with IranYadak style design */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-amber-950 to-stone-900">
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
          className="h-[280px]"
        >
          {images.map((img, index) => (
            <SwiperSlide key={img.id || index}>
              <div className="relative h-full w-full">
                {/* Background Image */}
                <Image
                  src={getImageSource(img.url)}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  priority={index === 0}
                  onError={() => handleImageError(img.url)}
                />
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40" />
                
                {/* Gradient overlay for premium look */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Content overlay - IranYadak style centered layout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
                  {/* Sheikh Shop Brand - Enhanced */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg font-bold">👑</span>
                    </div>
                    <span className="text-amber-200 font-bold text-lg tracking-wider">Sheikh Shop</span>
                  </div>
                  
                  {/* Title - Enhanced typography */}
                  <motion.h2 
                    className="text-4xl font-black text-white drop-shadow-2xl mb-8 leading-tight tracking-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {img.title}
                  </motion.h2>
                  
                  {/* CTA Button - IranYadak style */}
                  {img.ctaText && (
                    <motion.button
                      onClick={() => handleCTAClick(img.ctaLink)}
                      className="px-10 py-4 bg-white text-gray-900 rounded-full shadow-2xl font-bold text-lg hover:bg-gray-50 hover:scale-105 hover:shadow-3xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent border-2 border-white/20"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      aria-label={`${img.ctaText} for ${img.title}`}
                    >
                      {img.ctaText}
                    </motion.button>
                  )}
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="swiper-pagination-custom flex items-center justify-center gap-3 px-6 py-3 bg-white/15 backdrop-blur-lg rounded-full shadow-2xl border border-white/30">
              {images.map((_, index) => (
                <motion.button
                  key={index}
                  className={`swiper-pagination-bullet-custom transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent ${
                    index === activeIndex 
                      ? 'w-10 h-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-full shadow-lg' 
                      : 'w-2.5 h-2.5 bg-gray-400/60 rounded-full hover:bg-gray-300/80 hover:scale-110'
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
