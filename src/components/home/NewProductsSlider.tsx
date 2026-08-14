'use client';

import React from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface NewProductsSliderProps {
  products: any[];
}

export default function NewProductsSlider({ products }: NewProductsSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="محصولات جدید"
      className="container-fluid pt-4 pb-8 md:py-10 relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Luxury Section Container Banner Header */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#2A1A12]/95 via-[#1C120C]/90 to-[#2A1A12]/95 border border-amber-500/20 shadow-[0_25px_50px_-12px_rgba(42,26,18,0.5)] backdrop-blur-xl overflow-hidden mb-6 md:mb-8">
          {/* Ambient Lighting & Glow Filters */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/[0.03] via-transparent to-amber-500/[0.03] pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/35 flex items-center justify-center text-amber-300 shadow-lg shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-right">
                <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight font-vazirmatn">
                  محصولات جدید شیخ
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 mt-1 font-vazirmatn">
                  جدیدترین محصولات افزوده‌شده به مجموعه اختصاصی و لوکس شیخ
                </p>
              </div>
            </div>

            <Link
              href="/products?sort=newest"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-200 hover:text-amber-100 text-xs sm:text-sm font-bold transition-all duration-300 shadow-sm shrink-0 self-end sm:self-center font-vazirmatn"
            >
              <span>مشاهده همه محصولات</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Swiper Slider Wrapper */}
        <div className="relative group/slider">
          <Swiper
            modules={[Navigation, Autoplay, Keyboard]}
            spaceBetween={16}
            slidesPerView={1}
            grabCursor={true}
            loop={products.length > 4}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next-new-products',
              prevEl: '.swiper-button-prev-new-products',
            }}
            keyboard={{
              enabled: true,
              onlyInViewport: true,
            }}
            breakpoints={{
              320: { slidesPerView: 1.2, spaceBetween: 12 },
              480: { slidesPerView: 2.1, spaceBetween: 14 },
              768: { slidesPerView: 3, spaceBetween: 18 },
              1024: { slidesPerView: 4, spaceBetween: 20 },
            }}
            className="new-products-swiper !py-3"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} variant="luxury" />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Luxury Navigation Arrows */}
          <button
            className="swiper-button-prev-new-products absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C120C]/90 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600 hover:border-amber-400 flex items-center justify-center transition-all duration-300 z-20 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="محصولات قبلی"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            className="swiper-button-next-new-products absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C120C]/90 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-600 hover:border-amber-400 flex items-center justify-center transition-all duration-300 z-20 shadow-xl disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="محصولات بعدی"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Embedded Swiper Custom Navigation Styles */}
      <style jsx global>{`
        .new-products-swiper .swiper-button-prev-new-products:after,
        .new-products-swiper .swiper-button-next-new-products:after {
          display: none;
        }

        .new-products-swiper .swiper-slide {
          height: auto !important;
        }
      `}</style>
    </section>
  );
}
