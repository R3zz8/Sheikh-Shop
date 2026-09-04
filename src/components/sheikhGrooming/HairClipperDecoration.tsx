'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInView } from 'react-intersection-observer';

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

interface ThreeErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

class ThreeErrorBoundary extends React.Component<ThreeErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ThreeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.warn('Hair Clipper 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function HairClipperModel() {
  const clipperRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (clipperRef.current) {
      clipperRef.current.position.y = Math.sin(time * 0.9) * 0.03;
      clipperRef.current.rotation.y = Math.sin(time * 0.4) * 0.14;
    }
  });

  return (
    <group ref={clipperRef} position={[0, -0.05, 0]} rotation={[0.2, 0.4, -0.1]} scale={[1.15, 1.15, 1.15]}>
      {/* Clipper Metallic Main Body */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.52, 20]} />
        <meshStandardMaterial
          color="#16120e"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Gold Accent Plate / Power Switch Strip */}
      <mesh position={[0, -0.02, 0.08]}>
        <boxGeometry args={[0.05, 0.28, 0.02]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Clipper Gold Metal Cutting Head/Blade */}
      <mesh position={[0, 0.23, 0.02]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.18, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#eab308"
          metalness={0.98}
          roughness={0.1}
        />
      </mesh>

      {/* Blade Comb Teeth Accent */}
      <mesh position={[0, 0.26, 0.03]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.17, 0.02, 0.02]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function HairClipperStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 4 L15 4 L14 18 L10 18 Z" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <rect x="8" y="2" width="8" height="2" fill="#d4af37" />
        <line x1="12" y1="8" x2="12" y2="14" stroke="#d4af37" strokeWidth="2" />
      </svg>
    </div>
  );
}

interface HairClipperDecorationProps {
  className?: string;
}

export default function HairClipperDecoration({ className }: HairClipperDecorationProps) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [hasWebGL, setHasWebGL] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasWebGL(isWebGLAvailable());
  }, []);

  const sizeClass = className || 'w-[80px] h-[80px] md:w-[100px] md:h-[100px]';

  if (!mounted) {
    return <div className={sizeClass} />;
  }

  return (
    <div ref={ref} className={`${sizeClass} relative flex items-center justify-center overflow-hidden`}>
      {inView && hasWebGL ? (
        <ThreeErrorBoundary fallback={<HairClipperStaticFallback />}>
          <Suspense fallback={<HairClipperStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={2.0} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.7} color="#fbbf24" />
              <HairClipperModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <HairClipperStaticFallback />
      )}
    </div>
  );
}
