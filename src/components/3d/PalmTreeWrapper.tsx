'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the 3D palm tree component with optimized loading
const PalmTreeContainer = dynamic(() => import('./PalmTree'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-amber-700 font-medium">Loading 3D Palm Tree...</p>
      </div>
    </div>
  ),
});

interface PalmTreeWrapperProps {
  height?: string;
  enableControls?: boolean;
  autoRotate?: boolean;
  intensity?: number;
  className?: string;
}

export default function PalmTreeWrapper({
  height = '500px',
  enableControls = true,
  autoRotate = true,
  intensity = 1.2,
  className = '',
}: PalmTreeWrapperProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = () => setReducedMotion(mq.matches);
      onChange();
      mq.addEventListener?.('change', onChange);
      return () => mq.removeEventListener?.('change', onChange);
    }
    return undefined;
  }, []);

  if (reducedMotion) {
    return (
      <div className={`w-full rounded-2xl overflow-hidden ${className}`} style={{ height }}>
        <img
          src="/assets/palm-poster.jpg"
          alt="Palm Tree"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <PalmTreeContainer
      height={height}
      enableControls={enableControls}
      autoRotate={autoRotate}
      intensity={intensity}
      className={className}
    />
  );
}
