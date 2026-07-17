'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';

// ==========================================
// WebGL Support Detection
// ==========================================
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

// ==========================================
// Local specialized Error Boundary
// ==========================================
interface ThreeErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}
interface ThreeErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends React.Component<ThreeErrorBoundaryProps, ThreeErrorBoundaryState> {
  constructor(props: ThreeErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ThreeErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: any, errorInfo: any) {
    console.warn('Three.js digital rendering failed. Falling back gracefully.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ==========================================
// 3D Scene Components
// ==========================================

// Floating Luxury Headphones Component
function LuxuryHeadphones() {
  const headphonesGroupRef = useRef<THREE.Group>(null);
  const leftCupRef = useRef<THREE.Mesh>(null);
  const rightCupRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (headphonesGroupRef.current) {
      // Very slow luxury rotation and hover float
      headphonesGroupRef.current.rotation.y = time * 0.25;
      headphonesGroupRef.current.position.y = Math.sin(time * 0.8) * 0.12;
      headphonesGroupRef.current.rotation.z = Math.sin(time * 0.4) * 0.05;
    }
    // Subtle ear cup breathing animation
    const scale = 1 + Math.sin(time * 1.5) * 0.02;
    if (leftCupRef.current) leftCupRef.current.scale.set(scale, scale, 1);
    if (rightCupRef.current) rightCupRef.current.scale.set(scale, scale, 1);
  });

  return (
    <group ref={headphonesGroupRef} position={[0, 0, 0]} scale={[0.85, 0.85, 0.85]}>
      {/* Headband (Arc shape using a Torus) */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.55, 0.05, 16, 48, Math.PI]} />
        <meshStandardMaterial
          color="#3e2723" // Dark chocolate brown
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Gold details on headband sides */}
      <mesh position={[-0.55, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial
          color="#d4af37" // Metallic gold
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.55, 0.15, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
        <meshStandardMaterial
          color="#d4af37" // Metallic gold
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Left Earcup group */}
      <group position={[-0.58, -0.15, 0]}>
        {/* Connection metal rod */}
        <mesh position={[0.03, 0.2, 0]} rotation={[0, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Main cup body */}
        <mesh ref={leftCupRef} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 32]} />
          <meshStandardMaterial
            color="#1c1917" // Dark stone charcoal
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Outer Gold ring */}
        <mesh position={[-0.07, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.22, 0.012, 8, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Soft cushion padding */}
        <mesh position={[0.04, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.2, 0.04, 16, 32]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
      </group>

      {/* Right Earcup group */}
      <group position={[0.58, -0.15, 0]}>
        {/* Connection metal rod */}
        <mesh position={[-0.03, 0.2, 0]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Main cup body */}
        <mesh ref={rightCupRef} rotation={[0, -Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.14, 32]} />
          <meshStandardMaterial
            color="#1c1917" // Dark stone charcoal
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        {/* Outer Gold ring */}
        <mesh position={[0.07, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.22, 0.012, 8, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* Soft cushion padding */}
        <mesh position={[-0.04, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <torusGeometry args={[0.2, 0.04, 16, 32]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

// Rotating Premium Circular Platform Component
function RotatingPlatform() {
  const platformRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (platformRef.current) {
      platformRef.current.rotation.y = -time * 0.15;
    }
  });

  return (
    <group position={[0, -0.9, 0]}>
      {/* Main Platform Cylinder */}
      <mesh ref={platformRef} receiveShadow>
        <cylinderGeometry args={[0.85, 0.95, 0.12, 32]} />
        <meshStandardMaterial
          color="#1e120b" // Warm deep chocolate brown
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* Gold Trim Ring around platform */}
      <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.015, 12, 64]} />
        <meshStandardMaterial
          color="#d4af37" // Luxurious gold
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>
    </group>
  );
}

// Volumetric Background Spotlight / Glow
function VolumetricBacklight() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const scale = 1.0 + Math.sin(time * 0.4) * 0.03;
      meshRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1.5]}>
      <planeGeometry args={[3.2, 3.2]} />
      <meshBasicMaterial
        color="#854d0e" // Warm amber/brown backdrop light
        transparent
        opacity={0.16}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Drifting Gold Dust Particles
function DriftingGoldParticles({ count = 20 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positionArray = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const positionAttr = pointsRef.current.geometry.attributes.position;
    if (!positionAttr) return;

    const positions = positionAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = positions[idx];
      const y = positions[idx + 1];

      if (x !== undefined && y !== undefined) {
        const nextY = y + 0.0025;
        const nextX = x + Math.sin(time * 0.35 + i) * 0.001;

        if (nextY > 1.4) {
          positions[idx + 1] = -1.4;
          positions[idx] = (Math.random() - 0.5) * 3.5;
        } else {
          positions[idx] = nextX;
          positions[idx + 1] = nextY;
        }
      }
    }
    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positionArray, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.035}
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 2D Premium Fallback when WebGL is unavailable
function SheikhDigitalStaticFallback() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-3 select-none pointer-events-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 to-transparent blur-3xl rounded-full" />

      {/* 2D Glassmorphic Twin headphone layout */}
      <div className="relative w-[180px] h-[180px] md:w-[220px] md:h-[220px] bg-[#1e120b]/80 rounded-full border border-amber-500/20 flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-md animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-white/5" />

        {/* Headband 2D Arc */}
        <div className="absolute top-[25%] w-[110px] h-[110px] rounded-full border-[8px] border-amber-950 border-b-transparent" />

        {/* Earpad left */}
        <div className="absolute left-[20%] top-[40%] w-[32px] h-[55px] bg-[#1c1917] rounded-xl border-2 border-amber-500/40 shadow-lg flex items-center justify-center">
          <div className="w-2 h-[80%] bg-[#d4af37] rounded-full" />
        </div>

        {/* Earpad right */}
        <div className="absolute right-[20%] top-[40%] w-[32px] h-[55px] bg-[#1c1917] rounded-xl border-2 border-amber-500/40 shadow-lg flex items-center justify-center">
          <div className="w-2 h-[80%] bg-[#d4af37] rounded-full" />
        </div>

        {/* Center Golden Badge */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-400 flex items-center justify-center shadow-md animate-spin" style={{ animationDuration: '12s' }}>
          <span className="text-stone-950 font-black text-xs">SD</span>
        </div>

        {/* Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400 rounded-full animate-ping"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: '2.5s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 3D Loading Fallback Placeholder
function CanvasFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p className="text-amber-200/50 text-[10px] font-vazirmatn">بارگذاری صحنه سه بعدی...</p>
    </div>
  );
}

// Main SheikhDigitalScene Wrapper
export default function SheikhDigitalScene() {
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    setWebGLSupported(isWebGLAvailable());
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 bg-transparent border-2 border-amber-500/10 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <ThreeErrorBoundary fallback={<SheikhDigitalStaticFallback />}>
        {webGLSupported ? (
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              camera={{ position: [0, 0, 2.6], fov: 42 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              className="w-full h-full"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Premium Studio Lights */}
              <ambientLight intensity={0.7} color="#fffbee" />
              <directionalLight position={[1.5, 3, 2]} intensity={1.4} color="#fff5df" castShadow />
              <directionalLight position={[-1.5, 0.5, -1]} intensity={0.3} color="#854d0e" />
              <pointLight position={[0, -0.6, 1.2]} intensity={0.6} color="#fbbf24" />

              {/* Volumetric ambient background glow */}
              <VolumetricBacklight />

              {/* Floating slow gold particles */}
              <DriftingGoldParticles count={25} />

              {/* Floating Headphones and Rotating Platform */}
              <group position={[0, 0.1, 0]}>
                <LuxuryHeadphones />
                <RotatingPlatform />
              </group>

              {/* Performance Adaptability */}
              <AdaptiveDpr pixelated />
              <AdaptiveEvents />
              <Preload all />
            </Canvas>
          </Suspense>
        ) : (
          <SheikhDigitalStaticFallback />
        )}
      </ThreeErrorBoundary>
    </div>
  );
}
