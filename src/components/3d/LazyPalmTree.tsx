'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx'; // حتماً نصب کن: npm install clsx

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
  height?: string;
  enableControls?: boolean;
  autoRotate?: boolean;
  intensity?: number;
  className?: string;
}

// Static fallback
const StaticFallbackImage = ({ height, className }: { height: string; className?: string }) => (
  <div className={clsx('w-full rounded-2xl overflow-hidden', height, className)}>
    <img
      src="/assets/palm-poster.jpg"
      alt="Static palm tree"
      className="w-full h-full object-cover"
      loading="lazy"
    />
  </div>
);

export default function LazyPalmTree({
  height = 'h-[500px] lg:h-[550px]',
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
}: LazyPalmTreeProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      cleanup = () => mediaQuery.removeEventListener('change', handleChange);
    }

    return cleanup;
  }, []);

  if (prefersReducedMotion) {
    return <StaticFallbackImage height={height} className={className} />;
  }

  return (
    <div className={clsx('w-full', height, className)}>
      <PalmTreeContainer
        height={height}
        enableControls={enableControls}
        autoRotate={autoRotate}
        intensity={intensity}
        className="rounded-2xl"
      />
    </div>
  );
}