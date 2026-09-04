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
    console.warn('E-Liquid 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ELiquidModel() {
  const bottleRef = useRef<THREE.Group>(null);
  const vaporRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (bottleRef.current) {
      bottleRef.current.position.y = Math.sin(time * 0.8) * 0.03;
      bottleRef.current.rotation.y = Math.sin(time * 0.3) * 0.12;
    }
    if (vaporRef.current) {
      vaporRef.current.rotation.y = time * 0.15;
      vaporRef.current.position.y = Math.sin(time * 1.2) * 0.02;
    }
  });

  return (
    <group ref={bottleRef} position={[0, -0.15, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Liquid Bottle Main Glass Body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.38, 24]} />
        <meshStandardMaterial
          color="#120c08"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Gold Foil Bottle Label */}
      <mesh position={[0, 0, 0.001]}>
        <cylinderGeometry args={[0.162, 0.162, 0.22, 24, 1, true, 0, Math.PI * 1.5]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.9}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Dropper Cap Base */}
      <mesh position={[0, 0.23, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 24]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Rubber Pipette Top */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Subtle Abstract Golden Particles / Vapor Halos */}
      <group ref={vaporRef} position={[0, 0.38, 0]}>
        <mesh position={[0.04, 0.05, 0]}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d4af37" emissiveIntensity={0.6} transparent opacity={0.4} />
        </mesh>
        <mesh position={[-0.05, 0.09, 0.02]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d4af37" emissiveIntensity={0.5} transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

function ELiquidStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="7" y="9" width="10" height="12" rx="2" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <rect x="8" y="11" width="8" height="6" fill="#d4af37" opacity="0.8" />
        <rect x="9" y="5" width="6" height="4" fill="#111" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M12 2 Q10 4 12 5" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" className="animate-pulse" />
      </svg>
    </div>
  );
}

interface ELiquidDecorationProps {
  className?: string;
}

export default function ELiquidDecoration({ className }: ELiquidDecorationProps) {
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
        <ThreeErrorBoundary fallback={<ELiquidStaticFallback />}>
          <Suspense fallback={<ELiquidStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={2.0} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.7} color="#fbbf24" />
              <ELiquidModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <ELiquidStaticFallback />
      )}
    </div>
  );
}
