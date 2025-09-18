'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { ProductsWithImages, Unit } from '@/types';
import ProductItemCompact from '@/modules/products/components/ProductItemCompact';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductCarouselMobileProps {
  products: ProductsWithImages[];
  units?: Unit[];
  title?: string;
  subtitle?: string;
  autoplay?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export default function ProductCarouselMobile({
  products,
  units = [],
  title = 'Featured Products',
  subtitle = 'Swipe to explore more',
  autoplay = true,
  showPagination = true,
  showNavigation = false,
}: ProductCarouselMobileProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No products available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 text-sm">{subtitle}</p>
      </div>

      {/* Swiper Carousel */}
      <div className="px-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          centeredSlides={false}
          grabCursor={true}
          autoplay={autoplay ? {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          } : false}
          pagination={showPagination ? {
            clickable: true,
            dynamicBullets: true,
            bulletClass: 'swiper-pagination-bullet !bg-amber-500/50',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-amber-500',
          } : false}
          navigation={showNavigation}
          breakpoints={{
            320: {
              slidesPerView: 1.5,
              spaceBetween: 12,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="!pb-12"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id}>
              <div className="h-full">
                <ProductItemCompact 
                  product={product} 
                  index={index} 
                  units={units} 
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 0 !important;
        }
        
        .swiper-pagination-bullet {
          width: 8px !important;
          height: 8px !important;
          margin: 0 4px !important;
          background: rgba(245, 158, 11, 0.3) !important;
          opacity: 1 !important;
          transition: all 0.3s ease !important;
        }
        
        .swiper-pagination-bullet-active {
          background: #f59e0b !important;
          transform: scale(1.2) !important;
        }
        
        .swiper-button-next,
        .swiper-button-prev {
          color: #f59e0b !important;
          background: rgba(0, 0, 0, 0.5) !important;
          border-radius: 50% !important;
          width: 40px !important;
          height: 40px !important;
          margin-top: -20px !important;
        }
        
        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 16px !important;
        }
        
        .swiper-button-disabled {
          opacity: 0.3 !important;
        }
      `}</style>
    </div>
  );
}


