'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Lazy load the 3D component - auto-loads when in view
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
  height?: string;
  enableControls?: boolean;
  autoRotate?: boolean;
  intensity?: number;
  className?: string;
  posterImage?: string;
}

export default function OptimizedPalmTree({
  height = '500px',
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
  posterImage = '/palm-tree-poster.jpg',
}: OptimizedPalmTreeProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference - SSR safe
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-load when component comes into view - no user interaction required
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Auto-load immediately when in view
          setShouldLoad(true);
        }
      },
      {
        threshold: 0.01,
        rootMargin: '100px', // Start loading slightly before visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle both fixed heights (like "500px") and percentage heights (like "100%")
  const heightStyle = height === '100%' 
    ? { height: '100%', minHeight: '250px' }
    : { height };

  // Show static poster only if user prefers reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full ${className}`}
        style={heightStyle}
      >
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={posterImage}
            alt="Premium Date Palm Tree - Sheikh Shop"
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
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={heightStyle}
    >
      {/* Static poster image as fallback while loading */}
      {!shouldLoad && (
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={posterImage}
            alt="Premium Date Palm Tree - Sheikh Shop"
            fill
            className="object-cover transition-opacity duration-500"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* 3D Component - Auto-loads when in view */}
      {shouldLoad && (
        <div className="w-full h-full">
          <PalmTreeContainer
            height={height}
            enableControls={enableControls}
            autoRotate={autoRotate}
            intensity={intensity}
            className="rounded-2xl"
          />
        </div>
      )}

      {/* Subtle decorative overlay - no text or buttons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-lg" />
      </div>
    </div>
  );
}
