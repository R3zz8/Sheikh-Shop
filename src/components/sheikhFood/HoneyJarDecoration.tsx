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
    console.warn('HoneyJar 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function HoneyJarModel() {
  const groupRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Gentle float & rotation
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.06;
      groupRef.current.rotation.y = time * 0.2;

      // Mouse tilt parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.2, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.2, 0.1);
    }

    // Slowly drift particles
    if (particleGroupRef.current) {
      particleGroupRef.current.children.forEach((child, idx) => {
        child.position.y = ((idx * 0.15 + time * 0.05) % 0.6) - 0.3;
        child.position.x += Math.sin(time + idx) * 0.001;
      });
    }
  });

  return (
    <group ref={groupRef} scale={[0.8, 0.8, 0.8]} position={[0, -0.1, 0]}>
      {/* Matte Glass Jar Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.5, 32]} />
        <meshStandardMaterial
          color="#fbbf24" // Honey amber color
          roughness={0.25}
          metalness={0.1}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* Honey Fluid Inside */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.27, 0.29, 0.38, 24]} />
        <meshStandardMaterial
          color="#d97706" // Deep amber honey
          emissive="#b45309"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.0}
        />
      </mesh>

      {/* Golden Lid */}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.08, 32]} />
        <meshStandardMaterial
          color="#d4af37" // Luxurious Gold
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Lid Accent Rim */}
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.32, 0.015, 8, 32]} />
        <meshStandardMaterial
          color="#f59e0b" // Slightly warmer gold trim
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Internal floating honey glow */}
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={1.2} color="#f59e0b" />

      {/* Floating Honey Glow particles */}
      <group ref={particleGroupRef}>
        {[...Array(6)].map((_, idx) => (
          <mesh
            key={idx}
            position={[
              Math.sin(idx * 2.3) * 0.18,
              (idx * 0.1) - 0.3,
              Math.cos(idx * 1.7) * 0.18
            ]}
          >
            <sphereGeometry args={[0.015 + (idx % 3) * 0.005, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a" // Bright glowing yellow
              emissive="#fbbf24"
              emissiveIntensity={1.0}
              transparent={true}
              opacity={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function HoneyJarStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG honey jar luxury illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 8h12v10a3 3 0 01-3 3H9a3 3 0 01-3-3V8z" fill="#d97706" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M5 5h14v3H5V5z" fill="#1e120b" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="12" cy="14" r="2" fill="#fef08a" className="animate-ping" style={{ transformOrigin: 'center' }} />
        <line x1="8" y1="12" x2="16" y2="12" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="10" y1="15" x2="14" y2="15" stroke="#d4af37" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

interface HoneyJarDecorationProps {
  className?: string;
}

export default function HoneyJarDecoration({ className }: HoneyJarDecorationProps) {
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
        <ThreeErrorBoundary fallback={<HoneyJarStaticFallback />}>
          <Suspense fallback={<HoneyJarStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[-1, 2, 1.5]} intensity={1.5} color="#fffbee" />
              <pointLight position={[1, -1, 1]} intensity={0.5} color="#fbbf24" />
              <HoneyJarModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <HoneyJarStaticFallback />
      )}
    </div>
  );
}
