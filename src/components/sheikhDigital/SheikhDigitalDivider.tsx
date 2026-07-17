'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SheikhDigitalDivider() {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 flex items-center justify-center overflow-hidden">
      {/* Subtle Horizontal glowing gold lines */}
      <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      {/* Active animated shimmer line */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'linear',
        }}
        className="absolute left-0 right-0 h-[1.5px] w-1/3 bg-gradient-to-r from-transparent via-amber-300 to-transparent"
      />

      {/* Decorative center gold crown or sparkle node */}
      <div className="relative z-10 flex items-center justify-center bg-[#170e08]/90 px-4 py-1.5 rounded-full border border-amber-500/20 shadow-xl backdrop-blur-md">
        <span className="text-amber-400 text-xs tracking-widest font-black select-none uppercase">
          ✦ SD LUXURY ✦
        </span>
        {/* Soft glowing dot */}
        <div className="absolute w-2 h-2 rounded-full bg-amber-400 blur-sm animate-ping" />
      </div>

      {/* Background soft lighting glow */}
      <div className="absolute w-24 h-24 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
    </div>
  );
}
