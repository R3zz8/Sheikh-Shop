'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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

// Mock Cloudinary image URLs - replace with Prisma data later
const mockImages: CarouselImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=450&fit=crop&crop=center',
    alt: 'Premium Honey Collection',
    title: 'Premium Honey Collection',
    ctaText: 'Shop Now',
    ctaLink: '/categories/honey'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1615485290382-9e1c8c46f2c7?w=800&h=450&fit=crop&crop=center',
    alt: 'Exclusive Saffron',
    title: 'Exclusive Saffron',
    ctaText: 'Explore',
    ctaLink: '/categories/saffron'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1603046891744-76e6300f82b8?w=800&h=450&fit=crop&crop=center',
    alt: 'Artisan Dates',
    title: 'Artisan Dates',
    ctaText: 'Discover',
    ctaLink: '/categories/dates'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=450&fit=crop&crop=center',
    alt: 'Premium Collection',
    title: 'Premium Collection',
    ctaText: 'View All',
    ctaLink: '/products'
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
  showNavigation = false
}: MobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps'
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Function to handle image load failures
  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl));
  }, []);

  // Function to get image source with fallback
  const getImageSource = useCallback((imageUrl: string) => {
    return failedImages.has(imageUrl) ? FALLBACK_IMAGE : imageUrl;
  }, [failedImages]);

  // Deduplicate images to guarantee unique keys
  const imagesUnique = useMemo(() => {
    const seen = new Set<string>();
    return images.filter((img, idx) => {
      const k = img?.id ?? img?.publicId ?? img?.public_id ?? img?.src ?? String(idx);
      if (seen.has(String(k))) return false;
      seen.add(String(k));
      return true;
    });
  }, [images]);

  // Update scroll snaps when carousel is ready
  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  // Update selected index when scroll changes
  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  // Scroll to specific slide
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on('init', onInit);
    emblaApi.on('select', onSelect);

    // Auto-play with interval
    const autoPlay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, autoPlayInterval);

    return () => {
      emblaApi.off('init', onInit);
      emblaApi.off('select', onSelect);
      clearInterval(autoPlay);
    };
  }, [emblaApi, onInit, onSelect, autoPlayInterval]);

  // Handle CTA button click
  const handleCTAClick = useCallback((link?: string) => {
    if (link) {
      window.location.href = link;
    }
  }, []);

  return (
    <div className="w-full md:hidden">
      {/* Carousel Container - Full-width mobile layout */}
      <div className="relative overflow-hidden shadow-lg">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {imagesUnique.map((img, i) => {
              // Create a truly unique key
              const baseKey = 
                img.id ? 
                  `id-${img.id}` : 
                  img.publicId ? 
                    `publicId-${img.publicId}` : 
                    img.public_id ? 
                      `public_id-${img.public_id}` : 
                      img.src ? 
                        `src-${img.src}` : 
                        `url-${img.url}`;
              
              return (
                <motion.div
                  key={`slide-${baseKey}`}
                  className="relative flex-[0_0_100%] min-w-0"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {/* Fixed height container with 16:9 aspect ratio */}
                  <div className="relative h-[200px] w-full overflow-hidden">
                    {/* Curved gradient background (SVG) */}
                    <svg
                      className="absolute inset-0 w-full h-full z-0"
                      viewBox="0 0 1440 320"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="mc-gradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#fcd34d" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,160L80,165.3C160,171,320,181,480,186.7C640,192,800,192,960,181.3C1120,171,1280,149,1360,138.7L1440,128L1440,0L0,0Z"
                        fill="url(#mc-gradient)"
                        fillOpacity="1"
                      />
                    </svg>
                    <Image
                      src={getImageSource(img.url)}
                      alt={img.alt}
                      fill
                      className="object-cover z-10"
                      sizes="(max-width: 768px) 100vw, 0vw"
                      priority={i === 0}
                      onError={() => handleImageError(img.url)}
                    />
                    
                    {/* Semi-transparent overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/30 z-20" />
                    
                    {/* Gradient overlay for premium look */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />
                    
                    {/* Content overlay - centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-30">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-white drop-shadow-md mb-4 leading-tight">
                        {img.title}
                      </h3>
                      
                      {/* CTA Button */}
                      {img.ctaText && (
                        <motion.button
                          onClick={() => handleCTAClick(img.ctaLink)}
                          className="px-4 py-2 bg-white text-black rounded-lg shadow font-medium text-sm hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={`${img.ctaText} for ${img.title}`}
                        >
                          {img.ctaText}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows - Only show if enabled */}
        {showNavigation && (
          <>
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next slide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots - Digikala style */}
      {showPagination && scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4 px-4">
          {scrollSnaps.map((_, index) => {
            const dotKey = imagesUnique[index] ? 
              `dot-${imagesUnique[index]?.id || imagesUnique[index]?.publicId || imagesUnique[index]?.public_id || imagesUnique[index]?.src || imagesUnique[index]?.url}` : 
              `dot-fallback-${index}`;
            
            return (
              <motion.button
                key={dotKey}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
                  index === selectedIndex 
                    ? 'bg-amber-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === selectedIndex ? 'true' : 'false'}
              />
            );
          })}
        </div>
      )}

      {/* Slide Counter - Optional, can be removed for cleaner look */}
      {showPagination && scrollSnaps.length > 1 && (
        <div className="text-center mt-2 text-xs text-gray-500 font-medium">
          {selectedIndex + 1} / {imagesUnique.length}
        </div>
      )}
    </div>
  );
}
