'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, Heart, ExternalLink, X, Play, FileText, CheckCircle2 } from 'lucide-react';
import LuxuryGiftBox from './LuxuryGiftBox';
import { luxuryAudio } from '@/lib/luxury-audio';
import { toast } from 'sonner';

interface LuxuryUnboxingContextType {
  triggerUnboxing: (product: any) => void;
  config: any;
}

const LuxuryUnboxingContext = createContext<LuxuryUnboxingContextType | undefined>(undefined);

export function useLuxuryUnboxing() {
  const context = useContext(LuxuryUnboxingContext);
  if (!context) {
    throw new Error('useLuxuryUnboxing must be used within a LuxuryUnboxingProvider');
  }
  return context;
}

export function LuxuryUnboxingProvider({ children }: { children: React.ReactNode }) {
  const [activeProduct, setActiveProduct] = useState<any | null>(null);
  const [unboxingStatus, setUnboxingStatus] = useState<'closed' | 'opening' | 'open'>('closed');
  const [showCTAs, setShowCTAs] = useState(false);
  const [introStep, setIntroState] = useState<'idle' | 'intro-blurting' | 'box-ready'>('idle');

  const [config, setConfig] = useState<any>({
    isEnabled: true,
    animationSpeed: 1.0,
    particleDensity: 1.0,
    lightIntensity: 1.0,
    cameraDistance: 5.0,
    enableAudio: true,
    ribbonColor: '#d97706',
    goldenGlow: '#f59e0b',
    backgroundStyle: 'dark-ambient',
    openingDuration: 3.0,
    featuredProductMode: 'pedestal',
    autoPreview: false,
    introDuration: 2.0,
    cameraSpeed: 1.0,
    fogIntensity: 1.0,
    audioVolume: 0.5,
    animationPreset: 'classic',
    autoClose: false,
    ctaStyle: 'luxury',
    themePreset: 'gold-chocolate',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Fetch actual admin configurations on mount and check reduced motion preference
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/luxury-unboxing');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            let parsed = data.config;

            // Check if user prefers reduced motion
            if (typeof window !== 'undefined') {
              const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              if (prefersReducedMotion) {
                parsed = {
                  ...parsed,
                  animationSpeed: 0.1, // Cap speeds close to instantaneous or static
                  particleDensity: 0.05, // Almost no particles
                  fogIntensity: 0.1,
                };
              }
            }
            setConfig(parsed);
          }
        }
      } catch (e) {
        // Fall back to premium defaults
      }
    };
    fetchConfig();
  }, []);

  const triggerUnboxing = useCallback((product: any) => {
    if (!config.isEnabled) {
      if (typeof window !== 'undefined' && product) {
        window.location.href = `/products/${product.slug || product.id}`;
      }
      return;
    }

    if (typeof window !== 'undefined') {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    setActiveProduct(product);
    setUnboxingStatus('closed');
    setShowCTAs(false);
    setIntroState('intro-blurting');

    // Cinematic Intro sequence
    const introTime = (config.introDuration ?? 2.0) * 1000;

    // Start background ambient audio
    if (config.enableAudio) {
      // Gentle entrance chime
      luxuryAudio.playSparkle();
    }

    // After introDuration, ready the 3D box scene
    setTimeout(() => {
      setIntroState('box-ready');
      if (config.autoPreview) {
        // Start opening sequence automatically if configured
        setTimeout(() => {
          startOpeningSequence();
        }, 500);
      }
    }, introTime);

  }, [config]);

  const handleClose = useCallback(() => {
    setActiveProduct(null);
    setUnboxingStatus('closed');
    setShowCTAs(false);
    setIntroState('idle');

    if (config.enableAudio) {
      luxuryAudio.playClick();
    }

    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [config]);

  const startOpeningSequence = () => {
    if (unboxingStatus !== 'closed') return;

    setUnboxingStatus('opening');

    if (config.enableAudio) {
      luxuryAudio.playUnlock();

      setTimeout(() => {
        luxuryAudio.playBoxOpen();
      }, 400);

      setTimeout(() => {
        luxuryAudio.playSparkle();
      }, 1100);
    }
  };

  const handleAnimationComplete = () => {
    setUnboxingStatus('open');
    setShowCTAs(true);

    // Auto close feature if enabled
    if (config.autoClose) {
      setTimeout(() => {
        handleClose();
      }, 5000);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeProduct) return;

      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (activeProduct) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [activeProduct, handleClose]);

  // Handle sequential buttons animation delays
  const btnVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <LuxuryUnboxingContext.Provider value={{ triggerUnboxing, config }}>
      {children}

      <AnimatePresence>
        {activeProduct && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl font-vazirmatn text-right"
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unboxing-title"
          >
            {/* Cinematic Golden dust floating background during intro */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-amber-400"
                  style={{
                    width: Math.random() * 5 + 3,
                    height: Math.random() * 5 + 3,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -150],
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{
                    duration: Math.random() * 5 + 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </div>

            {/* Backdrop Glow */}
            <div
              className="absolute w-[600px] h-[600px] rounded-full filter blur-[150px] opacity-20 mix-blend-screen pointer-events-none z-0"
              style={{ backgroundColor: config.goldenGlow }}
            />

            <motion.div
              ref={modalRef}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative w-full max-w-3xl bg-[#0a0605]/95 border border-amber-500/10 rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] m-4 z-10 flex flex-col"
            >

              {/* Header with animated Sheikh Crown & close button */}
              <div className="absolute top-5 inset-x-5 flex items-center justify-between z-30 pointer-events-none">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="text-xl"
                  >
                    👑
                  </motion.div>
                  <div>
                    <h2 id="unboxing-title" className="text-sm font-black text-amber-50 tracking-wide select-none">
                      تجربه آنباکسینگ اختصاصی شیخ
                    </h2>
                    <p className="text-[10px] text-amber-500/80 font-medium">هر خرید، آغاز یک تجربه لوکس</p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-stone-900/50 hover:bg-stone-900/90 text-stone-400 hover:text-white border border-amber-500/10 pointer-events-auto transition-all"
                  aria-label="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Cinematic Intro state switch */}
              <div className="w-full h-[380px] md:h-[450px] relative z-10 mt-10">
                {introStep === 'intro-blurting' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-20">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      className="text-center p-6"
                    >
                      <span className="text-4xl block mb-4 select-none animate-bounce">👑</span>
                      <h3 className="text-xl font-black text-amber-300 tracking-wider">آماده‌سازی تالار شکوه شیخ...</h3>
                      <p className="text-xs text-stone-400 mt-2">شبیه‌سازی حسی ۲۴ عیار گلد تریم دبی</p>
                    </motion.div>
                  </div>
                ) : (
                  <LuxuryGiftBox
                    status={unboxingStatus}
                    product={activeProduct}
                    config={config}
                    onAnimationComplete={handleAnimationComplete}
                    onClose={handleClose}
                    height="h-full"
                  />
                )}

                {/* Trigger open sequence button */}
                {unboxingStatus === 'closed' && introStep === 'box-ready' && (
                  <div className="absolute inset-x-0 bottom-8 flex justify-center z-20">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={startOpeningSequence}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-8 py-4 rounded-2xl shadow-2xl shadow-amber-500/25 border border-amber-400/20 transition-all flex items-center gap-2.5 text-sm"
                    >
                      <Play className="w-4 h-4 fill-current text-stone-950" />
                      <span>باز کردن جعبه کادو شیخ 👑</span>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Bottom detail and Actions Area */}
              <div className="p-6 bg-gradient-to-t from-stone-950 to-stone-950/40 border-t border-amber-500/5 z-20 flex flex-col items-center">
                <div className="text-center max-w-md">
                  <h3 className="text-base font-black text-stone-100">
                    {activeProduct.name}
                  </h3>
                  <p className="text-xs text-amber-500/80 mt-1 flex items-center justify-center gap-1.5 font-semibold">
                    <span>✨ هر خرید، آغاز یک تجربه لوکس</span>
                    <span>•</span>
                    <span>شاهکار اصیل شیخ‌شاپ</span>
                  </p>
                </div>

                {/* Sequential Buttons Appearing elegantly */}
                <div className="h-16 mt-5 w-full flex items-center justify-center">
                  <AnimatePresence>
                    {showCTAs && (
                      <div className="flex flex-wrap items-center gap-2.5 w-full max-w-xl justify-center px-4">

                        {/* 1. View Specs */}
                        <motion.a
                          href={`/products/${activeProduct.slug || activeProduct.id}`}
                          custom={0}
                          variants={btnVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex-1 min-w-[120px] bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 py-3 rounded-xl font-bold text-center text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <FileText className="w-4 h-4 text-stone-400" />
                          <span>📄 مشخصات کالا</span>
                        </motion.a>

                        {/* 2. Add to Cart */}
                        <motion.button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { productId: activeProduct.id } }));
                              toast.success('محصول با موفقیت به سبد خرید اضافه شد');
                            }
                          }}
                          custom={1}
                          variants={btnVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex-1 min-w-[120px] bg-stone-900 hover:bg-stone-850 border border-amber-500/20 text-amber-400 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>🛒 افزودن به سبد</span>
                        </motion.button>

                        {/* 3. Favorite */}
                        <motion.button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('toggle-favorite', { detail: { productId: activeProduct.id } }));
                              toast.success('محصول به علاقه‌مندی‌ها اضافه شد');
                            }
                          }}
                          custom={2}
                          variants={btnVariants}
                          initial="hidden"
                          animate="visible"
                          className="bg-stone-900 hover:bg-stone-850 border border-red-950/20 text-red-400 p-3 rounded-xl transition-all"
                          aria-label="افزودن به علاقه‌مندی‌ها"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </motion.button>

                        {/* 4. Instant Fast Purchase */}
                        <motion.button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { productId: activeProduct.id } }));
                              toast.success('سبد خرید آماده‌ شد. در حال هدایت به پرداخت...');
                              setTimeout(() => {
                                window.location.href = '/checkout';
                              }, 1000);
                            }
                          }}
                          custom={3}
                          variants={btnVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex-1 min-w-[120px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3 rounded-xl shadow-lg shadow-amber-500/10 text-xs flex items-center justify-center gap-1.5 border border-amber-300/10 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✨ خرید سریع</span>
                        </motion.button>

                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </LuxuryUnboxingContext.Provider>
  );
}
