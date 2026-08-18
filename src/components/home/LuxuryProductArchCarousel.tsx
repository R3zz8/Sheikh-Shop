import React from 'react';
import { getArchProducts } from '@/lib/services/getArchProducts';
import LuxuryProductArchCarouselClient from './LuxuryProductArchCarouselClient';
import { Sparkles } from 'lucide-react';

export default async function LuxuryProductArchCarousel() {
  const products = await getArchProducts(10);

  return (
    <section
      aria-label="محصولات منتخب شیخ"
      className="w-full py-6 sm:py-10 lg:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold font-vazirmatn mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>منتخب شیخ</span>
          </div>
          <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent font-vazirmatn leading-tight drop-shadow">
            برترین محصولات شیخ شاپ
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mt-3 rounded-full" />
        </div>

        {/* Arch Carousel Client Component */}
        <LuxuryProductArchCarouselClient products={products || []} />
      </div>
    </section>
  );
}
