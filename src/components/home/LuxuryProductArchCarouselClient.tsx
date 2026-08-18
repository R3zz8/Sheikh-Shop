'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard } from 'swiper/modules';
import type { ArchProductData } from '@/lib/services/getArchProducts';

// Import Swiper core styles
import 'swiper/css';

interface LuxuryProductArchCarouselClientProps {
  products: ArchProductData[];
}

function ArchProductCard({ product }: { product: ArchProductData }) {
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0]?.secureUrl || product.images[0]?.image || '/noImage.jpg'
      : '/noImage.jpg';

  return (
    <div className="flex flex-col items-center w-full group/arch select-none">
      <Link
        href={`/products/${product.slug || product.id}`}
        className="w-full flex flex-col items-center focus:outline-none"
      >
        {/*
          Arch Outer Container:
          - semi-circular / rounded arch top
          - rectangular bottom body
          - golden/amber subtle border
          - dark chocolate glass backdrop
          - soft ambient glow & depth
        */}
        <div className="relative w-full aspect-[1/2.2] max-h-[380px] xs:max-h-[420px] sm:max-h-[460px] md:max-h-[500px] lg:max-h-[520px] rounded-t-[1000px] rounded-b-2xl p-2 xs:p-2.5 sm:p-3 bg-gradient-to-b from-[#2B1910]/90 via-[#1C0F0A]/95 to-[#130A06]/98 border border-amber-500/35 hover:border-amber-400/60 shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:shadow-[0_16px_40px_rgba(245,158,11,0.2)] transition-all duration-500 flex flex-col items-center justify-between overflow-hidden backdrop-blur-md">
          {/* Inner Arch Gold Accent Highlight Line */}
          <div className="absolute inset-1 rounded-t-[1000px] rounded-b-xl border border-amber-500/15 pointer-events-none group-hover/arch:border-amber-400/35 transition-colors duration-500" />

          {/* Top Radial Ambient Gold Glow */}
          <div className="absolute -top-12 inset-x-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.22)_0%,transparent_70%)] pointer-events-none group-hover/arch:opacity-100 transition-opacity duration-500" />

          {/* Product Image Stage */}
          <div className="relative w-full h-full flex items-center justify-center p-2 xs:p-3 sm:p-4 z-10">
            {/* Soft background aura behind product image */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_65%)] pointer-events-none" />

            <div className="relative w-full h-full min-h-[140px] xs:min-h-[170px] sm:min-h-[200px] md:min-h-[230px] flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                className="object-contain p-2 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.75)] group-hover/arch:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>

          {/* Bottom Pedestal Base effect */}
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent shrink-0 mb-1" />
        </div>

        {/* Product Title Under Arch */}
        <div className="mt-2 xs:mt-3 sm:mt-3.5 text-center w-full px-1">
          <h3 className="font-vazirmatn text-xs xs:text-sm sm:text-base font-bold text-stone-200 group-hover/arch:text-amber-300 transition-colors duration-300 truncate leading-snug">
            {product.name}
          </h3>
        </div>
      </Link>
    </div>
  );
}

export default function LuxuryProductArchCarouselClient({
  products,
}: LuxuryProductArchCarouselClientProps) {
  if (!products || products.length === 0) {
    return null;
  }

  // Duplicate slides if array is small to allow seamless Swiper looping
  const displayProducts =
    products.length < 5
      ? [...products, ...products, ...products].slice(0, 10)
      : products;

  return (
    <div className="w-full relative overflow-hidden" dir="rtl">
      <Swiper
        modules={[Autoplay, Keyboard]}
        spaceBetween={12}
        slidesPerView={2.2}
        grabCursor={true}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        breakpoints={{
          320: { slidesPerView: 2.15, spaceBetween: 10 },
          360: { slidesPerView: 2.22, spaceBetween: 12 },
          375: { slidesPerView: 2.25, spaceBetween: 14 },
          390: { slidesPerView: 2.28, spaceBetween: 14 },
          414: { slidesPerView: 2.32, spaceBetween: 16 },
          640: { slidesPerView: 3.1, spaceBetween: 18 },
          768: { slidesPerView: 3.25, spaceBetween: 20 },
          1024: { slidesPerView: 5, spaceBetween: 20 },
          1280: { slidesPerView: 5, spaceBetween: 24 },
          1440: { slidesPerView: 5, spaceBetween: 28 },
          1920: { slidesPerView: 5, spaceBetween: 32 },
        }}
        className="luxury-arch-swiper !py-4 !px-1"
      >
        {displayProducts.map((product, idx) => (
          <SwiperSlide key={`${product.id}-${idx}`}>
            <ArchProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .luxury-arch-swiper .swiper-slide {
          height: auto !important;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
