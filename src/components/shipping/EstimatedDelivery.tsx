'use client';

import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';
import { getFormattedEstimatedDelivery } from '@/lib/shipping';

interface EstimatedDeliveryProps {
  className?: string;
  variant?: 'light' | 'dark' | 'glass';
  showDivider?: boolean;
}

export default function EstimatedDelivery({
  className = '',
  variant = 'glass',
  showDivider = true
}: EstimatedDeliveryProps) {
  const deliveryText = getFormattedEstimatedDelivery();

  // Subtle fade animation
  const containerVariants = {
    hidden: { opacity: 0, y: 2 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' as const }
    }
  };

  const isGlass = variant === 'glass';
  const isDark = variant === 'dark';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants as any}
      className={`w-full font-vazirmatn text-right ${className}`}
      dir="rtl"
    >
      {showDivider && (
        <div className={`w-full h-px my-2 ${
          isGlass
            ? 'bg-white/10'
            : isDark
              ? 'bg-amber-500/10'
              : 'bg-amber-500/10'
        }`} />
      )}

      <div className={`flex items-center justify-between gap-2 py-1 select-none transition-all duration-300 ${
        isGlass
          ? 'text-gray-300'
          : isDark
            ? 'text-gray-400'
            : 'text-amber-900'
      }`}>
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Truck className={`w-3.5 h-3.5 flex-shrink-0 ${
            isGlass ? 'text-amber-400/80' : isDark ? 'text-amber-500/60' : 'text-amber-600/80'
          }`} />
          <span className="text-[11px] md:text-xs font-normal tracking-wide whitespace-nowrap opacity-80">
            زمان تقریبی تحویل:
          </span>
        </div>
        <span className={`text-[11px] md:text-xs font-semibold whitespace-nowrap ${
          isGlass ? 'text-amber-300/90' : isDark ? 'text-amber-200/90' : 'text-amber-700'
        }`}>
          {deliveryText}
        </span>
      </div>
    </motion.div>
  );
}
