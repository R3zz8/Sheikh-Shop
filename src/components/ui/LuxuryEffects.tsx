'use client';

import React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps, type Variants, type Easing } from 'framer-motion';
import { cn } from '@/lib/utils';

// ==========================================
// 1. MOTION WRAPPER (GPU & Reduced Motion aware)
// ==========================================
interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function MotionWrapper({ children, className, delay = 0 }: MotionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  const easeTuple: Easing = [0.16, 1, 0.3, 1] as any;

  const variants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easeTuple,
        delay: delay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      className={cn('gpu-accelerated', className)}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 2. AMBIENT GLOW (Floating Soft Colorful Light)
// ==========================================
export type GlowColor = 'gold' | 'blue' | 'emerald' | 'orange' | 'amber';

interface AmbientGlowProps {
  color: GlowColor;
  opacity?: number; // 0.10 to 0.18 (10% to 18%)
  blur?: number; // 100 to 180 (px)
  className?: string;
}

export function AmbientGlow({
  color,
  opacity = 0.12,
  blur = 140,
  className,
}: AmbientGlowProps) {
  const shouldReduceMotion = useReducedMotion();

  const colorMap = {
    gold: `rgba(217, 119, 6, ${opacity})`,
    amber: `rgba(245, 158, 11, ${opacity})`,
    blue: `rgba(59, 130, 246, ${opacity})`,
    emerald: `rgba(16, 185, 129, ${opacity})`,
    orange: `rgba(249, 115, 22, ${opacity})`,
  };

  const selectedColor = colorMap[color] || colorMap.gold;

  return (
    <div
      className={cn(
        'absolute pointer-events-none rounded-full select-none z-0 gpu-accelerated transition-transform duration-1000',
        className
      )}
      style={{
        background: `radial-gradient(circle, ${selectedColor} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        transform: 'translate3d(0, 0, 0)',
      }}
    />
  );
}

// ==========================================
// 3. ANIMATED NEON BORDERS (CSS Mask & Conic Rotation)
// ==========================================
export type BorderColor = 'gold' | 'amber' | 'blue' | 'emerald' | 'orange';

interface AnimatedBorderProps {
  color: BorderColor;
  className?: string;
  borderWidth?: number;
}

export function AnimatedBorder({
  color,
  className,
  borderWidth = 1.2,
}: AnimatedBorderProps) {
  const shouldReduceMotion = useReducedMotion();

  // Fine-tuned luxury gradient strings
  const gradientMap = {
    gold: 'conic-gradient(from 0deg, #d97706 0%, #fde68a 20%, #d97706 40%, #fbbf24 60%, #b45309 80%, #d97706 100%)',
    amber: 'conic-gradient(from 0deg, #b45309 0%, #fbbf24 25%, #f59e0b 50%, #fde68a 75%, #b45309 100%)',
    blue: 'conic-gradient(from 0deg, #1e40af 0%, #fbbf24 25%, #3b82f6 50%, #93c5fd 75%, #1e40af 100%)', // Blue-Gold Glow
    emerald: 'conic-gradient(from 0deg, #064e3b 0%, #34d399 25%, #059669 50%, #a7f3d0 75%, #064e3b 100%)', // Emerald Glow
    orange: 'conic-gradient(from 0deg, #c2410c 0%, #fb923c 25%, #f97316 50%, #ffedd5 75%, #c2410c 100%)',
  };

  const selectedGradient = gradientMap[color] || gradientMap.gold;

  // CSS mask style that cuts out the center, leaving ONLY the border
  const maskStyle: React.CSSProperties = {
    WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    WebkitMaskComposite: 'xor',
    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
    maskComposite: 'exclude',
    padding: `${borderWidth}px`,
  };

  return (
    <div
      className={cn(
        'absolute inset-0 rounded-[inherit] pointer-events-none select-none overflow-hidden z-20',
        className
      )}
      style={maskStyle}
    >
      <motion.div
        className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] origin-center"
        style={{
          background: selectedGradient,
        }}
        animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// ==========================================
// 4. GLASS REFLECTION (Apple Website-like Diagonal Sweep)
// ==========================================
interface GlassReflectionProps {
  duration?: number; // e.g., 10 to 15 seconds
  className?: string;
}

export function GlassReflection({
  duration = 12,
  className,
}: GlassReflectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none z-10 rounded-[inherit]', className)}>
      <motion.div
        className="absolute w-1/3 h-[250%] -top-[75%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-[25deg] filter blur-[4px] gpu-accelerated"
        initial={{ left: '-100%' }}
        animate={{ left: '250%' }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// ==========================================
// 5. HOVER GLOW & TRANSFORMS (Desktop only)
// ==========================================
interface HoverGlowProps {
  children: React.ReactNode;
  hasHoverEffect?: boolean;
  className?: string;
}

export function HoverGlow({
  children,
  hasHoverEffect = true,
  className,
}: HoverGlowProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!hasHoverEffect || shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{
        y: -4,
        rotate: 0.3,
        scale: 1.005,
        boxShadow: '0 25px 50px -12px rgba(217,119,6,0.12)',
        transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } as any,
      }}
      className={cn('gpu-accelerated origin-center', className)}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 6. LUXURY CARD (Combines Border, Glow, Reflection, Hover)
// ==========================================
interface LuxuryCardProps {
  children: React.ReactNode;
  borderType?: BorderColor | 'none';
  glowType?: GlowColor | 'none';
  hasReflection?: boolean;
  hasHoverEffect?: boolean;
  className?: string;
  glowOpacity?: number;
  glowBlur?: number;
}

export function LuxuryCard({
  children,
  borderType = 'gold',
  glowType = 'gold',
  hasReflection = true,
  hasHoverEffect = true,
  className,
  glowOpacity = 0.12,
  glowBlur = 140,
}: LuxuryCardProps) {
  const cardContent = (
    <div
      className={cn(
        'relative bg-[#2A1A12]/85 backdrop-blur-xl border border-amber-500/10 rounded-[2rem] p-6 sm:p-8 overflow-hidden z-10',
        className
      )}
    >
      {/* 1. Animated Neon Border */}
      {borderType !== 'none' && <AnimatedBorder color={borderType} />}

      {/* 2. Floating Ambient Glow Background */}
      {glowType !== 'none' && (
        <AmbientGlow
          color={glowType}
          opacity={glowOpacity}
          blur={glowBlur}
          className="absolute -top-[20%] -right-[20%] w-[140%] h-[140%]"
        />
      )}

      {/* 3. Moving Glass Reflection */}
      {hasReflection && <GlassReflection />}

      {/* Inner Children Content (must sit above background glows) */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );

  return (
    <HoverGlow hasHoverEffect={hasHoverEffect}>
      {cardContent}
    </HoverGlow>
  );
}

// ==========================================
// 7. LUXURY BUTTON (Animated Gradient, Inner Glow, Reflection)
// ==========================================
interface LuxuryButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'gold' | 'dark' | 'emerald';
  isLoading?: boolean;
}

export function LuxuryButton({
  children,
  className,
  variant = 'gold',
  isLoading = false,
  disabled,
  ...props
}: LuxuryButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  const variantClasses = {
    gold: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 shadow-[0_4px_20px_rgba(217,119,6,0.18)] border-amber-500/30',
    dark: 'bg-[#1C120C] hover:bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 shadow-inner',
    emerald: 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-stone-950 shadow-[0_4px_20px_rgba(16,185,129,0.18)] border-emerald-500/30',
  };

  const selectedVariantClass = variantClasses[variant] || variantClasses.gold;

  return (
    <motion.button
      whileHover={
        shouldReduceMotion || disabled || isLoading
          ? {}
          : {
              scale: 1.02,
              boxShadow: variant === 'gold'
                ? '0 6px 25px rgba(217,119,6,0.3)'
                : variant === 'emerald'
                ? '0 6px 25px rgba(16,185,129,0.3)'
                : '0 6px 25px rgba(217,119,6,0.15)',
              transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as any,
            }
      }
      whileTap={shouldReduceMotion || disabled || isLoading ? {} : { scale: 0.98 }}
      disabled={disabled || isLoading}
      className={cn(
        'relative overflow-hidden font-black rounded-2xl py-3.5 px-6 flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-98 cursor-pointer text-xs sm:text-sm border gpu-accelerated',
        // Inner Glow Style
        'before:absolute before:inset-0 before:p-[1px] before:rounded-[inherit] before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none before:z-30',
        selectedVariantClass,
        disabled || isLoading ? 'opacity-40 cursor-not-allowed' : '',
        className
      )}
      {...props}
    >
      {/* Golden/White reflection sweep across the button */}
      {!shouldReduceMotion && !disabled && !isLoading && (
        <GlassReflection duration={8} className="z-10" />
      )}

      {/* Button Content */}
      <span className="relative z-20 flex items-center justify-center gap-2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </span>
    </motion.button>
  );
}
