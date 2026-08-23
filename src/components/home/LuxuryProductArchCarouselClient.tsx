'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard } from 'swiper/modules';
import type { MarketingShowcaseSlideData } from '@/lib/services/getMarketingShowcase';

// Import Swiper core styles
import 'swiper/css';

interface LuxuryProductArchCarouselClientProps {
  slides: MarketingShowcaseSlideData[];
}

function ArchSlideCard({ slide }: { slide: MarketingShowcaseSlideData }) {
  const imageUrl = slide.imageUrl || '/noImage.jpg';
  const targetProductUrl = `/products/${slide.product?.slug || slide.product?.id || slide.productId}`;

  return (
    <div className="flex flex-col items-center w-full group/arch select-none">
      <Link
        href={targetProductUrl}
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
          <div className="absolute inset-1.5 rounded-t-[1000px] rounded-b-xl border border-amber-500/15 pointer-events-none group-hover/arch:border-amber-400/35 transition-colors duration-500" />

          {/* Top Radial Ambient Gold Glow */}
          <div className="absolute -top-12 inset-x-0 h-36 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.25)_0%,transparent_70%)] pointer-events-none group-hover/arch:opacity-100 transition-opacity duration-500" />

          {/* Premium Stage Frame for Transparent PNG Marketing Assets */}
          <div className="relative w-full h-full flex items-center justify-center p-2 xs:p-2.5 sm:p-3 z-10">
            {/* Center Spotlight & Ambient Halo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.2)_0%,rgba(217,119,6,0.06)_50%,transparent_75%)] pointer-events-none" />

            {/* Subtle Pedestal Reflection / Shadow Base */}
            <div className="absolute bottom-2 inset-x-3 h-5 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.28)_0%,rgba(0,0,0,0.75)_65%,transparent_100%)] pointer-events-none rounded-full blur-[1px]" />

            {/* Floating Character Container */}
            <div className="relative w-full h-full min-h-[140px] xs:min-h-[170px] sm:min-h-[200px] md:min-h-[230px] flex items-center justify-center">
              <Image
                src={imageUrl}
                alt={slide.title}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
                className="object-contain p-2 filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.85)] drop-shadow-[0_4px_12px_rgba(245,158,11,0.2)] group-hover/arch:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
                unoptimized
              />
            </div>
          </div>

          {/* Bottom Pedestal Base effect */}
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent shrink-0 mb-1" />
        </div>

        {/* Marketing Title Under Arch (Clicking title also navigates to target product) */}
        <div className="mt-2 xs:mt-3 sm:mt-3.5 text-center w-full px-1">
          <h3 className="font-vazirmatn text-xs xs:text-sm sm:text-base font-bold text-stone-200 group-hover/arch:text-amber-300 transition-colors duration-300 truncate leading-snug">
            {slide.title}
          </h3>
        </div>
      </Link>
    </div>
  );
}

export default function LuxuryProductArchCarouselClient({
  slides,
}: LuxuryProductArchCarouselClientProps) {
  if (!slides || slides.length === 0) {
    return null;
  }

  // Render exactly 1 logical slide centered if only 1 slide exists
  if (slides.length === 1) {
    return (
      <div className="w-full flex justify-center py-4 px-1" dir="rtl">
        <div className="w-full max-w-[240px] xs:max-w-[260px] sm:max-w-[290px] md:max-w-[310px] lg:max-w-[320px]">
          <ArchSlideCard slide={slides[0]!} />
        </div>
      </div>
    );
  }

  // For N slides (N >= 2), render exactly N slides without artificial array cloning
  const enableLoop = slides.length >= 5;

  return (
    <div className="w-full relative overflow-hidden" dir="rtl">
      <Swiper
        modules={[Autoplay, Keyboard]}
        spaceBetween={12}
        slidesPerView={Math.min(slides.length, 2.2)}
        centeredSlides={slides.length < 5}
        grabCursor={true}
        loop={enableLoop}
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
          320: { slidesPerView: Math.min(slides.length, 2.15), spaceBetween: 10 },
          360: { slidesPerView: Math.min(slides.length, 2.22), spaceBetween: 12 },
          375: { slidesPerView: Math.min(slides.length, 2.25), spaceBetween: 14 },
          390: { slidesPerView: Math.min(slides.length, 2.28), spaceBetween: 14 },
          414: { slidesPerView: Math.min(slides.length, 2.32), spaceBetween: 16 },
          640: { slidesPerView: Math.min(slides.length, 3.1), spaceBetween: 18 },
          768: { slidesPerView: Math.min(slides.length, 3.25), spaceBetween: 20 },
          1024: { slidesPerView: Math.min(slides.length, 5), spaceBetween: 20 },
          1280: { slidesPerView: Math.min(slides.length, 5), spaceBetween: 24 },
          1440: { slidesPerView: Math.min(slides.length, 5), spaceBetween: 28 },
          1920: { slidesPerView: Math.min(slides.length, 5), spaceBetween: 32 },
        }}
        className="luxury-arch-swiper !py-4 !px-1"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <ArchSlideCard slide={slide} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .luxury-arch-swiper .swiper-slide {
          height: auto !important;
          display: flex;
          justify-content: center;
        }
      `,
        }}
      />
    </div>
  );
}
