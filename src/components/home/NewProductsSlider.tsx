'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft, Eye } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { resolveProductPrice } from '@/lib/product-pricing';
import { formatToToman } from '@/lib/currency';
import { getOrGenerateExcerpt, stripHtmlTags } from '@/lib/seo/sanitize';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface NewProductsSliderProps {
  products: ProductsWithImages[] | any[];
}

function NewProductCard({ product }: { product: ProductsWithImages | any }) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]?.secureUrl || product.images[0]?.image || '/noImage.jpg'
      : '/noImage.jpg';

  const pricing = useMemo(() => resolveProductPrice(product, null), [product]);

  const cleanExcerpt = useMemo(() => {
    const rawExcerpt = getOrGenerateExcerpt(
      product.description || null,
      (product as Record<string, unknown>).excerpt as string | null
    );
    return stripHtmlTags(rawExcerpt || 'محصول جدید و اصیل مجموعه شیخ')
      .replace(/\s+/g, ' ')
      .trim();
  }, [product.description, (product as Record<string, unknown>).excerpt]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border border-amber-500/20 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-[390px] sm:h-[410px] relative group/card">
      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col h-full">
        {/* Product Image Stage */}
        <div className="relative h-48 sm:h-52 w-full bg-gradient-to-b from-stone-50/90 to-amber-50/30 p-4 flex items-center justify-center overflow-hidden border-b border-amber-500/10 shrink-0">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 85vw, (max-width: 1024px) 45vw, 25vw"
            className="object-contain p-3 transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />

          {/* New Badge - Champagne / Gold with Dark Chocolate Text */}
          <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-[#2C1A11] font-black text-[11px] px-3 py-1 rounded-full shadow-md border border-amber-500/30 font-vazirmatn">
            <Sparkles className="w-3.5 h-3.5 text-[#2C1A11]" />
            <span>جدید</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow justify-between text-right space-y-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[#2C1A11] line-clamp-1 group-hover/card:text-amber-800 transition-colors font-vazirmatn">
              {product.name}
            </h3>
            <p className="text-xs text-[#5D4037] line-clamp-2 mt-1.5 leading-relaxed font-vazirmatn">
              {cleanExcerpt}
            </p>
          </div>

          {/* Bottom Price & Action Row */}
          <div className="pt-3 border-t border-amber-500/15 flex items-center justify-between gap-2 mt-auto">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-[#78350F]/70 font-vazirmatn">قیمت محصول</span>
              <span className="text-base sm:text-lg font-black text-[#92400E] font-vazirmatn">
                {formatToToman(pricing.price)}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#2C1A11] text-amber-300 group-hover/card:bg-amber-600 group-hover/card:text-white flex items-center justify-center transition-all duration-300 shadow-sm shrink-0">
              <ArrowLeft className="w-4 h-4 group-hover/card:-translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function NewProductsSlider({ products }: NewProductsSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="محصولات جدید"
      className="w-full py-6 sm:py-10 md:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/*
          THE FLOATING SHOWCASE CONTAINER
          Creates a striking visual separation from Sheikh Shops' dark chocolate page background.
        */}
        <div className="relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-b from-[#FAF7F2] via-[#F3EAD8] to-[#EADBC8] border border-amber-500/30 p-5 sm:p-8 lg:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden">
          {/* Subtle Warm Radial Ambient Lighting */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row (Inside Showcase Background) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 border-b border-amber-900/15 pb-5 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-[#2C1A11] border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-lg shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse text-amber-400" />
              </div>
              <div className="text-right">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#2C1A11] leading-tight font-vazirmatn">
                  محصولات جدید شیخ
                </h2>
                <p className="text-xs sm:text-sm text-[#5D4037] mt-1 font-vazirmatn font-medium">
                  جدیدترین محصولات افزوده‌شده به مجموعه اختصاصی و لوکس شیخ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
              {/* Navigation Arrows in Header to prevent image overlap */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  className="swiper-button-prev-new-products w-10 h-10 rounded-xl bg-[#2C1A11] hover:bg-amber-700 text-amber-300 hover:text-white border border-amber-500/30 flex items-center justify-center transition-all duration-300 shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات قبلی"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  className="swiper-button-next-new-products w-10 h-10 rounded-xl bg-[#2C1A11] hover:bg-amber-700 text-amber-300 hover:text-white border border-amber-500/30 flex items-center justify-center transition-all duration-300 shadow-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات بعدی"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <Link
                href="/products?sort=newest"
                className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#2C1A11] hover:bg-[#3E2723] border border-amber-500/30 text-amber-200 hover:text-white text-xs sm:text-sm font-bold transition-all duration-300 shadow-md font-vazirmatn"
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
                320: { slidesPerView: 1.15, spaceBetween: 12 },
                480: { slidesPerView: 1.8, spaceBetween: 14 },
                768: { slidesPerView: 2.5, spaceBetween: 18 },
                1024: { slidesPerView: 3.2, spaceBetween: 20 },
                1280: { slidesPerView: 4, spaceBetween: 24 },
              }}
              className="new-products-swiper !py-2"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <NewProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>

      {/* Embedded Swiper Custom Styles */}
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
