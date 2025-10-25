'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const PalmTreeContainer = dynamic(() => import('./PalmTree'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-amber-700 font-medium">Loading 3D Palm Tree...</p>
      </div>
    </div>
  ),
});

interface OptimizedPalmTreeProps {
  enableControls?: boolean;
  autoRotate?: boolean;
  intensity?: number;
  className?: string;
  posterImage?: string;
}

export default function OptimizedPalmTree({
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
  posterImage = '/palm-tree-poster.jpg',
}: OptimizedPalmTreeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        className={`relative w-full h-[280px] sm:h-[340px] lg:h-[460px] ${className}`}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden">
          <Image
            src={posterImage}
            alt="A static image of a palm tree."
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-[280px] sm:h-[340px] lg:h-[460px] ${className}`}>
      <PalmTreeContainer
        height="h-full"
        enableControls={enableControls}
        autoRotate={autoRotate}
        intensity={intensity}
        className="rounded-2xl"
      />
    </div>
  );
}
