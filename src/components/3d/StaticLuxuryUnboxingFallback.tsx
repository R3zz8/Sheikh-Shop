'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, Heart, ExternalLink, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface StaticLuxuryUnboxingFallbackProps {
  product: {
    id: string;
    name: string;
    slug?: string | null;
    basePrice: number;
    images?: Array<{ image?: string | null; secureUrl?: string | null }> | null;
  };
  onClose?: () => void;
  config?: {
    ribbonColor?: string;
    goldenGlow?: string;
    enableAudio?: boolean;
    animationSpeed?: number;
  };
}

export default function StaticLuxuryUnboxingFallback({
  product,
  onClose,
  config = {},
}: StaticLuxuryUnboxingFallbackProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  const ribbonColor = config.ribbonColor || '#d97706';
  const goldenGlow = config.goldenGlow || '#f59e0b';
  const animationSpeed = config.animationSpeed || 1;

  // sequential unwrap image fallback
  const productImg = product.images && product.images.length > 0
    ? product.images[0]?.secureUrl || product.images[0]?.image || '/noImage.jpg'
    : '/noImage.jpg';

  const handleOpen = () => {
    if (isOpen || isAnimating) return;
    setIsAnimating(true);

    // Audio sound cues if enabled
    if (config.enableAudio !== false) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        // Custom simple synth chime for premium unbox
        const osc1 = context.createOscillator();
        const osc2 = context.createOscillator();
        const gainNode = context.createGain();

        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(261.63, context.currentTime); // C4
        osc1.frequency.exponentialRampToValueAtTime(523.25, context.currentTime + 0.3); // C5

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(329.63, context.currentTime); // E4
        osc2.frequency.exponentialRampToValueAtTime(659.25, context.currentTime + 0.4); // E5

        gainNode.gain.setValueAtTime(0.15, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 1.2);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(context.destination);

        osc1.start();
        osc2.start();
        osc1.stop(context.currentTime + 1.2);
        osc2.stop(context.currentTime + 1.2);
      } catch (e) {
        // Fallback silently if audio context blocked
      }
    }

    setTimeout(() => {
      setIsOpen(true);
      setIsAnimating(false);
      setTimeout(() => {
        setShowCTA(true);
      }, 800 / animationSpeed);
    }, 1200 / animationSpeed);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowCTA(false);
    setIsAnimating(false);
  };

  return (
    <div className="relative w-full h-[450px] bg-gradient-to-b from-[#1c110e] to-[#0c0706] rounded-2xl flex flex-col items-center justify-center overflow-hidden border border-amber-950/40 font-vazirmatn text-right select-none shadow-2xl p-6">
      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none z-10" />

      {/* Background luxury dust particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-35 z-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              backgroundColor: goldenGlow,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -120],
              x: [0, Math.sin(i) * 20],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors border border-amber-900/20"
          aria-label="بستن"
        >
          ✕
        </button>
      )}

      {/* Reset State Button */}
      {isOpen && (
        <button
          onClick={handleReset}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors border border-amber-900/20 flex items-center gap-1.5 text-xs px-3"
          aria-label="بستن مجدد جعبه"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بستن مجدد</span>
        </button>
      )}

      {/* Interactive Main Box Stage */}
      <div
        className="relative w-72 h-72 flex items-center justify-center z-10 cursor-pointer"
        onClick={handleOpen}
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="closed-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="relative w-52 h-52 bg-gradient-to-br from-[#301c15] to-[#1a0f0c] rounded-2xl border-2 border-amber-600/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-6 text-center"
            >
              {/* Gold Ribbon - Horizontal & Vertical crossing */}
              <div
                className="absolute inset-y-0 w-8 z-0 opacity-90"
                style={{ backgroundColor: ribbonColor, left: 'calc(50% - 16px)' }}
              />
              <div
                className="absolute inset-x-0 h-8 z-0 opacity-90"
                style={{ backgroundColor: ribbonColor, top: 'calc(50% - 16px)' }}
              />

              {/* Box top graphics */}
              <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none z-10" />

              {/* Engraved Crown */}
              <div className="relative z-20 bg-[#1a0f0c]/90 rounded-full p-4 border border-amber-500/35 shadow-inner">
                <span className="text-3xl text-amber-500 select-none">👑</span>
              </div>

              {/* Golden Lock */}
              <motion.div
                animate={isAnimating ? { y: [0, -5, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3, repeat: isAnimating ? 4 : 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-amber-400 to-amber-600 border border-amber-300 w-8 h-8 rounded-md shadow-lg flex items-center justify-center text-xs text-[#1a0f0c] font-bold"
              >
                🔒
              </motion.div>

              <div className="absolute inset-x-0 bottom-14 text-center z-10">
                <p className="text-amber-400 text-xs font-semibold tracking-wider animate-pulse">
                  برای بازگشایی ضربه بزنید
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="opened-box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-64 h-64 flex flex-col items-center justify-center"
            >
              {/* Golden Glow Backplane */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.4, scale: 1.5 }}
                className="absolute w-44 h-44 rounded-full filter blur-3xl pointer-events-none z-0"
                style={{ backgroundColor: goldenGlow }}
              />

              {/* Sparkles radiating out */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {[...Array(6)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: [0, Math.cos(idx * 60 * (Math.PI / 180)) * 90],
                      y: [0, Math.sin(idx * 60 * (Math.PI / 180)) * 90],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400"
                  >
                    <Sparkles className="w-5 h-5 fill-current" />
                  </motion.div>
                ))}
              </div>

              {/* Floating Pedestal */}
              <div className="absolute bottom-4 w-40 h-8 bg-gradient-to-r from-[#201511] to-[#3a261f] border-t-2 border-amber-500/50 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.7)] z-0 flex items-center justify-center overflow-hidden">
                <div className="w-32 h-1 bg-amber-400/20 blur-sm rounded-full" />
              </div>

              {/* Product Rising */}
              <motion.div
                initial={{ y: 50, scale: 0.4, rotateY: 0 }}
                animate={{ y: -15, scale: 1, rotateY: 360 }}
                transition={{
                  y: { type: 'spring', stiffness: 80, damping: 10 },
                  scale: { duration: 0.6 },
                  rotateY: { duration: 12, ease: 'linear', repeat: Infinity },
                }}
                className="relative w-36 h-36 z-10 filter drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)]"
              >
                <Image
                  src={productImg}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="150px"
                  priority
                />
              </motion.div>

              {/* Rising golden dust trail */}
              <div className="absolute bottom-10 inset-x-0 h-24 pointer-events-none flex justify-center z-10">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-amber-400 absolute bottom-0"
                    animate={{
                      y: [-10, -80],
                      x: [Math.sin(i) * 10, Math.sin(i + 2) * 20],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Title / Description */}
      <div className="text-center mt-3 z-10 w-full px-4 max-w-sm">
        <h3 className="text-lg font-bold text-slate-100 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-amber-500 mt-1">
          عضو برتر مجموعه رویال شیخ شاپ
        </p>
      </div>

      {/* Premium CTA Buttons panel */}
      <div className="h-16 mt-4 z-20 w-full flex items-center justify-center">
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="flex items-center justify-center gap-2.5 w-full max-w-md px-2"
            >
              <LinkButton
                href={`/products/${product.slug || product.id}`}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2 text-xs border border-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>✨ مشاهده محصول</span>
              </LinkButton>

              <button
                onClick={() => {
                  // Direct to cart triggers or standard client behavior
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('add-to-cart', { detail: { productId: product.id } }));
                  }
                }}
                className="bg-[#241713] hover:bg-[#34211a] border border-amber-900/40 text-amber-400 py-2.5 px-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs transition-all transform hover:-translate-y-0.5"
                aria-label="افزودن به سبد خرید"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>🛒 افزودن به سبد</span>
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('toggle-favorite', { detail: { productId: product.id } }));
                  }
                }}
                className="bg-[#241713] hover:bg-[#34211a] border border-red-950/40 text-red-400 py-2.5 px-3.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs transition-all transform hover:-translate-y-0.5"
                aria-label="افزودن به علاقه‌مندی"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>❤️</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Internal small helper to handle standard linking nicely
function LinkButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
