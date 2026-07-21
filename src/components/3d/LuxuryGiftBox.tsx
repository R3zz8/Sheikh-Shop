'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import ThreeErrorBoundary from './ThreeErrorBoundary';
import StaticLuxuryUnboxingFallback from './StaticLuxuryUnboxingFallback';

// Dynamically import the WebGL 3D Scene to keep chunk sizes optimized
const LuxuryGiftBoxScene = dynamic(() => import('./LuxuryGiftBoxScene'), {
  ssr: false,
});

function UnboxingCanvasFallback() {
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-[#120a07] to-[#040201] rounded-2xl flex items-center justify-center border border-amber-950/20">
      <div className="text-center p-4">
        <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-500 font-medium text-sm font-vazirmatn">در حال فضاسازی سه‌بعدی لوکس شیخ...</p>
      </div>
    </div>
  );
}

interface LuxuryGiftBoxProps {
  status: 'closed' | 'opening' | 'open';
  product: {
    id: string;
    name: string;
    slug?: string | null;
    basePrice: number;
    images?: Array<{ image?: string | null; secureUrl?: string | null }> | null;
  };
  config?: {
    animationSpeed?: number;
    particleDensity?: number;
    lightIntensity?: number;
    cameraDistance?: number;
    ribbonColor?: string;
    goldenGlow?: string;
    backgroundStyle?: string;
    openingDuration?: number;
    featuredProductMode?: string;
    enableAudio?: boolean;
  };
  onAnimationComplete?: () => void;
  onClose?: () => void;
  className?: string;
  height?: string;
}

export default function LuxuryGiftBox({
  status,
  product,
  config = {},
  onAnimationComplete,
  onClose,
  className = '',
  height = 'h-[450px]',
}: LuxuryGiftBoxProps) {
  const [isClient, setIsClient] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      // Check for WebGL compatibility
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setWebglSupported(false);
        }
      } catch (e) {
        setWebglSupported(false);
      }

      const handleResize = () => {
        setViewportWidth(window.innerWidth);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    return undefined;
  }, []);

  if (!isClient) {
    return <UnboxingCanvasFallback />;
  }

  // Fall back immediately if WebGL is unsupported
  if (!webglSupported) {
    return (
      <StaticLuxuryUnboxingFallback
        product={product}
        onClose={onClose}
        config={config}
      />
    );
  }

  // Responsive configurations
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  const responsiveConfig = {
    ...config,
    particleDensity: isMobile ? 0.2 : isTablet ? 0.5 : config.particleDensity ?? 1.0,
    cameraDistance: isMobile ? 6.5 : config.cameraDistance ?? 5.0,
  };

  const cameraFov = isMobile ? 55 : 45;

  return (
    <div className={`relative w-full overflow-hidden ${height} ${className}`.trim()}>
      <ThreeErrorBoundary fallbackProduct={product} onClose={onClose} config={config}>
        <Suspense fallback={<UnboxingCanvasFallback />}>
          <Canvas
            shadows
            camera={{
              position: [0, 1.8, isMobile ? 6.5 : config.cameraDistance ?? 5.0],
              fov: cameraFov,
              near: 0.1,
              far: 100,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <LuxuryGiftBoxScene
              status={status}
              product={product}
              config={responsiveConfig}
              onAnimationComplete={onAnimationComplete}
            />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>
    </div>
  );
}
