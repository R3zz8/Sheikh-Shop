'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

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

export default function LazyPalmTree({
  height = 'h-[500px] lg:h-[550px]',
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
}: LazyPalmTreeProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

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

  // Load 3D component when in view or user interacts
  useEffect(() => {
    if (inView || userInteracted) {
      setShouldLoad(true);
    }
  }, [inView, userInteracted]);

  const handlePosterClick = () => {
    setUserInteracted(true);
    setShouldLoad(true);
  };

  // Static poster image for reduced motion or before loading
  const PosterImage = () => (
    <div 
      className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform duration-300"
      onClick={handlePosterClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handlePosterClick();
        }
      }}
      aria-label="Load 3D Palm Tree visualization"
    >
      <div className="text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
          <span className="text-3xl">🌴</span>
        </div>
        <h3 className="text-xl font-semibold text-amber-800 mb-2">Interactive 3D Palm Tree</h3>
        <p className="text-amber-700 text-sm mb-4">Click to explore our premium collection</p>
        <div className="inline-flex items-center px-4 py-2 bg-amber-200 rounded-full text-amber-800 font-medium group-hover:bg-amber-300 transition-colors">
          <span className="mr-2">✨</span>
          Click to Load 3D
        </div>
      </div>
    </div>
  );

  return (
    <div ref={ref} className={`w-full ${height} ${className}`}>
      {prefersReducedMotion || !shouldLoad ? (
        <PosterImage />
      ) : (
        <PalmTreeContainer
          height={height}
          enableControls={enableControls}
          autoRotate={autoRotate}
          intensity={intensity}
          className="rounded-2xl"
        />
      )}
    </div>
  );
}





