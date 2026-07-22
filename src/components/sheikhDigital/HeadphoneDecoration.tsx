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
    console.warn('Headphone 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function HeadphoneModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer; // Mouse positions on canvas screen (-1 to 1)

    if (groupRef.current) {
      // Slow float & gentle rotation
      groupRef.current.position.y = Math.sin(time * 0.9) * 0.08;
      groupRef.current.rotation.y = time * 0.25;

      // Subtle mouse tilt parallax (independent of rotation)
      // We map pointer.x to rotation.z/y, and pointer.y to rotation.x
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.25, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.25, 0.1);
    }
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]} position={[0, 0, 0]}>
      {/* Headband Arc */}
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.55, 0.06, 16, 48, Math.PI]} />
        <meshStandardMaterial
          color="#1e120b" // Dark Chocolate leather brown
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Gold metallic frame connectors */}
      <mesh position={[-0.55, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0.55, 0.18, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.15, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Left Cup */}
      <group position={[-0.58, -0.1, 0]}>
        {/* Gold metal rod */}
        <mesh position={[0.03, 0.18, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Cup body */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 32]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Outer gold ring */}
        <mesh position={[-0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.2, 0.01, 8, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Cushion (leather) */}
        <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.18, 0.04, 16, 32]} />
          <meshStandardMaterial color="#1e120b" roughness={0.85} />
        </mesh>
      </group>

      {/* Right Cup */}
      <group position={[0.58, -0.1, 0]}>
        {/* Gold metal rod */}
        <mesh position={[-0.03, 0.18, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Cup body */}
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.12, 32]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.15} />
        </mesh>
        {/* Outer gold ring */}
        <mesh position={[0.06, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.2, 0.01, 8, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Cushion (leather) */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.18, 0.04, 16, 32]} />
          <meshStandardMaterial color="#1e120b" roughness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

function HeadphoneStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG headphone illustration */}
      <svg className="w-14 h-14 md:w-16 md:h-16 text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="2" y="12" width="4" height="6" rx="2" fill="#1e120b" stroke="#d4af37" strokeWidth="1.5" />
        <rect x="18" y="12" width="4" height="6" rx="2" fill="#1e120b" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M12 5v2" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="1.5" fill="#d4af37" className="animate-ping" style={{ transformOrigin: 'center' }} />
      </svg>
    </div>
  );
}

export default function HeadphoneDecoration() {
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

  if (!mounted) {
    return <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px]" />;
  }

  return (
    <div ref={ref} className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] relative flex items-center justify-center">
      {inView && hasWebGL ? (
        <ThreeErrorBoundary fallback={<HeadphoneStaticFallback />}>
          <Suspense fallback={<HeadphoneStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[-1, 2, 1.5]} intensity={1.8} color="#fffbee" />
              <pointLight position={[1, -1, 1]} intensity={0.5} color="#fbbf24" />
              <HeadphoneModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <HeadphoneStaticFallback />
      )}
    </div>
  );
}
