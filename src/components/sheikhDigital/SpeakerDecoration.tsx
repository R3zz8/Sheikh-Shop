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
  const speakerRef = useRef<THREE.Group>(null);
  const woofer1Ref = useRef<THREE.Mesh>(null);
  const woofer2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Slow float & gentle rotation
    if (speakerRef.current) {
      speakerRef.current.position.y = Math.sin(time * 0.8) * 0.08;
      speakerRef.current.rotation.y = Math.sin(time * 0.4) * 0.15;
    }

    // Bass pulse every ~2.5 seconds
    const pulseCycle = (time * 2.5) % (Math.PI * 2);
    // Pulse is active when sine is high
    const pulseStrength = Math.max(0, Math.sin(pulseCycle));
    const bassScale = 1.0 + pulseStrength * 0.08;

    if (woofer1Ref.current) {
      woofer1Ref.current.scale.set(bassScale, bassScale, 1.0);
    }
    if (woofer2Ref.current) {
      woofer2Ref.current.scale.set(bassScale, bassScale, 1.0);
    }
  });

  return (
    <group ref={speakerRef} position={[0, -0.4, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Main Speaker Cabinet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.9, 0.3]} />
        <meshStandardMaterial
          color="#111111" // Premium Matte Black
          roughness={0.4}
          metalness={0.7}
        />
      </mesh>

      {/* Gold Front Trim Borders */}
      <mesh position={[0, 0, 0.152]}>
        <planeGeometry args={[0.34, 0.86]} />
        <meshStandardMaterial
          color="#d4af37" // Luxurious Gold Border
          metalness={0.9}
          roughness={0.15}
          wireframe
        />
      </mesh>

      {/* Tweeter (Top Speaker Driver) */}
      <group position={[0, 0.28, 0.155]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
          <meshStandardMaterial color="#222222" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Upper Woofer with LED ring (Bass Pulsing) */}
      <group position={[0, 0.04, 0.155]}>
        <mesh ref={woofer1Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
        {/* LED Ring / Gold Accent */}
        <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.008, 16, 32]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d4af37"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Lower Woofer with LED ring (Bass Pulsing) */}
      <group position={[0, -0.22, 0.155]}>
        <mesh ref={woofer2Ref} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
        {/* LED Ring / Gold Accent */}
        <mesh position={[0, 0, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.008, 16, 32]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d4af37"
            emissiveIntensity={0.6}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Base Platform / Gold Accented Feet */}
      <mesh position={[0, -0.46, 0]}>
        <boxGeometry args={[0.4, 0.03, 0.34]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function SpeakerStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG speaker illustration */}
      <svg className="w-14 h-14 md:w-16 md:h-16 text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
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
    return <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px]" />;
  }

  return (
    <div ref={ref} className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] relative flex items-center justify-center">
      {inView && hasWebGL ? (
        <ThreeErrorBoundary fallback={<SpeakerStaticFallback />}>
          <Suspense fallback={<SpeakerStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1, 2, 1.5]} intensity={1.8} color="#fffbee" />
              <pointLight position={[-1, -1, 1]} intensity={0.5} color="#fbbf24" />
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
