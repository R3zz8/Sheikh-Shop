'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import the 3D palm tree component
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

interface LazyPalmTreeProps {
  enableControls?: boolean;
  autoRotate?: boolean;
  intensity?: number;
  className?: string;
}

export default function LazyPalmTree({
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
}: LazyPalmTreeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // For users who prefer reduced motion, show a static poster image.
  if (prefersReducedMotion) {
    return (
      <div className={`w-full h-[280px] sm:h-[340px] lg:h-[460px] rounded-2xl overflow-hidden ${className}`}>
        <Image
          src="/assets/palm-poster.jpg"
          alt="A static image of a palm tree."
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Otherwise, render the full 3D component.
  return (
    <div className={`w-full h-[280px] sm:h-[340px] lg:h-[460px] ${className}`}>
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
