'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, EffectCoverflow } from 'swiper/modules';
import Link from 'next/link';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

export interface SpecialProduct {
  id: string;
  name: string;
  slug?: string | null;
  basePrice: number;
  images?: Array<{ secureUrl?: string | null; image?: string | null }> | null;
}

interface BMWCarouselProps {
  products?: SpecialProduct[];
}

export default function BMWCarousel({ products }: BMWCarouselProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  if (!isDesktop || !products || products.length === 0) {
    return null;
  }

  return (
    <div
      className="hidden lg:flex min-h-screen items-center justify-center p-4"
      style={{ backgroundColor: '#3E1F0F' }}
    >
      <div className="w-full max-w-6xl">
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2.75}
          speed={600}
          loop={products.length >= 3}
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
          {products.map((product) => {
            const imageUrl =
              product.images?.[0]?.secureUrl ||
              product.images?.[0]?.image ||
              '/placeholder.webp';

            return (
              <SwiperSlide key={product.id}>
                {({ isActive }) => (
                  <div
                    className="relative h-96 rounded-2xl overflow-hidden filter grayscale-[0.6] bg-cover bg-center flex flex-col justify-end items-center pb-20"
                    style={{
                      backgroundImage: `url('${imageUrl}')`,
                    }}
                  >
                    <div
                      className={`text-center transition-opacity duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <h2 className="text-white text-xl font-normal uppercase tracking-wider mb-2">
                        {product.name}
                      </h2>
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="inline-block px-7 py-2 bg-white text-[#717171] font-medium text-sm uppercase rounded-full hover:text-[#005baa] transition-colors"
                      >
                        explore
                      </Link>
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
