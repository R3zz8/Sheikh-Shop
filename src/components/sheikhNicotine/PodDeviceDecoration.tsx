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
    console.warn('Pod Device 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function PodDeviceModel() {
  const podRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (podRef.current) {
      // Gentle float and subtle rotation
      podRef.current.position.y = Math.sin(time * 0.9) * 0.03;
      podRef.current.rotation.y = Math.sin(time * 0.4) * 0.15;
    }
  });

  return (
    <group ref={podRef} position={[0, -0.1, 0]} rotation={[0.1, 0.3, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Main Metallic Pod Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.52, 0.12]} />
        <meshStandardMaterial
          color="#14110f"
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* Gold Trim Ring / Band */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.225, 0.025, 0.125]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* Translucent Pod Cartridge Top */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.09]} />
        <meshStandardMaterial
          color="#221710"
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Mouthpiece Tip */}
      <mesh position={[0, 0.39, 0]}>
        <boxGeometry args={[0.12, 0.05, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* LED Power Indicator Light */}
      <mesh position={[0, -0.12, 0.062]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d4af37" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function PodDeviceStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="8" y="7" width="8" height="14" rx="2" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#d4af37" strokeWidth="1.5" />
        <rect x="9" y="3" width="6" height="4" rx="1" fill="#111" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="12" cy="16" r="1" fill="#d4af37" className="animate-pulse" />
      </svg>
    </div>
  );
}

interface PodDeviceDecorationProps {
  className?: string;
}

export default function PodDeviceDecoration({ className }: PodDeviceDecorationProps) {
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
        <ThreeErrorBoundary fallback={<PodDeviceStaticFallback />}>
          <Suspense fallback={<PodDeviceStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={2.0} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.7} color="#fbbf24" />
              <PodDeviceModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <PodDeviceStaticFallback />
      )}
    </div>
  );
}
