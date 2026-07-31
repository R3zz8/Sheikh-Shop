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
    console.warn('LuxuryFoodBasket 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function LuxuryFoodBasketModel() {
  const groupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Slow float & gentle elegant rotation
      groupRef.current.position.y = Math.sin(time * 0.6) * 0.05;
      groupRef.current.rotation.y = -time * 0.06;

      // Subtle mouse tilt parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.12, 0.08);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.12, 0.08);
    }

    // Soft pulsing breathing glow
    if (glowLightRef.current) {
      glowLightRef.current.intensity = 1.6 + Math.sin(time * 1.5) * 0.4;
    }

    // Gently drift particles
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, idx) => {
        child.position.y = ((idx * 0.15 + time * 0.04) % 0.7) - 0.35;
        child.position.x += Math.cos(time * 0.5 + idx) * 0.0006;
      });
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]} position={[0, -0.05, 0]}>
      {/* Wooden Gourmet Tray */}
      <mesh castShadow receiveShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[0.7, 0.03, 0.5]} />
        <meshStandardMaterial
          color="#3e2723" // Beautiful espresso brown wood
          roughness={0.75}
          metalness={0.1}
        />
      </mesh>

      {/* Tray Premium Gold Corner Trims */}
      <mesh position={[0, -0.1, 0.25]}>
        <boxGeometry args={[0.72, 0.015, 0.012]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.1, -0.25]}>
        <boxGeometry args={[0.72, 0.015, 0.012]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Gourmet Arrangement on Tray */}

      {/* 1. Honey Jar (Left Side of Tray) */}
      <group position={[-0.16, -0.03, -0.06]}>
        {/* Jar Body */}
        <mesh>
          <cylinderGeometry args={[0.07, 0.075, 0.14, 16]} />
          <meshStandardMaterial
            color="#fbbf24" // Warm Honey Amber
            roughness={0.2}
            metalness={0.1}
            transparent={true}
            opacity={0.85}
          />
        </mesh>
        {/* Gold Lid */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.024, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 2. Premium Saffron Jar (Front Right Side of Tray) */}
      <group position={[0.16, -0.03, 0.08]}>
        {/* Clear Glass Jar */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.05}
            metalness={0.9}
            transparent={true}
            opacity={0.4}
          />
        </mesh>
        {/* Crimson Saffron Contents */}
        <mesh position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.044, 0.044, 0.08, 12]} />
          <meshStandardMaterial
            color="#dc2626" // Luxurious Deep Crimson
            emissive="#991b1b"
            emissiveIntensity={0.6}
            roughness={0.5}
          />
        </mesh>
        {/* Dark Cork Lid */}
        <mesh position={[0, 0.065, 0]}>
          <cylinderGeometry args={[0.048, 0.048, 0.018, 12]} />
          <meshStandardMaterial color="#5c4033" roughness={0.9} />
        </mesh>
      </group>

      {/* 3. Olive Oil Bottle (Back Center) */}
      <group position={[0, 0.02, -0.1]}>
        {/* Dark Green Glass Bottle */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.045, 0.24, 12]} />
          <meshStandardMaterial
            color="#065f46" // Premium Olive Green
            roughness={0.15}
            metalness={0.6}
            transparent={true}
            opacity={0.9}
          />
        </mesh>
        {/* Gold Neck Ribbon & Cap */}
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.02, 10]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* 4. Luxury Nuts (Walnuts, Pistachios, Almonds scattered) */}
      {/* Walnuts (creamy brown spheres) */}
      <mesh position={[0.1, -0.08, -0.05]} rotation={[0.4, 0.2, 0.1]}>
        <sphereGeometry args={[0.034, 12, 12]} />
        <meshStandardMaterial color="#a16207" roughness={0.8} />
      </mesh>
      <mesh position={[0.05, -0.08, 0.08]} rotation={[-0.2, 0.5, 0.3]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial color="#854d0e" roughness={0.85} />
      </mesh>

      {/* Pistachios (bright green with tiny purple specks) */}
      <group position={[-0.1, -0.09, 0.1]}>
        <mesh rotation={[0.2, -0.3, 0.5]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#4ade80" roughness={0.7} />
        </mesh>
        {/* outer shell */}
        <mesh position={[0.005, 0, 0.005]} scale={[1.1, 1.1, 0.6]}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.8} />
        </mesh>
      </group>
      <mesh position={[-0.04, -0.09, 0.06]} rotation={[0.5, 0.1, -0.4]}>
        <sphereGeometry args={[0.021, 10, 10]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>

      {/* Almonds (tan elongated teardrops) */}
      <mesh position={[0.18, -0.09, -0.08]} scale={[1, 1.6, 0.7]} rotation={[0.3, 0.7, -0.2]}>
        <sphereGeometry args={[0.023, 10, 10]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} />
      </mesh>
      <mesh position={[-0.18, -0.09, 0.02]} scale={[1, 1.5, 0.7]} rotation={[-0.4, -0.2, 0.6]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial color="#d97706" roughness={0.75} />
      </mesh>

      {/* Natural Herbs & Green Leaves decoration */}
      <group position={[0, -0.08, 0.05]} rotation={[0.1, -0.4, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.002, 0.015]} />
          <meshStandardMaterial color="#15803d" roughness={0.9} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.08, 0.002, 0.015]} />
          <meshStandardMaterial color="#166534" roughness={0.9} />
        </mesh>
      </group>

      {/* Soft Breathing Glow Light */}
      <pointLight ref={glowLightRef} position={[0, 0.15, 0]} intensity={1.8} distance={1.5} color="#fbbf24" />

      {/* Glowing luxury gold particles */}
      <group ref={particlesRef}>
        {[...Array(6)].map((_, idx) => (
          <mesh
            key={`basket-dust-${idx}`}
            position={[
              Math.sin(idx * 2.1) * 0.45,
              idx * 0.12 - 0.35,
              Math.cos(idx * 1.5) * 0.45,
            ]}
          >
            <sphereGeometry args={[0.008 + (idx % 3) * 0.003, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fbbf24"
              emissiveIntensity={1.0}
              transparent={true}
              opacity={0.75}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function LuxuryFoodBasketStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Exquisite gourmet basket SVG illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        {/* Tray Base */}
        <path d="M3 14h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4z" fill="#3e2723" stroke="#d4af37" strokeWidth="1.2" />
        {/* Handles */}
        <path d="M2 13c0-2 1-3 3-3" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M22 13c0-2-1-3-3-3" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" />
        {/* Honey Jar inside */}
        <rect x="5" y="8" width="4" height="6" rx="1" fill="#fbbf24" stroke="#d4af37" strokeWidth="1" />
        <rect x="5.5" y="6.5" width="3" height="1.5" fill="#d4af37" />
        {/* Saffron Jar */}
        <rect x="15" y="9" width="3.5" height="5" rx="0.5" fill="#ffffff" fillOpacity="0.3" stroke="#d4af37" strokeWidth="1" />
        <rect x="15.5" y="10" width="2.5" height="3" fill="#dc2626" />
        {/* Olive Oil Bottle */}
        <rect x="10" y="5" width="4" height="9" rx="1" fill="#065f46" stroke="#d4af37" strokeWidth="1" />
        <line x1="12" y1="5" x2="12" y2="14" stroke="#d4af37" strokeWidth="1" />
        {/* Glowing aura */}
        <circle cx="12" cy="11" r="2" fill="#fef08a" className="animate-ping" style={{ transformOrigin: 'center' }} />
      </svg>
    </div>
  );
}

interface LuxuryFoodBasketDecorationProps {
  className?: string;
}

function LuxuryFoodBasketDecorationComponent({ className }: LuxuryFoodBasketDecorationProps) {
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
        <ThreeErrorBoundary fallback={<LuxuryFoodBasketStaticFallback />}>
          <Suspense fallback={<LuxuryFoodBasketStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.0} />
              <directionalLight position={[1, 2, 1.5]} intensity={1.6} color="#fffbee" />
              <pointLight position={[-1, -1, 1]} intensity={0.6} color="#fbbf24" />
              <LuxuryFoodBasketModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <LuxuryFoodBasketStaticFallback />
      )}
    </div>
  );
}

const LuxuryFoodBasketDecoration = React.memo(LuxuryFoodBasketDecorationComponent);
export default LuxuryFoodBasketDecoration;
