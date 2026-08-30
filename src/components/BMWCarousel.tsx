'use client';

import React, { useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import { useQuery } from '@tanstack/react-query';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary-url';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export interface Slide {
  id: string | number;
  title: string;
  image: string;
}

const DEFAULT_IMAGES = [
  '/assets/carousel/carousel1.jpg',
  '/assets/carousel/carousel2.jpg',
  '/assets/carousel/carousel3.jpg',
  '/assets/carousel/carousel4.jpg',
  '/assets/carousel/carousel5.jpg',
];

const DEFAULT_SLIDES: Slide[] = DEFAULT_IMAGES.map((image, index) => ({
  id: index + 1,
  title: `Class ${String.fromCharCode(65 + index)}`, // A, B, C, ...
  image,
}));

const fetchBmwCarousel = async (): Promise<Slide[]> => {
  const res = await fetch('/api/bmw-carousel');
  if (!res.ok) {
    return DEFAULT_SLIDES;
  }
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return DEFAULT_SLIDES;
  }

  return data.map((item: any, index: number) => ({
    id: item.id || index + 1,
    title: item.title || `Class ${String.fromCharCode(65 + (index % 26))}`,
    image: item.imageUrl || item.image || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length],
  }));
};

interface BMWCarouselProps {
  initialSlides?: Slide[];
}

export default function BMWCarousel({ initialSlides }: BMWCarouselProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const { data: slides = initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES } = useQuery({
    queryKey: ['bmwCarouselData'],
    queryFn: fetchBmwCarousel,
    initialData: initialSlides && initialSlides.length > 0 ? initialSlides : undefined,
    staleTime: 5 * 60 * 1000,
  });

  const [failedImages, setFailedImages] = useState<Set<string | number>>(new Set());

  if (!isDesktop) {
    return null;
  }

  const effectiveSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;

  return (
    <div
      className="hidden lg:flex min-h-[500px] items-center justify-center p-4"
      style={{ backgroundColor: '#3E1F0F' }}
    >
      <div className="w-full max-w-6xl">
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2.75}
          speed={600}
          loop={effectiveSlides.length > 1}
          modules={[EffectCoverflow, Pagination]}
          pagination={{
            el: '.custom-pagination',
            clickable: false,
          }}
          coverflowEffect={{
            rotate: 10,
            stretch: 0,
            depth: 100,
            modifier: 3,
            slideShadows: true,
          }}
          className="pb-16"
        >
          {effectiveSlides.map((slide, index) => {
            const isFailed = failedImages.has(slide.id);
            const rawImageSrc = isFailed ? DEFAULT_IMAGES[index % DEFAULT_IMAGES.length] : slide.image;
            const imageSrc = getOptimizedCloudinaryUrl(rawImageSrc, { width: 800, quality: 75 });

            return (
              <SwiperSlide key={slide.id}>
                {({ isActive }) => (
                  <div
                    className="relative h-96 rounded-2xl overflow-hidden filter grayscale-[0.6] bg-cover bg-center flex flex-col justify-end items-center pb-20 shadow-2xl"
                    style={{
                      backgroundImage: `url('${imageSrc}')`,
                    }}
                  >
                    {/* Fallback img tag for error detection */}
                    <img
                      src={imageSrc}
                      alt={slide.title}
                      className="hidden"
                      loading="lazy"
                      onError={() => {
                        setFailedImages((prev) => new Set(prev).add(slide.id));
                      }}
                    />
                    <div
                      className={`text-center transition-opacity duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <h2 className="text-white text-xl font-normal uppercase tracking-wider mb-2">
                        {slide.title}
                      </h2>
                      <a
                        href="#"
                        className="inline-block px-7 py-2 bg-white text-[#717171] font-medium text-sm uppercase rounded-full hover:text-[#005baa] transition-colors"
                      >
                        explore
                      </a>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="custom-pagination flex justify-center gap-2 mt-8 scale-150"></div>
      </div>
    </div>
  );
}
