'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './ui/BrandLogo';

interface PWAResponsiveSplashProps {
  children: React.ReactNode;
}

export default function PWAResponsiveSplash({ children }: PWAResponsiveSplashProps) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    // Premium PWA behavior: Only show the splash experience if launched in standalone PWA mode.
    // For normal browser visits, the website opens immediately with NO splash screen or app behaviors.
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone
        || document.referrer.includes('android-app://');

      if (isStandalone) {
        const splashShown = sessionStorage.getItem('ss_splash_shown');

        // Initial launch in standalone mode during this session: show splash screen
        if (!splashShown) {
          setShowSplash(true);
          sessionStorage.setItem('ss_splash_shown', 'true');

          timer = setTimeout(() => {
            setShowSplash(false);
          }, 1600); // 1.6 seconds display duration
        } else {
          setShowSplash(false);
        }
      } else {
        // Normal website visit: absolutely NO splash screen
        setShowSplash(false);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  // Soft random particle definitions for splash glow
  const particles = [
    { id: 1, top: '35%', left: '25%', delay: 0, size: 4, duration: 2.5 },
    { id: 2, top: '65%', left: '70%', delay: 0.3, size: 3, duration: 3.2 },
    { id: 3, top: '45%', left: '75%', delay: 0.6, size: 5, duration: 2.8 },
    { id: 4, top: '70%', left: '30%', delay: 0.1, size: 4, duration: 3.5 },
    { id: 5, top: '25%', left: '60%', delay: 0.8, size: 3, duration: 2.2 },
  ];

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="pwa-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // ultra-smooth fade-out
            className="fixed inset-0 z-[99999] bg-[#050201] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ambient Back Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.35, scale: 1.15 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute w-[450px] h-[450px] rounded-full bg-radial from-amber-500/15 via-orange-500/2 to-transparent blur-[120px] pointer-events-none"
            />

            {/* Subtle floating background particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: -30, opacity: [0, 0.6, 0] }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    top: p.top,
                    left: p.left,
                    width: p.size,
                    height: p.size,
                  }}
                  className="rounded-full bg-amber-400/40 blur-[0.5px]"
                />
              ))}
            </div>

            {/* Center Container: 3D Logo SVG & Dynamic Text */}
            <div className="flex flex-col items-center justify-center gap-6 z-10">
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 15 }}
                animate={{ scale: 1.04, opacity: 1, y: 0 }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1], // premium custom ease
                }}
                className="relative"
              >
                <BrandLogo size={150} animate={false} />
              </motion.div>

              {/* Luxury Brand Label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="text-center space-y-2"
              >
                <h1 className="text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent tracking-wide font-vazirmatn">
                  فروشگاه شیخ
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-amber-500/60 uppercase font-medium">
                  Sheikh Shops
                </p>
              </motion.div>
            </div>

            {/* Tiny Premium Loader */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute bottom-12 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              <span className="text-[10px] text-stone-400 font-bold font-vazirmatn">بارگذاری اکوسیستم لوکس...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children/app in parallel for instant hydration behind splash overlay */}
      {children}
    </>
  );
}
