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
    console.warn('Dates 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function DatesModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(time * 0.7) * 0.05;
      groupRef.current.rotation.y = time * 0.15;

      // Subtle mouse tilt parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.18, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.18, 0.1);
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]} position={[0, -0.05, 0]}>
      {/* Luxury Wooden Tray */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.5]} />
        <meshStandardMaterial
          color="#3e2723" // Dark chocolate / espresso wood
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Tray Gold Trim Details */}
      <mesh position={[0, -0.13, 0.25]}>
        <boxGeometry args={[0.72, 0.02, 0.015]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.13, -0.25]}>
        <boxGeometry args={[0.72, 0.02, 0.015]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Realistic Palm Leaf underneath the dates */}
      <group position={[0, -0.11, 0]} rotation={[0, -0.3, 0.05]}>
        {/* Main stem */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.015, 0.6, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.7} />
        </mesh>
        {/* Leaflets */}
        {[...Array(8)].map((_, idx) => {
          const zOffset = (idx - 3.5) * 0.06;
          const xOffset = Math.sin(idx) * 0.02;
          return (
            <group key={idx} position={[xOffset, 0, zOffset]}>
              <mesh rotation={[0.2, 0.5, 0]}>
                <boxGeometry args={[0.18, 0.002, 0.02]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.6} />
              </mesh>
              <mesh rotation={[-0.2, -0.5, 0]}>
                <boxGeometry args={[0.18, 0.002, 0.02]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Premium Medjool Dates on Tray */}
      <group position={[0, -0.08, 0]}>
        {/* Date 1 */}
        <mesh position={[-0.12, 0, 0.05]} rotation={[0.2, 0.4, 0.1]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#2d150b" // Beautiful natural dark dates brown
            roughness={0.75}
            metalness={0.05}
          />
        </mesh>
        {/* Date 2 */}
        <mesh position={[0.1, 0, -0.08]} rotation={[-0.1, -0.3, 0.2]}>
          <sphereGeometry args={[0.075, 16, 16]} />
          <meshStandardMaterial
            color="#210c04"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
        {/* Date 3 */}
        <mesh position={[0.02, 0, 0.08]} rotation={[0.3, -0.1, -0.15]}>
          <sphereGeometry args={[0.072, 16, 16]} />
          <meshStandardMaterial
            color="#2a1205"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        {/* Date 4 (stacked slightly on top) */}
        <mesh position={[-0.03, 0.05, -0.02]} rotation={[0.1, 0.2, -0.05]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#1e0a02"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Warm Golden ambient glow from the side */}
      <pointLight position={[0.3, 0.4, 0.2]} intensity={1.8} distance={1.5} color="#fbbf24" />
    </group>
  );
}

function DatesStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG premium dates & palm leaf illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3e2723" stroke="#d4af37" strokeWidth="1.5" />
        <ellipse cx="9" cy="12" rx="3.5" ry="2" fill="#210c04" stroke="#d4af37" strokeWidth="1.5" />
        <ellipse cx="15" cy="12" rx="3.5" ry="2" fill="#210c04" stroke="#d4af37" strokeWidth="1.5" />
        <ellipse cx="12" cy="9" rx="3.5" ry="2" fill="#1e0a02" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M4 16c4 0 6-2 8-5s4-3 8-3" stroke="#2e7d32" strokeWidth="2.0" strokeLinecap="round" />
      </svg>
    </div>
  );
}

interface DatesDecorationProps {
  className?: string;
}

export default function DatesDecoration({ className }: DatesDecorationProps) {
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
    <div ref={ref} className={`${sizeClass} relative flex items-center justify-center`}>
      {inView && hasWebGL ? (
        <ThreeErrorBoundary fallback={<DatesStaticFallback />}>
          <Suspense fallback={<DatesStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[-1, 2, 1.5]} intensity={1.5} color="#fffbee" />
              <pointLight position={[1, -1, 1]} intensity={0.5} color="#fbbf24" />
              <DatesModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <DatesStaticFallback />
      )}
    </div>
  );
}
