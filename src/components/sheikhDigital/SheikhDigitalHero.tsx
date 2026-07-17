'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, ArrowDown, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lazy load R3F Scene to ensure SSR safety and maintain 60 FPS
const SheikhDigitalScene = dynamic(
  () => import('./SheikhDigitalScene'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
        <div className="w-10 h-10 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-2"></div>
        <p className="text-amber-200/50 text-[10px] font-vazirmatn">آماده‌سازی جلوه‌ها...</p>
      </div>
    ),
  }
);

// Floating Chips Category Data
interface CategoryChip {
  id: string;
  icon: string;
  name: string;
}

const CATEGORIES: CategoryChip[] = [
  { id: 'speaker', icon: '🎧', name: 'اسپیکر' },
  { id: 'watch', icon: '⌚', name: 'ساعت هوشمند' },
  { id: 'gadget', icon: '🎮', name: 'گجت' },
  { id: 'cable', icon: '🔌', name: 'کابل و شارژر' },
  { id: 'camera', icon: '📷', name: 'دوربین مداربسته' },
  { id: 'lighting', icon: '💡', name: 'تجهیزات روشنایی' },
  { id: 'network', icon: '📡', name: 'تجهیزات شبکه' },
  { id: 'dvr', icon: '🎥', name: 'DVR' },
];

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
      <div className="w-full min-h-[400px] bg-[#1a0f0a] rounded-[2.5rem] animate-pulse" />
    );
  }

  return (
    <section className="relative w-full py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto select-none font-vazirmatn" dir="rtl">
      {/* Immersive Glassmorphic Hero Container */}
      <div className="relative w-full rounded-[1.8rem] sm:rounded-[2.2rem] bg-gradient-to-br from-[#1d110a]/90 via-[#170e08]/95 to-[#1c100a]/90 border border-amber-500/15 shadow-[0_24px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden p-[clamp(10px,2vw,36px)]">
        {/* Soft luxury glow background */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-transparent to-white/1 pointer-events-none z-0" />

        {/* Absolute responsive side-by-side design that NEVER STACKS even on 320px screens */}
        <div className="flex flex-row items-center justify-between w-full relative z-10 gap-[1.5vw]">
          {/* LEFT COLUMN: Premium Copy & CTAs */}
          <div className="w-[54%] flex flex-col justify-center text-right pr-[0.5vw]">
            {/* Elegant Luxury Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex self-start items-center gap-[0.5vw] bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/20 px-[clamp(5px,1vw,12px)] py-[clamp(2px,0.4vw,5px)] rounded-full mb-[2vw]"
            >
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-[clamp(7px,1vw,11px)] font-black text-amber-200 uppercase tracking-wider">
                شیخ دیجیتال • SD
              </span>
            </motion.div>

            {/* Premium Localized Headline */}
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(12px,2.7vw,38px)] font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-[1.25] tracking-tight font-vazirmatn drop-shadow-sm"
            >
              دنیای دیجیتال مجلل
            </motion.h1>

            {/* Premium Localized Subtitle */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-300 text-[clamp(8px,1.15vw,14px)] leading-[1.6] font-light mt-[1.2vw] mb-[2vw] max-w-xl"
            >
              جدیدترین محصولات دیجیتال، تجهیزات صوتی، لوازم جانبی، گجت‌ها و تجهیزات هوشمند با کیفیت ممتاز و ضمانت اصالت در فروشگاه شیخ.
            </motion.p>

            {/* Side-by-Side Proportional CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-row gap-[1vw] items-center"
            >
              {/* Primary CTA */}
              <button
                onClick={handleScrollToProducts}
                className="flex-1 whitespace-nowrap bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-[clamp(7.5px,1.05vw,13.5px)] font-black py-[clamp(4.5px,0.8vw,11px)] px-[clamp(6px,1.4vw,22px)] rounded-[clamp(5px,0.8vw,11px)] shadow-[0_4px_12px_rgba(245,158,11,0.18)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-[0.4vw]"
              >
                <span>مشاهده محصولات</span>
                <ShoppingBag className="w-[clamp(8px,1.15vw,15px)] h-[clamp(8px,1.15vw,15px)] shrink-0" />
              </button>

              {/* Secondary CTA */}
              <button
                onClick={handleScrollToProducts}
                className="flex-1 whitespace-nowrap bg-stone-950/80 hover:bg-stone-900 border border-amber-500/20 hover:border-amber-400/40 text-amber-200 text-[clamp(7.5px,1.05vw,13.5px)] font-bold py-[clamp(4.5px,0.8vw,11px)] px-[clamp(6px,1.4vw,22px)] rounded-[clamp(5px,0.8vw,11px)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-[0.4vw] backdrop-blur-md"
              >
                <span>مجموعه انحصاری</span>
                <Sparkles className="w-[clamp(8px,1.15vw,15px)] h-[clamp(8px,1.15vw,15px)] text-amber-400 shrink-0" />
              </button>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Interactive Three.js Scene */}
          <div className="w-[44%] h-[clamp(115px,24vw,400px)] relative flex items-center justify-center overflow-hidden">
            {/* Subtle floating gold glow behind canvas */}
            <div className="absolute inset-0 rounded-[1.5rem] bg-amber-500/5 blur-xl pointer-events-none" />
            <SheikhDigitalScene />
          </div>
        </div>

        {/* FLOATING CATEGORY CHIPS (UNDER HERO) */}
        <div className="border-t border-amber-500/10 mt-5 pt-5 relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-5xl mx-auto">
            {CATEGORIES.map((chip, idx) => (
              <motion.div
                key={chip.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + idx * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 15px 1px rgba(245, 158, 11, 0.25)',
                  borderColor: 'rgba(245, 158, 11, 0.45)',
                }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full cursor-pointer transition-all duration-300",
                  "bg-white/5 backdrop-blur-md border border-white/10 text-amber-100",
                  "hover:bg-[#1e120b]/40 hover:text-white"
                )}
              >
                <span className="text-xs sm:text-sm">{chip.icon}</span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-wide font-vazirmatn">{chip.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
