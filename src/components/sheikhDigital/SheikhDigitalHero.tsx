'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, LayoutGrid } from 'lucide-react';

export default function SheikhDigitalHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScrollToProducts = () => {
    const productsElement = document.getElementById('digital-products-section');
    if (productsElement) {
      productsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-[240px] bg-stone-950/80 rounded-[2rem] border border-amber-500/10 animate-pulse flex items-center justify-center" />
    );
  }

  return (
    <section className="relative w-full py-4 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto select-none font-vazirmatn" dir="rtl">
      {/* Compact Premium Glassmorphic Hero Container */}
      <div className="relative w-full h-[220px] sm:h-[240px] rounded-[2rem] bg-gradient-to-br from-[#1c110a] via-[#23150c] to-[#1c110a] border border-amber-500/20 shadow-[0_16px_36px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        {/* Soft luxury glow background */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />

        {/* Decorative gold particles background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl w-full">
          {/* Elegant Luxury Badge */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/15 px-3 py-1 rounded-full mb-2"
          >
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-black text-amber-200/95 tracking-widest uppercase">
              شیخ دیجیتال • SD
            </span>
          </motion.div>

          {/* Persian Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-none font-vazirmatn drop-shadow-md"
          >
            دنیای دیجیتال شیخ
          </motion.h1>

          {/* English Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-300 text-xs sm:text-sm font-light mt-2 max-w-xl leading-relaxed tracking-wide font-sans"
            dir="ltr"
          >
            Modern premium electronics, speakers, headphones and smart accessories.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-row gap-3 items-center justify-center mt-4 w-full max-w-xs sm:max-w-md"
          >
            {/* Primary CTA */}
            <button
              onClick={handleScrollToProducts}
              className="flex-1 whitespace-nowrap bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-black py-2.5 px-4 rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span>مشاهده محصولات</span>
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleScrollToProducts}
              className="flex-1 whitespace-nowrap bg-stone-950/85 hover:bg-stone-900 border border-amber-500/20 hover:border-amber-400/30 text-amber-200 text-xs font-bold py-2.5 px-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-1.5 backdrop-blur-md"
            >
              <span>دسته‌بندی محصولات</span>
              <LayoutGrid className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
