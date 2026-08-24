'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Sparkles, Volume2 } from 'lucide-react';

const Speaker3DCanvas = dynamic(() => import('./Speaker3DCanvas'), {
  ssr: false,
  loading: () => <CanvasFallback />,
});

// ==========================================
// WebGL Support Detection
// ==========================================
function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

// ==========================================
// Local specialized Error Boundary
// ==========================================
interface ThreeErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}
interface ThreeErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends React.Component<ThreeErrorBoundaryProps, ThreeErrorBoundaryState> {
  constructor(props: ThreeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ThreeErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.warn('Three.js speaker rendering failed. Falling back gracefully to premium 2D design.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Fallback component for loading state
function CanvasFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950/20">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-amber-200/60 text-xs font-vazirmatn">در حال بارگذاری نمایشگر سه بعدی...</p>
    </div>
  );
}

// Highly polished, premium 2D fallback layout when WebGL is unavailable
function Premium2DFallback() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-2 select-none pointer-events-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 to-transparent blur-2xl rounded-full" />

      <div className="relative flex items-center justify-center gap-[clamp(12px,2vw,36px)] w-full max-w-xs md:max-w-sm">
        {/* Stylized Speaker Glass Frame */}
        <div className="w-[clamp(65px,10vw,120px)] h-[clamp(130px,20vw,240px)] bg-stone-950/80 rounded-2xl border border-amber-500/15 flex flex-col items-center justify-center gap-[clamp(8px,1vw,16px)] p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent" />
          {/* Tweeter Ring */}
          <div className="w-[clamp(24px,4vw,48px)] h-[clamp(24px,4vw,48px)] rounded-full border border-amber-500/30 flex items-center justify-center">
            <div className="w-[clamp(14px,2.5vw,30px)] h-[clamp(14px,2.5vw,30px)] rounded-full bg-stone-900 border-2 border-amber-500/60" />
          </div>
          {/* Woofer Ring */}
          <div className="w-[clamp(32px,5.5vw,64px)] h-[clamp(32px,5.5vw,64px)] rounded-full border border-amber-500/30 flex items-center justify-center relative">
            <div className="w-[clamp(20px,3.5vw,42px)] h-[clamp(20px,3.5vw,42px)] rounded-full bg-stone-900 border-2 border-amber-500/60 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-25" />
          </div>
          {/* Bass tube */}
          <div className="w-[clamp(10px,1.5vw,18px)] h-[clamp(10px,1.5vw,18px)] rounded-full bg-stone-900" />
        </div>

        {/* Stylized Sheikh Character Glass Frame */}
        <div className="w-[clamp(65px,10vw,120px)] h-[clamp(130px,20vw,240px)] bg-stone-950/80 rounded-2xl border border-amber-500/15 flex flex-col items-center justify-end p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent" />
          {/* Head & Keffiyeh */}
          <div className="w-[clamp(24px,4vw,48px)] h-[clamp(24px,4vw,48px)] rounded-full bg-white relative mb-2 flex items-center justify-center shadow-lg">
            {/* Beard */}
            <div className="absolute bottom-0 w-[80%] h-[40%] bg-stone-900 rounded-b-full" />
            {/* Smile */}
            <div className="absolute bottom-[25%] w-[30%] h-[15%] border-b border-stone-800" />
            {/* Agal headpiece cord */}
            <div className="absolute -top-1 w-[90%] h-2 border-t-2 border-amber-500 rounded-t-full" />
          </div>
          {/* Royal Thobe & Bisht Body */}
          <div className="w-[85%] h-[55%] bg-stone-900 rounded-t-3xl border-t border-amber-500/30 relative shadow-inner">
            {/* Golden embroidery trim */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-400 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Dynamic Premium Speaker Component
// ==========================================
export default function PremiumSpeakerShowcase() {
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.05,
    rootMargin: '200px 0px',
    triggerOnce: false,
  });

  useEffect(() => {
    setMounted(true);
    setWebGLSupported(isWebGLAvailable());

    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check for reduced motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) {
    return (
      <section className="container-fluid py-8 px-4 max-w-7xl mx-auto select-none">
        <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] bg-stone-950/25 border border-amber-500/10 rounded-[2.5rem] animate-pulse" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="container-fluid py-8 sm:py-12 md:py-16 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* Container holding both content and showcase, with glassmorphism and subtle luxury golden borders */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-full rounded-[2.2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-amber-950/75 via-stone-900/90 to-amber-950/80 border border-amber-500/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden p-[clamp(12px,2vw,36px)]"
      >
        {/* Soft luxury ambient background glowing overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-transparent to-white/2 pointer-events-none z-0" />

        {/* Responsive dual-column layout that never stacks (even on tiny 320px screens) */}
        <div
          className="flex flex-row-reverse items-center justify-between w-full relative z-10"
          style={{ direction: 'rtl' }}
        >
          {/* RIGHT SIDE: Luxury Persian marketing content */}
          <div className="w-[52%] flex flex-col justify-center text-right pr-[1vw] pl-[2vw] overflow-hidden">
            {/* Golden Elegant Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex self-start items-center gap-[0.5vw] bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/20 px-[clamp(6px,1vw,14px)] py-[clamp(2px,0.4vw,6px)] rounded-full mb-[2vw]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-[clamp(8px,1vw,12px)] font-bold text-amber-200 tracking-wide font-vazirmatn">
                سیستم صوتی انحصاری شیخ
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(13px,2.8vw,42px)] font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-[1.2] tracking-tight font-vazirmatn drop-shadow-sm"
            >
              قدرتی که شنیده می‌شود
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-300 text-[clamp(8.5px,1.15vw,15px)] leading-[1.65] font-light font-vazirmatn mt-[1.5vw] mb-[2.5vw] max-w-xl"
            >
              تجربه‌ای متفاوت از دنیای سیستم‌های صوتی، اسپیکرهای حرفه‌ای و تجهیزات دیجیتال با کیفیت ممتاز، ضمانت اصالت و بهترین قیمت در فروشگاه شیخ.
            </motion.p>

            {/* CTA Buttons side-by-side */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-row gap-[1.5vw] items-center"
            >
              {/* Primary Button */}
              <Link href="/categories/sheikh-audio" className="flex-1 max-w-[195px]">
                <button className="w-full whitespace-nowrap bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-[clamp(7.5px,1.05vw,14px)] font-black font-vazirmatn py-[clamp(5px,0.85vw,12px)] px-[clamp(8px,1.6vw,26px)] rounded-[clamp(6px,0.9vw,12px)] shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-[0.4vw]">
                  <span>مشاهده سیستم‌های صوتی</span>
                  <Volume2 className="w-[clamp(8px,1.2vw,16px)] h-[clamp(8px,1.2vw,16px)] shrink-0" />
                </button>
              </Link>

              {/* Secondary Button */}
              <Link href="/sheikh-digital" className="flex-1 max-w-[195px]">
                <button className="w-full whitespace-nowrap bg-stone-950/80 hover:bg-stone-900 border border-amber-500/25 hover:border-amber-400/45 text-amber-200 text-[clamp(7.5px,1.05vw,14px)] font-bold font-vazirmatn py-[clamp(5px,0.85vw,12px)] px-[clamp(8px,1.6vw,26px)] rounded-[clamp(6px,0.9vw,12px)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-[0.4vw] backdrop-blur-md">
                  <span>مشاهده شیخ دیجیتال</span>
                  <Sparkles className="w-[clamp(8px,1.2vw,16px)] h-[clamp(8px,1.2vw,16px)] text-amber-400 shrink-0" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* LEFT SIDE: Interactive Three.js/Fallback Showcase */}
          <div className="w-[45%] h-[clamp(140px,28vw,480px)] relative flex items-center justify-center overflow-hidden">
            {/* Subtle glow surrounding the showcase */}
            <div
              className={`absolute inset-0 rounded-[1.5rem] bg-amber-400/5 blur-xl transition-opacity duration-700 pointer-events-none ${
                hovered ? 'opacity-100' : 'opacity-40'
              }`}
            />

            <ThreeErrorBoundary fallback={<Premium2DFallback />}>
              {webGLSupported && !prefersReducedMotion && inView && !isMobile ? (
                <div className="w-full h-full relative z-10 pointer-events-auto overflow-hidden">
                  <Suspense fallback={<CanvasFallback />}>
                    <Speaker3DCanvas hovered={hovered} />
                  </Suspense>
                </div>
              ) : (
                <Premium2DFallback />
              )}
            </ThreeErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}
