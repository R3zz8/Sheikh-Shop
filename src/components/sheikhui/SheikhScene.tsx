"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Smartphone,
  Car,
  ShoppingBag,
  Code2,
  Cpu,
  Shield,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import MobileSheikhRadialNetwork from "./MobileSheikhRadialNetwork";

// Dynamic import of 3D Canvas subcomponent (Three.js / R3F only loaded on desktop when needed)
const Sheikh3DCanvas = dynamic(() => import('./Sheikh3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] relative z-10 flex items-center justify-center">
      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// Division items for the floating glass cards
interface DivisionItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  emoji: string;
}

const DIVISIONS: DivisionItem[] = [
  {
    id: "digital",
    name: "شیخ دیجیتال",
    description: "کالاهای دیجیتال، لوازم جانبی و گجت‌های هوشمند روز دنیا.",
    icon: Smartphone,
    color: "#f59e0b",
    emoji: "💻",
  },
  {
    id: "automotive",
    name: "شیخ خودرو",
    description: "لوازم لوکس، تجهیزات جانبی و فرآورده‌های تخصصی خودرو.",
    icon: Car,
    color: "#fbbf24",
    emoji: "🚗",
  },
  {
    id: "market",
    name: "شیخ مارکت",
    description: "محصولات ممتاز، عسل کوهی طبیعی، خرماهای صادراتی و زعفران.",
    icon: ShoppingBag,
    color: "#d97706",
    emoji: "🛒",
  },
  {
    id: "web",
    name: "شیخ وب",
    description: "طراحی و توسعه وب‌سایت‌های فوق‌پریمیوم تجاری و شخصی.",
    icon: Code2,
    color: "#c084fc",
    emoji: "🛠",
  },
  {
    id: "smart",
    name: "شیخ اسمارت",
    description: "تجهیزات مدرن خانه‌های هوشمند و گجت‌های اینترنت اشیاء.",
    icon: Cpu,
    color: "#fb7185",
    emoji: "💡",
  },
  {
    id: "security",
    name: "شیخ امنیت",
    description: "سامانه‌های نظارتی هوشمند و دزدگیرهای فوق پیشرفته.",
    icon: Shield,
    color: "#38bdf8",
    emoji: "🔐",
  },
  {
    id: "perfume",
    name: "شیخ پرفیوم",
    description: "عطرهای دست‌ساز، اسانس‌های سلطنتی و روایح شرقی ماندگار.",
    icon: Sparkles,
    color: "#f472b6",
    emoji: "🌸",
  },
];

// Helper hook to track mouse position for interactive 3D/2D parallax rotation
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
}

// Check if WebGL is available on the browser
function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

// Local specialized Error Boundary for the 3D Canvas
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

  public override componentDidCatch(error: any, errorInfo: any) {
    console.warn("Three.js failed to render. Gracefully falling back to 2D illustration layout.", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Premium 2D Fallback Illustration (when WebGL/Canvas fails or is unsupported)
function Premium2DFallback({ mouseX, mouseY, prefersReducedMotion }: { mouseX: number; mouseY: number; prefersReducedMotion: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: prefersReducedMotion ? 0 : [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: prefersReducedMotion ? 0 : Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      style={{
        transform: prefersReducedMotion ? "none" : `translate(${mouseX * 12}px, ${mouseY * 12}px)`,
      }}
      className="relative flex flex-col items-center justify-center w-[280px] h-[360px] sm:w-[320px] sm:h-[420px] rounded-[2rem] bg-gradient-to-b from-amber-500/10 via-stone-900/40 to-stone-950/80 border border-amber-400/20 shadow-2xl p-6 backdrop-blur-md"
    >
      {/* Golden Backlight Glow */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-400/20 to-transparent blur-2xl rounded-[2rem] pointer-events-none" />

      {/* Stylized premium Vector Sheikh Portrait Silhouette */}
      <svg
        viewBox="0 0 200 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-48 sm:w-56 h-auto drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] select-none pointer-events-none"
      >
        {/* Head Wrap (Keffiyeh) outline */}
        <path
          d="M60 40C60 25 75 15 100 15C125 15 140 25 140 40C140 55 145 70 155 85C165 100 162 130 162 155C162 165 150 170 142 162C130 150 115 145 100 145C85 145 70 150 58 162C50 170 38 165 38 155C38 130 35 100 45 85C55 70 60 55 60 40Z"
          fill="#FAF9F6"
        />
        {/* Agal Head Rings */}
        <ellipse cx="100" cy="30" rx="36" ry="6" fill="#111111" />
        <ellipse cx="100" cy="35" rx="38" ry="5.5" stroke="#fbbf24" strokeWidth="1.5" />
        <ellipse cx="100" cy="27" rx="34" ry="5" stroke="#111111" strokeWidth="1.5" />

        {/* Minimal Face */}
        <path d="M78 60C78 45 122 45 122 60C122 75 120 98 100 102C80 98 78 75 78 60Z" fill="#FFFDF9" />

        {/* Minimalist Beard Silhouette */}
        <path d="M78 78C78 98 85 110 100 115C115 110 122 98 122 78H78Z" fill="#1D1510" />

        {/* Smile curve */}
        <path d="M92 72C92 72 96 76 100 76C104 76 108 72 108 72" stroke="#1D1510" strokeWidth="1.5" strokeLinecap="round" />

        {/* Thobe and Bisht Robe shoulders */}
        <path
          d="M45 160C45 140 60 135 100 135C140 135 155 140 155 160L165 240H35L45 160Z"
          fill="#14110E"
        />
        <path
          d="M60 140C60 140 85 145 100 145C115 145 140 140 140 140L145 240H55L60 140Z"
          fill="#FAF9F6"
        />

        {/* Bisht golden zari embroidery trims */}
        <path d="M86 142V240" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M114 142V240" stroke="#fbbf24" strokeWidth="2.5" />
        <path d="M100 145V240" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>

      {/* Glowing luxury subtitle */}
      <div className="text-center mt-4">
        <span className="text-[13px] font-black text-amber-300 font-vazirmatn tracking-wide">
          تندیس سلطنتی شیخ
        </span>
        <div className="w-10 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
      </div>
    </motion.div>
  );
}

// Main Client Interactive SheikhScene Component
export default function SheikhScene() {
  const [mounted, setMounted] = useState(false);
  const [activeDivision, setActiveDivision] = useState<string | null>(null);
  const mouse = useMousePosition();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.05,
    rootMargin: '200px 0px',
    triggerOnce: false,
  });

  useEffect(() => {
    setMounted(true);
    // Detect WebGL support
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
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-[300px] md:min-h-[600px] bg-amber-950/20 flex items-center justify-center animate-pulse rounded-3xl">
        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Mobile-only performance isolation: Render lightweight radial network on mobile (<768px)
  if (isMobile) {
    return <MobileSheikhRadialNetwork />;
  }

  // Fallback 2D Render Container (to be passed to ErrorBoundary or directly loaded if WebGL is missing on desktop)
  const renderFallback = (
    <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] relative z-10 flex items-center justify-center pointer-events-auto">
      <Premium2DFallback
        mouseX={mouse.x}
        mouseY={mouse.y}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  );

  return (
    <section ref={sectionRef} className="relative w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16">
      {/* Background Soft Ray / Radial Aura */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-radial-gradient from-amber-500/10 to-transparent blur-[120px] animate-pulse duration-5000" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-radial-gradient from-orange-500/10 to-transparent blur-[120px]" />
      </div>

      {/* ONE LARGE PREMIUM HERO CARD */}
      <div className="relative z-10 w-full rounded-[2.5rem] bg-gradient-to-br from-stone-900/90 via-amber-950/45 to-stone-950/90 border border-amber-500/15 p-6 sm:p-10 md:p-16 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden">
        {/* Luxury Glass Shimmer Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-white/5 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* LEFT CONTENT (RTL) */}
          <div className="lg:col-span-6 text-right flex flex-col justify-center order-2 lg:order-1 select-none">
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex self-start items-center gap-2 bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/20 px-4.5 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-medium text-amber-200 tracking-wide font-vazirmatn"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              اکوسیستم مجلل فروشگاه شیخ
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-[1.2] tracking-tight mb-6 font-vazirmatn drop-shadow-sm"
            >
              به دنیای فروشگاه شیخ
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                خوش آمدید
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-gray-300 text-base sm:text-lg md:text-xl leading-[1.95] mb-10 max-w-2xl font-light font-vazirmatn"
            >
              فروشگاه شیخ تنها یک فروشگاه اینترنتی نیست؛
              <br className="hidden sm:inline" />
              اکوسیستمی از محصولات و خدمات متنوع شامل کالاهای دیجیتال، لوازم خودرو، عطر و ادکلن، تجهیزات هوشمند، محصولات روزمره و خدمات تخصصی طراحی وب که تجربه‌ای متفاوت از خرید آنلاین را برای شما فراهم می‌کند.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-[14px] sm:gap-4.5 items-center sm:items-stretch justify-center sm:justify-start w-full sm:w-auto pb-[30px] sm:pb-0"
            >
              {/* Primary: Shop Products */}
              <Link href="/products" className="group w-full sm:w-auto flex justify-center">
                <button className="w-full max-w-[340px] sm:max-w-none sm:w-auto h-[48px] sm:h-auto relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 sm:from-amber-500 sm:via-orange-500 sm:to-amber-600 px-6 sm:px-8 sm:py-4.5 rounded-full sm:rounded-2xl text-stone-950 text-sm sm:text-base font-black font-vazirmatn shadow-[0_8px_30px_rgb(245,158,11,0.25)] hover:shadow-[0_12px_40px_rgb(245,158,11,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] flex items-center justify-center gap-2 sm:gap-3">
                  <span>مشاهده محصولات</span>
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
              </Link>

              {/* Secondary: Custom Website Development */}
              <Link href="/contact" className="group w-full sm:w-auto flex justify-center">
                <button className="w-full max-w-[340px] sm:max-w-none sm:w-auto h-[44px] sm:h-auto bg-stone-950/40 sm:bg-stone-950/80 hover:bg-stone-900 border border-amber-500/20 sm:border-amber-500/25 hover:border-amber-400/40 px-6 sm:px-8 sm:py-4.5 rounded-full sm:rounded-2xl text-amber-200/90 sm:text-amber-200 text-xs sm:text-base font-bold font-vazirmatn transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md shadow-md">
                  <span>سفارش طراحی سایت</span>
                  <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/90 sm:text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT SIDE (3D Scene and Division cards) */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center min-h-[480px] sm:min-h-[550px] lg:min-h-[620px] order-1 lg:order-2">
            {/* Background 3D Glow Aura */}
            <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-gradient-radial from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none z-0" />

            {/* FLOATING BRAND PANELS (DESKTOP & TABLET LAYOUT) */}
            <div className="hidden sm:block absolute inset-0 z-20 pointer-events-none">
              <AnimatePresence>
                {DIVISIONS.map((div, i) => {
                  // Coordinate positions surrounding the 3D character elegantly
                  const angle = (i / DIVISIONS.length) * Math.PI * 2;
                  // Dynamic placement coordinates
                  const top = 50 + Math.sin(angle) * 36;
                  const left = 50 + Math.cos(angle) * 38;

                  return (
                    <motion.div
                      key={div.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: prefersReducedMotion ? 0 : [0, i % 2 === 0 ? -7 : 7, 0],
                      }}
                      transition={{
                        delay: 0.1 * i,
                        duration: 4 + (i % 3),
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                      }}
                      onMouseEnter={() => setActiveDivision(div.id)}
                      onMouseLeave={() => setActiveDivision(null)}
                      className="absolute pointer-events-auto cursor-pointer"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {/* Glassmorphic Rounded Division Card */}
                      <div
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-xl transition-all duration-500 shadow-xl ${
                          activeDivision === div.id
                            ? "bg-amber-500/20 border-amber-400 scale-115 shadow-[0_0_25px_rgba(245,158,11,0.45)] z-50"
                            : "bg-stone-950/75 border-amber-500/15 hover:border-amber-400/40 shadow-stone-950/60"
                        }`}
                      >
                        <div className="text-xl">{div.emoji}</div>
                        <div className="flex flex-col text-right">
                          <span className="text-[12px] font-black text-amber-100 tracking-wide font-vazirmatn">
                            {div.name}
                          </span>
                        </div>

                        {/* Interactive glow effect */}
                        {activeDivision === div.id && (
                          <div className="absolute inset-0 rounded-2xl bg-amber-400/5 blur-md animate-pulse pointer-events-none" />
                        )}
                      </div>

                      {/* Floating Card Description Overlay on Hover */}
                      <AnimatePresence>
                        {activeDivision === div.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-56 p-3.5 rounded-xl border border-amber-500/30 bg-stone-950/95 backdrop-blur-xl shadow-2xl z-50 pointer-events-none text-right flex flex-col gap-1"
                          >
                            <span className="font-bold text-[13px] text-amber-300 font-vazirmatn">
                              {div.name}
                            </span>
                            <p className="text-[11px] text-gray-300 leading-relaxed font-vazirmatn">
                              {div.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* THREE.JS CANVAS FOR PREMIUM 3D SHEIKH CHARACTER OR Graceful Fallback */}
            <ThreeErrorBoundary fallback={renderFallback}>
              {webGLSupported && inView && !isMobile ? (
                <Sheikh3DCanvas
                  mouseX={mouse.x}
                  mouseY={mouse.y}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ) : (
                renderFallback
              )}
            </ThreeErrorBoundary>
          </div>
        </div>

        {/* MOBILE FLOATING CARDS: HORIZONTALLY SCROLLABLE CHIPS */}
        <div className="sm:hidden mt-8 border-t border-amber-500/10 pt-6 relative z-30">
          <div className="text-right mb-3">
            <span className="text-[11px] font-black text-amber-400 font-vazirmatn tracking-wider uppercase">
              اکوسیستم خدمات و بخش‌های شیخ
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent snap-x snap-mandatory flex-row-reverse text-right px-1">
            {DIVISIONS.map((div) => (
              <div
                key={div.id}
                className="snap-center shrink-0 w-52 bg-stone-950/90 border border-amber-500/15 p-4 rounded-2xl flex flex-col gap-1.5 shadow-lg relative overflow-hidden active:border-amber-400 transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[12px] font-bold text-amber-200 font-vazirmatn">
                    {div.name}
                  </span>
                  <span className="text-lg">{div.emoji}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-normal font-vazirmatn">
                  {div.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
