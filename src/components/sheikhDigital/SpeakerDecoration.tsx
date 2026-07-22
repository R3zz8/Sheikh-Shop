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
    console.warn('Speaker 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function SpeakerModel() {
  const groupRef = useRef<THREE.Group>(null);
  const woofer1Ref = useRef<THREE.Mesh>(null);
  const woofer2Ref = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer; // Mouse positions on canvas screen (-1 to 1)

    // Slow float & gentle rotation & mouse tilt parallax
    if (groupRef.current) {
      // Float
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.08 - 0.2;

      // Slow rotation
      groupRef.current.rotation.y = time * 0.15;

      // Mouse tilt interaction (lerp to smooth)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.2, 0.1);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.2, 0.1);
    }

    // Dynamic scale/opacity shadow plane based on height (AO Shadow effect)
    if (shadowRef.current && groupRef.current) {
      const heightOffset = groupRef.current.position.y + 0.2; // normalize offset
      const shadowScale = Math.max(0.4, 1.0 - heightOffset * 0.5);
      shadowRef.current.scale.set(shadowScale, shadowScale, 1.0);

      const shadowMat = shadowRef.current.material as THREE.MeshBasicMaterial;
      if (shadowMat) {
        shadowMat.opacity = Math.max(0.2, 0.6 - heightOffset * 0.8);
      }
    }

    // Dynamic bass pulse animation on woofers
    const pulseCycle = (time * 2.5) % (Math.PI * 2);
    const pulseStrength = Math.max(0, Math.sin(pulseCycle));
    const bassScale = 1.0 + pulseStrength * 0.06;

    if (woofer1Ref.current) {
      woofer1Ref.current.scale.set(bassScale, bassScale, 1.0);
    }
    if (woofer2Ref.current) {
      woofer2Ref.current.scale.set(bassScale, bassScale, 1.0);
    }
  });

  return (
    <group>
      {/* Speaker Main Group */}
      <group ref={groupRef} position={[0, -0.2, 0]} scale={[1.3, 1.3, 1.3]}>
        {/* Main Speaker Cabinet */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.85, 0.28]} />
          <meshStandardMaterial
            color="#120a06" // Deep Luxury Dark Chocolate Brown
            roughness={0.25}
            metalness={0.8}
          />
        </mesh>

        {/* Polished Gold Front Trim Borders */}
        <mesh position={[0, 0, 0.142]}>
          <planeGeometry args={[0.32, 0.81]} />
          <meshStandardMaterial
            color="#d4af37" // Luxurious Gold Border
            metalness={0.95}
            roughness={0.1}
            wireframe
          />
        </mesh>

        {/* Tweeter (Top Speaker Driver) */}
        <group position={[0, 0.26, 0.145]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.01, 32]} />
            <meshStandardMaterial color="#0c0704" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.01, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>

        {/* Upper Woofer with Golden LED ring */}
        <group position={[0, 0.03, 0.145]}>
          <mesh ref={woofer1Ref} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.015, 32]} />
            <meshStandardMaterial color="#1a0f09" roughness={0.5} />
          </mesh>
          {/* LED Ring / Gold Accent (Emissive bloom) */}
          <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.082, 0.006, 16, 32]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d4af37"
              emissiveIntensity={1.2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Lower Woofer with Golden LED ring */}
        <group position={[0, -0.2, 0.145]}>
          <mesh ref={woofer2Ref} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.015, 32]} />
            <meshStandardMaterial color="#1a0f09" roughness={0.5} />
          </mesh>
          {/* LED Ring / Gold Accent (Emissive bloom) */}
          <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.082, 0.006, 16, 32]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d4af37"
              emissiveIntensity={1.2}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* Base Platform / Gold Accented Feet */}
        <mesh position={[0, -0.43, 0]}>
          <boxGeometry args={[0.38, 0.025, 0.32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.98} roughness={0.05} />
        </mesh>
      </group>

      {/* AO Bottom Shadow Plane */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
}

function SpeakerStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG speaker illustration */}
      <svg className="w-16 h-16 md:w-20 md:h-20 text-amber-500/80 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="3" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <circle cx="12" cy="7" r="2.5" stroke="#d4af37" fill="#111" />
        <circle cx="12" cy="7" r="1" fill="#d4af37" />
        <circle cx="12" cy="15" r="4" stroke="#d4af37" fill="#111" className="animate-pulse" style={{ transformOrigin: 'center' }} />
        <circle cx="12" cy="15" r="2" fill="#d4af37" />
      </svg>
    </div>
  );
}

export default function SpeakerDecoration() {
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
    return <div className="w-full h-full" />;
  }

  return (
    <div ref={ref} className="w-full h-full relative flex items-center justify-center">
      {inView && hasWebGL ? (
        <ThreeErrorBoundary fallback={<SpeakerStaticFallback />}>
          <Suspense fallback={<SpeakerStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.3} />
              <directionalLight position={[1.5, 2.5, 1.5]} intensity={2.0} color="#fffbee" />
              <pointLight position={[-1.5, -1, 1]} intensity={0.6} color="#fbbf24" />
              <SpeakerModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <SpeakerStaticFallback />
      )}
    </div>
  );
}
