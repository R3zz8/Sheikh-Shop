'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface LuxuryFeatureChipProps {
  feature: string;
}

export default function LuxuryFeatureChip({ feature }: LuxuryFeatureChipProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      className="group relative overflow-hidden flex items-center gap-3 px-5 py-3.5 rounded-full bg-stone-900/35 backdrop-blur-md border border-amber-500/10 shadow-md cursor-default select-none transition-all duration-300 hover:shadow-amber-500/20 hover:border-amber-500/20"
    >
      {/* Moving glass reflection sweep across the chip */}
      {!shouldReduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-full z-10">
          <motion.div
            className="absolute w-1/3 h-[250%] -top-[75%] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -skew-x-[25deg] filter blur-[2px] gpu-accelerated"
            initial={{ left: '-100%' }}
            animate={{ left: '250%' }}
            transition={{
              duration: 9, // Slow, premium glass sweep
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>
      )}

      {/* Thin conic rotating neon border */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none select-none overflow-hidden z-20 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
      >
        <motion.div
          className="absolute w-[200%] h-[200%] -top-[50%] -left-[50%] origin-center"
          style={{
            background: 'conic-gradient(from 0deg, #d97706 0%, #fb923c 25%, #f59e0b 50%, #fde68a 75%, #d97706 100%)',
          }}
          animate={shouldReduceMotion ? {} : { rotate: [0, 360] }}
          transition={{
            duration: 9, // 9 seconds slow rotation with no flashing or blinking
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Ambient glow backdrop under the feature chip on hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/5 to-orange-500/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

      {/* Premium Gold Check Icon / Highlight */}
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/5 border border-amber-500/30 group-hover:border-amber-400 flex items-center justify-center text-amber-400 font-extrabold text-xs shrink-0 z-10 shadow-sm transition-colors duration-300">
        <span className="scale-90 font-sans">✓</span>
      </div>

      {/* Premium Typography Feature Text */}
      <span className="text-xs sm:text-sm font-extrabold text-[#FAF6EE] group-hover:text-amber-200 transition-colors duration-300 z-10 relative leading-none">
        {feature}
      </span>
    </motion.div>
  );
}
