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
    <div className="bg-[#FAF7F2]/95 backdrop-blur-sm border border-amber-900/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-amber-700/30 transition-all duration-300 flex flex-col h-[280px] xs:h-[295px] sm:h-[340px] md:h-[360px] relative group/card">
      <Link href={`/products/${product.slug || product.id}`} className="flex flex-col h-full p-2.5 sm:p-3.5">
        {/*
          Product Image Presentation Stage
          Uses an elegant rounded halo background with subtle inner ambient radial lighting
          and object-contain to keep original product aspect ratio intact without heavy square boxes.
        */}
        <div className="relative h-32 xs:h-36 sm:h-44 w-full rounded-xl bg-gradient-to-b from-[#F5ECE0] via-[#EFE3D3] to-[#E7D6C1] p-2 flex items-center justify-center overflow-hidden border border-amber-900/10 shrink-0 shadow-inner">
          {/* Subtle soft radial glow centered behind the product image */}
          <div className="absolute inset-0 bg-radial from-amber-300/20 via-transparent to-transparent pointer-events-none" />

          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 35vw, 22vw"
              className="object-contain p-1.5 transition-transform duration-500 group-hover/card:scale-105"
              loading="lazy"
              unoptimized
            />
          </div>

          {/* Elegant Small "جدید ✦" Badge */}
          <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-[#2C1A11] font-extrabold text-[9px] xs:text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full shadow-sm border border-amber-600/30 font-vazirmatn">
            <Sparkles className="w-2.5 h-2.5 xs:w-3 xs:h-3 text-[#2C1A11]" />
            <span>جدید</span>
          </div>
        </div>

        {/* Card Body - Optimized compact typography */}
        <div className="pt-2 sm:pt-3 pb-0.5 px-0.5 flex flex-col flex-grow justify-between text-right">
          <div>
            <h3 className="font-bold text-xs xs:text-[13px] sm:text-base text-[#2C1A11] line-clamp-1 group-hover/card:text-amber-800 transition-colors font-vazirmatn leading-snug">
              {product.name}
            </h3>
            <p className="hidden xs:line-clamp-1 text-[10px] sm:text-xs text-[#6D4C41] mt-1 font-vazirmatn font-medium leading-relaxed">
              {cleanExcerpt}
            </p>
          </div>

          {/* Bottom Price & Action Row */}
          <div className="pt-2 sm:pt-2.5 border-t border-amber-900/10 flex items-center justify-between gap-1 mt-auto">
            <div className="flex flex-col text-right min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold text-[#8D4925] font-vazirmatn">قیمت</span>
              <span className="text-xs xs:text-sm sm:text-base font-black text-[#2C1A11] font-vazirmatn truncate">
                {formatToToman(pricing.price)}
              </span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-1 xs:px-2.5 xs:py-1.5 rounded-lg bg-[#2C1A11] text-amber-200 group-hover/card:bg-amber-800 group-hover/card:text-white transition-all duration-300 shadow-sm shrink-0">
              <span className="hidden sm:inline text-[11px] font-bold font-vazirmatn">مشاهده</span>
              <ArrowLeft className="w-3 h-3 xs:w-3.5 xs:h-3.5 group-hover/card:-translate-x-0.5 transition-transform" />
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
      className="w-full py-2.5 sm:py-6 lg:py-8 px-2.5 sm:px-6 lg:px-8 relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/*
          THE FLOATING WARM CHAMPAGNE SHOWCASE CONTAINER
          Muted warm champagne/cream background panel contrasting smoothly against
          Sheikh Shops' dark chocolate page background.
        */}
        <div className="relative rounded-2xl sm:rounded-3xl lg:rounded-[2rem] bg-gradient-to-b from-[#FAF7F2] via-[#F2E8D5] to-[#E9DBB8] border border-amber-900/15 p-2.5 xs:p-3.5 sm:p-6 lg:p-8 shadow-[0_15px_35px_-10px_rgba(0,0,0,0.35)] overflow-hidden">
          {/* Subtle Muted Lighting Accents */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Compact Header Row */}
          <div className="flex flex-row items-center justify-between gap-1.5 xs:gap-2 mb-2.5 sm:mb-5 border-b border-amber-900/10 pb-2 sm:pb-4 relative z-10">
            <div className="flex items-center gap-1.5 xs:gap-2.5 min-w-0">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl bg-[#2C1A11] border border-amber-500/30 text-amber-300 flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
              <div className="text-right min-w-0">
                <h2 className="text-xs xs:text-sm sm:text-xl md:text-2xl font-black text-[#2C1A11] leading-tight font-vazirmatn whitespace-nowrap">
                  محصولات جدید شیخ
                </h2>
                <p className="text-[10px] sm:text-xs text-[#5D4037] mt-0.5 font-vazirmatn font-medium truncate hidden sm:block">
                  تازه‌ترین انتخاب‌های اضافه شده به فروشگاه
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
              {/* Desktop Slider Navigation Controls */}
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  className="swiper-button-prev-new-products w-8 h-8 rounded-lg bg-[#2C1A11] hover:bg-amber-800 text-amber-300 hover:text-white border border-amber-500/20 flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات قبلی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="swiper-button-next-new-products w-8 h-8 rounded-lg bg-[#2C1A11] hover:bg-amber-800 text-amber-300 hover:text-white border border-amber-500/20 flex items-center justify-center transition-all duration-200 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="محصولات بعدی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <Link
                href="/products?sort=newest"
                className="group inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 xs:px-2.5 xs:py-1.5 sm:px-4 sm:py-2 rounded-lg xs:rounded-xl bg-[#2C1A11] hover:bg-[#3E2723] border border-amber-500/20 text-amber-200 hover:text-white text-[10px] xs:text-[11px] sm:text-xs font-bold transition-all duration-200 shadow-sm font-vazirmatn whitespace-nowrap"
              >
                <span>مشاهده همه</span>
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Swiper Slider Wrapper */}
          <div className="relative group/slider w-full overflow-hidden">
            <Swiper
              modules={[Navigation, Autoplay, Keyboard]}
              spaceBetween={8}
              slidesPerView={1.12}
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
                320: { slidesPerView: 1.12, spaceBetween: 8 },
                360: { slidesPerView: 1.18, spaceBetween: 10 },
                390: { slidesPerView: 1.25, spaceBetween: 12 },
                480: { slidesPerView: 1.8, spaceBetween: 14 },
                640: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 2.6, spaceBetween: 16 },
                1024: { slidesPerView: 3.3, spaceBetween: 18 },
                1280: { slidesPerView: 4, spaceBetween: 20 },
              }}
              className="new-products-swiper !py-1"
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
