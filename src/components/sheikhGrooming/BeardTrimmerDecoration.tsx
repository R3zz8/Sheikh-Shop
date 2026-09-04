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
    console.warn('Beard Trimmer 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function BeardTrimmerModel() {
  const trimmerRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (trimmerRef.current) {
      trimmerRef.current.position.y = Math.sin(time * 0.8) * 0.03;
      trimmerRef.current.rotation.y = Math.sin(time * 0.3) * 0.12;
    }
  });

  return (
    <group ref={trimmerRef} position={[0, -0.05, 0]} rotation={[0.15, -0.3, 0.1]} scale={[1.15, 1.15, 1.15]}>
      {/* Sleek Precision Trimmer Body */}
      <mesh castShadow receiveShadow position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.48, 20]} />
        <meshStandardMaterial
          color="#110d0a"
          roughness={0.25}
          metalness={0.88}
        />
      </mesh>

      {/* Gold Ring Grip Accents */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.03, 20]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Detail T-Blade Precision Gold Head */}
      <mesh position={[0, 0.22, 0.015]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.14, 0.06, 0.03]} />
        <meshStandardMaterial
          color="#eab308"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Power Button Indicator */}
      <mesh position={[0, -0.1, 0.06]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d4af37" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

function BeardTrimmerStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 5 L14 5 L13 19 L11 18 Z" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <rect x="9" y="3" width="6" height="2" fill="#d4af37" />
        <circle cx="12" cy="14" r="1" fill="#fbbf24" className="animate-pulse" />
      </svg>
    </div>
  );
}

interface BeardTrimmerDecorationProps {
  className?: string;
}

export default function BeardTrimmerDecoration({ className }: BeardTrimmerDecorationProps) {
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
        <ThreeErrorBoundary fallback={<BeardTrimmerStaticFallback />}>
          <Suspense fallback={<BeardTrimmerStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={2.0} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.7} color="#fbbf24" />
              <BeardTrimmerModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <BeardTrimmerStaticFallback />
      )}
    </div>
  );
}
