'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Inbox } from 'lucide-react';

export default function SheikhDigitalEmptyState() {
  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 sm:px-6 text-center select-none font-vazirmatn" dir="rtl">
      {/* Container with beautiful glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-b from-[#1b110b]/80 to-[#120703]/90 rounded-[2rem] border border-amber-500/15 p-8 sm:p-12 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl"
      >
        {/* Soft background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none" />

        {/* Animated Golden Sparkles and Box Icon */}
        <div className="relative flex justify-center items-center mb-6">
          <div className="relative">
            {/* Pulsing Backlight */}
            <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full scale-110 animate-pulse" />

            {/* Custom styled circular container */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                y: [0, -3, 3, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut'
              }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/10 to-[#1e120b] border border-amber-500/30 flex items-center justify-center shadow-inner relative z-10"
            >
              <Inbox className="w-10 h-10 text-amber-400" />
            </motion.div>

            {/* Sparkle attachments */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -top-1 -right-2 text-amber-400 z-20"
            >
              <Sparkles className="w-5 h-5 fill-amber-400/30" />
            </motion.div>
          </div>
        </div>

        {/* Localized Persian Text */}
        <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
          محصولات شیخ دیجیتال به زودی اضافه خواهند شد.
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-8">
          در حال تدارک و افزودن بهترین و نفیس‌ترین گجت‌های هوشمند، تجهیزات صوتی و لوازم جانبی مدرن برای شما هستیم. به زودی از مجموعه‌ی انحصاری ما دیدن فرمایید.
        </p>

        {/* Luxury CTA Back Button */}
        <div className="flex justify-center">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px 2px rgba(245, 158, 11, 0.25)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>بازگشت به صفحه اصلی</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
