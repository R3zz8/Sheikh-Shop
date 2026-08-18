'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const SUBTITLES = [
  'در حال بارگذاری اطلاعات...',
  'در حال آماده‌سازی محصولات...',
  'در حال همگام‌سازی اطلاعات...',
  'تقریباً آماده است...',
];

export function LuxuryLoader() {
  const shouldReduceMotion = useReducedMotion();
  const [percent, setPercent] = useState(0);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Set mounted to true on client to avoid any hydration mismatch with random timings
  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth percentage loading animation from 0% to 100%
  useEffect(() => {
    if (!mounted) return;

    let currentPercent = 0;
    const interval = setInterval(() => {
      if (currentPercent >= 100) {
        clearInterval(interval);
        return;
      }
      // Organic progress increments: slower as it gets closer to 100
      let increment = 1;
      if (currentPercent < 30) {
        increment = Math.floor(Math.random() * 4) + 2; // Fast start
      } else if (currentPercent < 70) {
        increment = Math.floor(Math.random() * 3) + 1; // Steady progress
      } else if (currentPercent < 95) {
        increment = Math.floor(Math.random() * 2) + 1; // Slower near end
      } else {
        increment = Math.random() > 0.7 ? 1 : 0; // Extremely slow close to 100% to keep feeling loading
      }

      currentPercent = Math.min(100, currentPercent + increment);
      setPercent(currentPercent);
    }, 80);

    return () => clearInterval(interval);
  }, [mounted]);

  // Dynamic subtitle auto-rotation every 1.5 seconds
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % SUBTITLES.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) {
    // Return empty placeholder during SSR to prevent hydration mismatch
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050201]/95 p-4 overflow-hidden select-none touch-none">
      {/* Soft Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-amber-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Glassmorphism Loader Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -5 }}
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1], // Apple-like ease-out cubic
        }}
        className="relative w-full max-w-[360px] sm:max-w-[420px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-center overflow-hidden gpu-accelerated"
      >
        {/* Delicate Golden Inner Highlight Border */}
        <div className="absolute inset-0 rounded-[24px] pointer-events-none border border-amber-500/15" />

        {/* Diagonal Sweeping Light Reflection */}
        {!shouldReduceMotion && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px]">
            <motion.div
              className="absolute w-1/2 h-[200%] -top-[50%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12"
              initial={{ left: '-100%' }}
              animate={{ left: '200%' }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        )}

        {/* 1. Premium Dual-Ring Animated Spinner */}
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
          {/* Outer Rotator Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 border-r-amber-400"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Inner Counter-Rotator Ring */}
          <motion.div
            className="absolute inset-2 rounded-full border border-transparent border-b-amber-600 border-l-yellow-500 opacity-80"
            animate={shouldReduceMotion ? {} : { rotate: -360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {/* Core Breathing Pulse Ring */}
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] flex items-center justify-center"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.8, 1, 0.8],
                  }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* 2. Main Heading */}
        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-100 to-white mb-2 font-vazirmatn">
          لطفا کمی صبر کنید
        </h2>

        {/* 3. Dynamic Subtitle (Smooth transition) */}
        <div className="h-6 mb-8 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={subtitleIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="text-xs sm:text-sm font-medium text-amber-500/80 tracking-normal"
            >
              {SUBTITLES[subtitleIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* 4. Animated Progress Bar container & display */}
        <div className="w-full space-y-3">
          {/* Progress Bar Track */}
          <div className="relative w-full h-2.5 bg-white/[0.04] border border-white/[0.05] rounded-full overflow-hidden">
            {/* Animated Fill Bar */}
            <motion.div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full"
              style={{ width: `${percent}%` }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
            />

            {/* Shine effect overlay */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>

          {/* Smooth Percentage Display */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-stone-400/70 px-0.5">
            <span className="font-semibold">{percent}%</span>
            <span className="font-semibold">۱۰۰٪</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
