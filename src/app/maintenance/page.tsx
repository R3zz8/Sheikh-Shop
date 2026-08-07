'use client';

import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function MaintenancePage() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate deterministic-looking random values on client mount to prevent hydration mismatch
  const [particles, setParticles] = useState<Array<{ id: number; size: number; x: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (mounted) {
      const generated = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2, // 2px to 6px
        x: Math.random() * 100, // percentage of screen width
        delay: Math.random() * 8,
        duration: Math.random() * 15 + 12, // 12s to 27s
      }));
      setParticles(generated);
    }
  }, [mounted]);

  if (!mounted) {
    // Elegant dark server-rendered placeholder with zero layout shift
    return (
      <div className="min-h-screen bg-[#0A0503] flex items-center justify-center text-amber-200 dir-rtl font-sans" />
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#0A0503] overflow-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 dir-rtl select-none gpu-accelerated">

      {/* 1. AURORA GRADIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Amber Light - Top Left */}
        <motion.div
          className="absolute -top-[20%] -left-[20%] w-[70vw] h-[70vw] rounded-full opacity-[0.15] filter blur-[120px] sm:blur-[160px] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, #D97706 0%, transparent 70%)',
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, 40, -20, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Soft Golden Light - Bottom Right */}
        <motion.div
          className="absolute -bottom-[20%] -right-[20%] w-[80vw] h-[80vw] rounded-full opacity-[0.12] filter blur-[140px] sm:blur-[180px] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)',
          }}
          animate={shouldReduceMotion ? {} : {
            x: [0, -50, 30, 0],
            y: [0, 40, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Deep Orange Accent Light - Center Left */}
        <motion.div
          className="absolute top-[30%] -left-[10%] w-[50vw] h-[50vw] rounded-full opacity-[0.08] filter blur-[100px] sm:blur-[140px] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, #EA580C 0%, transparent 70%)',
          }}
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* 2. FLOATING GOLDEN PARTICLES */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#fbbf24] to-[#f59e0b] filter blur-[0.5px] shadow-[0_0_8px_#fbbf24]"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              bottom: '-20px',
            }}
            animate={shouldReduceMotion ? {} : {
              y: ['100vh', '-10vh'],
              x: [0, Math.sin(p.id) * 40, Math.sin(p.id) * -40, 0],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* 3. CENTRAL GLASSMORPHIC PANEL */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 w-full max-w-xl text-center"
      >
        {/* Subtle Ambient Radial Highlight behind the card */}
        <div className="absolute inset-0 bg-radial-gradient from-[#fbbf24]/5 to-transparent blur-3xl rounded-[2.5rem] pointer-events-none -z-10" />

        <div className="relative overflow-hidden bg-black/45 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-8 py-12 sm:px-12 sm:py-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] flex flex-col items-center">

          {/* Subtle rotating inner sheen light sweep */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-[inherit]">
            <motion.div
              className="absolute w-1/3 h-[250%] -top-[75%] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-[25deg] filter blur-[4px] gpu-accelerated"
              initial={{ left: '-100%' }}
              animate={shouldReduceMotion ? {} : { left: '250%' }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>

          {/* 4. PREMIUM CONCENTRIC ANIMATED GOLDEN LOADER */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-10 gpu-accelerated">
            {/* Outer Ring: Slow clockwise rotation */}
            <motion.div
              className="absolute inset-0 rounded-full border border-transparent border-t-[#D97706]/40 border-r-[#FCD34D]/70 border-b-[#D97706]/40 border-l-[#FCD34D]/70 filter drop-shadow-[0_0_12px_rgba(217,119,6,0.3)]"
              animate={shouldReduceMotion ? {} : { rotate: 360 }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Middle Ring: Faster counter-clockwise rotation */}
            <motion.div
              className="absolute inset-2 rounded-full border border-dashed border-transparent border-t-[#FCD34D] border-b-[#F59E0B]/50 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              animate={shouldReduceMotion ? {} : { rotate: -360 }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Inner Glowing Core */}
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-[#b45309]/20 to-[#fbbf24]/10 border border-[#fbbf24]/30 flex items-center justify-center shadow-inner"
              animate={shouldReduceMotion ? {} : {
                scale: [0.95, 1.05, 0.95],
                boxShadow: [
                  'inset 0 0 10px rgba(251,191,36,0.1), 0 0 15px rgba(251,191,36,0.2)',
                  'inset 0 0 15px rgba(251,191,36,0.2), 0 0 25px rgba(251,191,36,0.4)',
                  'inset 0 0 10px rgba(251,191,36,0.1), 0 0 15px rgba(251,191,36,0.2)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Central Glowing Diamond Dot */}
              <div className="w-3.5 h-3.5 rotate-45 bg-gradient-to-tr from-[#fbbf24] to-[#f59e0b] rounded-sm shadow-[0_0_10px_#fbbf24]" />
            </motion.div>
          </div>

          {/* 5. TYPOGRAPHY */}
          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fef3c7] via-[#fde68a] to-[#fed7aa] mb-5 font-sans leading-tight">
            در حال آماده‌سازی تجربه‌ای بهتر...
          </h1>

          {/* Description */}
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-8 max-w-sm sm:max-w-md font-medium font-sans">
            تیم شیخ در حال اعمال آخرین بهینه‌سازی‌ها برای افزایش سرعت، امنیت و کیفیت فروشگاه است.
          </p>

          {/* Decorative Gold Separator */}
          <div className="relative w-24 h-px mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbbf24]/40 to-transparent" />
            <motion.div
              className="absolute top-0 left-0 w-8 h-full bg-[#fbbf24]/80 filter blur-[1px]"
              animate={shouldReduceMotion ? {} : { left: ['-100%', '200%'] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          {/* Footer */}
          <p className="text-[#fbbf24]/80 text-xs sm:text-sm font-semibold tracking-wide font-sans">
            چند دقیقه دیگر دوباره به ما سر بزنید.
          </p>

        </div>
      </motion.div>
    </main>
  );
}
