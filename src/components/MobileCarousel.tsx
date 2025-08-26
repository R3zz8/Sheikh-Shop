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
};

// Mock Cloudinary image URLs - replace with Prisma data later
const mockImages: CarouselImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=400&fit=crop&crop=center',
    alt: 'Premium Honey Collection',
    title: 'Premium Honey Collection'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1615485290382-9e1c8c46f2c7?w=800&h=400&fit=crop&crop=center',
    alt: 'Exclusive Saffron',
    title: 'Exclusive Saffron'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1603046891744-76e6300f82b8?w=800&h=400&fit=crop&crop=center',
    alt: 'Artisan Dates',
    title: 'Artisan Dates'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&crop=center',
    alt: 'Premium Collection',
    title: 'Premium Collection'
  }
];

// Fallback placeholder image for failed loads
const FALLBACK_IMAGE = '/noImage.jpg'; // Use your existing noImage.jpg

interface MobileCarouselProps {
  images?: CarouselImage[];
  autoPlayInterval?: number;
  showPagination?: boolean;
}

export default function MobileCarousel({ 
  images = mockImages, 
  autoPlayInterval = 5000,
  showPagination = true 
}: MobileCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    skipSnaps: false,
    dragFree: false
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

  // Deduplicate images to guarantee unique keys without visual change
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

  return (
    <div className="w-full md:hidden">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {imagesUnique.map((img, i) => {
              // Create a truly unique key without using array index
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
                  <div className="relative h-40 w-full">
                    <Image
                      src={getImageSource(img.url)}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 0vw"
                      priority={i === 0}
                      onError={() => handleImageError(img.url)}
                    />
                    {/* Image overlay with title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                        {img.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          aria-label="Previous slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
          aria-label="Next slide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Pagination Dots */}
      {showPagination && scrollSnaps.length > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          {scrollSnaps.map((_, index) => {
            const dotKey = imagesUnique[index] ? 
              `dot-${imagesUnique[index]?.id || imagesUnique[index]?.publicId || imagesUnique[index]?.public_id || imagesUnique[index]?.src || imagesUnique[index]?.url}` : 
              `dot-fallback-${index}`;
            
            return (
              <motion.button
                key={dotKey}
                onClick={() => scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? 'bg-red-500 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}

      {/* Slide Counter */}
      <div className="text-center mt-2 text-sm text-gray-500">
        {selectedIndex + 1} / {imagesUnique.length}
      </div>
    </div>
  );
}
