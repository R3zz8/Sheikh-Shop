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
    console.warn('DateBowl 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function DateBowlModel() {
  const groupRef = useRef<THREE.Group>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  const datesGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (groupRef.current) {
      // Gentle premium floating and extremely slow rotation
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.05;
      groupRef.current.rotation.y = time * 0.08;

      // Subtle mouse tilt parallax
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, pointer.y * 0.15, 0.08);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -pointer.x * 0.15, 0.08);
    }

    // Gentle motion for floating dates
    if (datesGroupRef.current) {
      datesGroupRef.current.children.forEach((child, idx) => {
        child.position.y += Math.sin(time * 0.8 + idx) * 0.0008;
        child.rotation.x += 0.001;
        child.rotation.y += 0.002;
      });
    }

    // Drifting gold dust particles
    if (particleGroupRef.current) {
      particleGroupRef.current.children.forEach((child, idx) => {
        child.position.y = ((idx * 0.12 + time * 0.03) % 0.8) - 0.4;
        child.position.x += Math.sin(time * 0.6 + idx) * 0.0005;
      });
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]} position={[0, -0.1, 0]}>
      {/* Palm Leaves Behind Bowl */}
      <group position={[0, -0.1, -0.2]} rotation={[-0.2, 0.3, 0]}>
        {/* Main stem */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 12]}>
          <cylinderGeometry args={[0.008, 0.012, 0.6, 8]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
        </mesh>
        {/* Palm Leaflets */}
        {[...Array(10)].map((_, idx) => {
          const yPos = 0.05 + idx * 0.04;
          const xOffset = Math.sin(idx * 0.5) * 0.02;
          return (
            <group key={`leaf-${idx}`} position={[xOffset, yPos, 0]}>
              <mesh rotation={[0.1, 0.4, 0.2]}>
                <boxGeometry args={[0.16, 0.002, 0.012]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.65} />
              </mesh>
              <mesh rotation={[-0.1, -0.4, -0.2]}>
                <boxGeometry args={[0.16, 0.002, 0.012]} />
                <meshStandardMaterial color="#2e7d32" roughness={0.65} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Traditional Persian Brass / Gold Bowl */}
      <group position={[0, -0.05, 0]}>
        {/* Outer bowl body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.22, 0.18, 32, 1, true]} />
          <meshStandardMaterial
            color="#d4af37" // Luxurious Gold
            roughness={0.15}
            metalness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Bowl base */}
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial color="#b5942b" roughness={0.2} metalness={0.95} />
        </mesh>

        {/* Elegant top rim */}
        <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.02, 8, 48]} />
          <meshStandardMaterial color="#e5c158" roughness={0.1} metalness={0.95} />
        </mesh>

        {/* Delicate decorative mid-ring pattern */}
        <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.012, 6, 32]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>

      {/* Large Glossy Medjool Dates Inside the Bowl */}
      <group position={[0, 0.03, 0]}>
        {/* Date 1 - Center bottom */}
        <mesh position={[0, -0.02, 0]} rotation={[0.1, 0.5, 0.2]} scale={[1, 1.5, 1]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#2a1205" // Deep Medjool Brown
            roughness={0.15}
            metalness={0.05}
          />
        </mesh>

        {/* Date 2 - Front right */}
        <mesh position={[0.12, -0.01, 0.08]} rotation={[0.3, -0.4, -0.2]} scale={[1.05, 1.45, 1.05]}>
          <sphereGeometry args={[0.068, 16, 16]} />
          <meshStandardMaterial
            color="#1e0a02" // Very Dark Brown
            roughness={0.18}
            metalness={0.05}
          />
        </mesh>

        {/* Date 3 - Back left */}
        <mesh position={[-0.12, -0.01, -0.08]} rotation={[-0.2, 0.8, 0.1]} scale={[0.95, 1.5, 0.95]}>
          <sphereGeometry args={[0.072, 16, 16]} />
          <meshStandardMaterial
            color="#2d150b" // Slightly warmer dark brown
            roughness={0.16}
            metalness={0.05}
          />
        </mesh>

        {/* Date 4 - Stacked top */}
        <mesh position={[-0.02, 0.06, 0.02]} rotation={[0.2, 0.2, -0.4]} scale={[1, 1.4, 1]}>
          <sphereGeometry args={[0.066, 16, 16]} />
          <meshStandardMaterial
            color="#230d04"
            roughness={0.12}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* Floating Dates Around */}
      <group ref={datesGroupRef}>
        {/* Floating Date Left */}
        <mesh position={[-0.55, 0.2, 0.1]} rotation={[0.4, 0.1, -0.5]} scale={[0.85, 1.35, 0.85]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#2d150b" roughness={0.2} metalness={0.05} />
        </mesh>

        {/* Floating Date Right */}
        <mesh position={[0.55, 0.1, -0.1]} rotation={[-0.3, 0.5, 0.4]} scale={[0.8, 1.3, 0.8]}>
          <sphereGeometry args={[0.051, 12, 12]} />
          <meshStandardMaterial color="#1e0a02" roughness={0.22} metalness={0.05} />
        </mesh>
      </group>

      {/* Internal warm glow projecting upwards */}
      <pointLight position={[0, 0.1, 0]} intensity={2.2} distance={1.6} color="#fbbf24" />

      {/* Glowing Gold Dust / Particles */}
      <group ref={particleGroupRef}>
        {[...Array(8)].map((_, idx) => (
          <mesh
            key={`dust-${idx}`}
            position={[
              Math.sin(idx * 1.9) * 0.5,
              idx * 0.1 - 0.4,
              Math.cos(idx * 2.6) * 0.5,
            ]}
          >
            <sphereGeometry args={[0.01 + (idx % 3) * 0.004, 8, 8]} />
            <meshStandardMaterial
              color="#fef08a"
              emissive="#fbbf24"
              emissiveIntensity={1.2}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DateBowlStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Exquisite brass bowl with dates SVG illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        {/* Palm Leaves */}
        <path d="M12 2C9 5 7 10 7 14s2 4 5 4" stroke="#2e7d32" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M12 2C15 5 17 10 17 14s-2 4-5 4" stroke="#2e7d32" strokeWidth="1.2" strokeLinecap="round" />
        {/* Brass Bowl */}
        <path d="M4 12C4 16.5 7.5 19 12 19s8-2.5 8-7H4z" fill="#d4af37" stroke="#b5942b" strokeWidth="1.2" />
        <ellipse cx="12" cy="12" rx="8" ry="1.5" fill="#f59e0b" stroke="#d4af37" strokeWidth="1.2" />
        {/* Dates inside */}
        <ellipse cx="10" cy="11.5" rx="1.8" ry="1.2" fill="#2d150b" />
        <ellipse cx="14" cy="11.5" rx="1.8" ry="1.2" fill="#1e0a02" />
        <ellipse cx="12" cy="10" rx="2" ry="1.3" fill="#230d04" />
        {/* Floating golden spark */}
        <circle cx="5" cy="8" r="0.8" fill="#fef08a" className="animate-ping" style={{ transformOrigin: 'center' }} />
        <circle cx="19" cy="7" r="0.6" fill="#fef08a" className="animate-pulse" style={{ transformOrigin: 'center' }} />
      </svg>
    </div>
  );
}

interface DateBowlDecorationProps {
  className?: string;
}

function DateBowlDecorationComponent({ className }: DateBowlDecorationProps) {
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
        <ThreeErrorBoundary fallback={<DateBowlStaticFallback />}>
          <Suspense fallback={<DateBowlStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.0} />
              <directionalLight position={[-1, 2, 1.5]} intensity={1.6} color="#fffbee" />
              <pointLight position={[1, -1, 1]} intensity={0.6} color="#fbbf24" />
              <DateBowlModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <DateBowlStaticFallback />
      )}
    </div>
  );
}

const DateBowlDecoration = React.memo(DateBowlDecorationComponent);
export default DateBowlDecoration;
