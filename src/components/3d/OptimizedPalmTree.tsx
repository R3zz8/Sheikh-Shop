'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Lazy load the 3D component
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
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          // Add a small delay to ensure smooth transition
          setTimeout(() => setShouldLoad(true), 100);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Show static poster if user prefers reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full ${className}`}
        style={{ height }}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">Premium Date Palm</h3>
            <p className="text-sm opacity-90">Authentic Middle Eastern Heritage</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height }}
    >
      {/* Static poster image as fallback */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={posterImage}
            alt="Premium Date Palm Tree - Sheikh Shop"
            fill
            className="object-cover transition-opacity duration-500"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">Premium Date Palm</h3>
            <p className="text-sm opacity-90">Click to explore in 3D</p>
          </div>
          {isInView && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <button
                onClick={() => setShouldLoad(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
              >
                Explore in 3D
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3D Component - only load when in view and user wants it */}
      {shouldLoad && (
        <div
          className={`w-full h-full transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <PalmTreeContainer
            height={height}
            enableControls={enableControls}
            autoRotate={autoRotate}
            intensity={intensity}
            className="rounded-2xl"
          />
        </div>
      )}

      {/* Decorative overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-lg" />
      </div>
    </div>
  );
}
