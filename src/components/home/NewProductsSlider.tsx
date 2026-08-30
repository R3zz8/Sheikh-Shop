'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { resolveProductPrice } from '@/lib/product-pricing';
import { formatToToman } from '@/lib/currency';
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

  return (
    <div className="bg-gradient-to-b from-[#21140D]/95 via-[#180D07]/95 to-[#120904]/95 backdrop-blur-md border border-amber-500/25 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/15 transition-all duration-300 flex flex-col h-[185px] xs:h-[195px] sm:h-[255px] md:h-[275px] relative group/card rounded-xl xs:rounded-2xl overflow-hidden shadow-md">
      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col h-full p-1.5 xs:p-2 sm:p-3">
        {/*
          Product Image Presentation Stage
          Clean image area with dark gradient backdrop to ensure product image
          is dominant, preserving natural aspect ratio without square cropping.
        */}
        <div className="relative h-24 xs:h-26 sm:h-38 md:h-42 w-full rounded-lg xs:rounded-xl bg-gradient-to-b from-[#120B07] to-[#1A100B] p-1 flex items-center justify-center overflow-hidden border border-amber-500/15 group-hover/card:border-amber-500/35 transition-colors shadow-inner shrink-0">
          {/* Subtle warm radial halo centered behind the product image */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              className="object-contain p-1 transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
            />
          </div>

          {/* Gold "جدید ✦" Badge */}
          <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-10 inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-extrabold text-[8px] xs:text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full shadow-md border border-amber-200/40 font-vazirmatn">
            <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-stone-950" />
            <span>جدید</span>
          </div>
        </div>

        {/* Compact Body - Name, Price, CTA only (NO DESCRIPTION) */}
        <div className="pt-1 xs:pt-1.5 sm:pt-2 flex flex-col flex-grow justify-between text-right min-h-0">
          <h3 className="font-bold text-[10px] xs:text-[11px] sm:text-xs md:text-sm text-stone-100 line-clamp-1 group-hover/card:text-amber-300 transition-colors font-vazirmatn leading-tight shrink-0">
            {product.name}
          </h3>

          {/* Bottom Price & Action Row */}
          <div className="pt-1 border-t border-amber-500/15 flex items-center justify-between gap-1 mt-auto shrink-0">
            <div className="flex flex-col text-right min-w-0">
              <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] font-bold text-amber-400/80 font-vazirmatn">قیمت</span>
              <span className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-black text-amber-300 font-vazirmatn truncate">
                {formatToToman(pricing.price)}
              </span>
            </div>

            <div className="inline-flex items-center gap-0.5 xs:gap-1 p-0.5 xs:px-1.5 xs:py-1 rounded-md xs:rounded-lg bg-amber-500/15 text-amber-300 group-hover/card:bg-amber-500 group-hover/card:text-stone-950 transition-all duration-300 border border-amber-500/25 shrink-0 shadow-sm">
              <span className="hidden sm:inline text-[10px] font-bold font-vazirmatn">مشاهده</span>
              <ArrowLeft className="w-2.5 h-2.5 xs:w-3 xs:h-3 group-hover/card:-translate-x-0.5 transition-transform" />
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
      className="w-full py-2 xs:py-3 sm:py-5 lg:py-7 px-2 xs:px-3 sm:px-6 lg:px-8 relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/*
          SHOWCASE PANEL - Sheikh Shops Two-Tone Luxury Palette
          Top/Primary: Dark Sheikh Shops Luxury tone (#231610 / #1B100B)
          Secondary: Muted Light Cream tone (#FAF7F2 / #F3EAD8)
          Divided by an intentional, angled diagonal boundary (140deg).
        */}
        <div
          className="relative rounded-xl xs:rounded-2xl sm:rounded-3xl lg:rounded-[2rem] border border-amber-500/30 p-2.5 xs:p-3 sm:p-5 lg:p-7 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{
            background:
              'linear-gradient(220deg, #231610 0%, #1A0F0A 58%, rgba(217,119,6,0.45) 58.3%, #F3EAD8 58.7%, #FAF7F2 100%)',
          }}
        >
          {/* Subtle Ambient Glow Layers */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row - Lives inside the two-tone background panel */}
          <div className="flex flex-row items-center justify-between gap-1.5 xs:gap-2 mb-2 xs:mb-3 sm:mb-4 border-b border-amber-500/20 pb-2 sm:pb-3 relative z-10">
            <div className="flex items-center gap-1.5 xs:gap-2.5 min-w-0">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-900/40 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="text-right min-w-0">
                <h2 className="text-xs xs:text-sm sm:text-xl md:text-2xl font-black text-stone-100 leading-tight font-vazirmatn whitespace-nowrap drop-shadow">
                  محصولات جدید شیخ
                </h2>
                <p className="text-[10px] sm:text-xs text-amber-200/80 mt-0.5 font-vazirmatn font-medium truncate hidden sm:block">
                  تازه‌ترین انتخاب‌های اضافه شده به فروشگاه
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              {/* Desktop Slider Navigation Controls */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  className="swiper-button-prev-new-products w-8 h-8 rounded-lg bg-[#2A1A12] hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/30 flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات قبلی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="swiper-button-next-new-products w-8 h-8 rounded-lg bg-[#2A1A12] hover:bg-amber-500 text-amber-300 hover:text-stone-950 border border-amber-500/30 flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات بعدی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/products?sort=newest"
                className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg xs:rounded-xl bg-[#2A1A12] hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-stone-950 text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-sm font-vazirmatn whitespace-nowrap"
              >
                <span>مشاهده همه</span>
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Swiper Slider Wrapper - Visually integrated in panel */}
          <div className="relative group/slider w-full overflow-hidden">
            <Swiper
              modules={[Navigation, Autoplay, Keyboard]}
              spaceBetween={8}
              slidesPerView={2.2}
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
                320: { slidesPerView: 2.15, spaceBetween: 8 },
                360: { slidesPerView: 2.22, spaceBetween: 9 },
                375: { slidesPerView: 2.25, spaceBetween: 10 },
                390: { slidesPerView: 2.28, spaceBetween: 10 },
                414: { slidesPerView: 2.32, spaceBetween: 12 },
                480: { slidesPerView: 2.5, spaceBetween: 14 },
                640: { slidesPerView: 2.8, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 16 },
                1024: { slidesPerView: 3.8, spaceBetween: 18 },
                1280: { slidesPerView: 4.2, spaceBetween: 20 },
                1440: { slidesPerView: 4.5, spaceBetween: 22 },
                1920: { slidesPerView: 5.2, spaceBetween: 24 },
              }}
              className="new-products-swiper !py-0.5"
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

      {/* Custom Embedded Swiper Global Styles */}
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
