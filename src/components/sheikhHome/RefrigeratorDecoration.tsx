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
    console.warn('Refrigerator 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function RefrigeratorModel() {
  const fridgeRef = useRef<THREE.Group>(null);
  const doorPivotRef = useRef<THREE.Group>(null);
  const internalLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Subtle breathing/floating of the entire refrigerator
    if (fridgeRef.current) {
      fridgeRef.current.position.y = Math.sin(time * 0.8) * 0.04;
      fridgeRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
    }

    // Every 10 seconds:
    // Door opens slightly, warm golden light emits, door closes smoothly. Very slow animation.
    const cycle = time % 10;
    let targetAngle = 0;
    let targetLightIntensity = 0;

    if (cycle > 5 && cycle < 6.8) {
      // Opening phase (1.8s)
      const t = (cycle - 5) / 1.8;
      const ease = (1 - Math.cos(t * Math.PI)) / 2; // Smooth sine ease
      targetAngle = ease * -0.55; // Swing door outward slightly (negative Y in our hinge setup)
      targetLightIntensity = ease * 3.5;
    } else if (cycle >= 6.8 && cycle < 8.2) {
      // Stay open phase (1.4s)
      targetAngle = -0.55;
      targetLightIntensity = 3.5;
    } else if (cycle >= 8.2 && cycle < 10) {
      // Closing phase (1.8s)
      const t = (cycle - 8.2) / 1.8;
      const ease = (1 - Math.cos((1 - t) * Math.PI)) / 2;
      targetAngle = ease * -0.55;
      targetLightIntensity = ease * 3.5;
    }

    // Interpolate values smoothly to avoid any frame jumps
    if (doorPivotRef.current) {
      doorPivotRef.current.rotation.y = THREE.MathUtils.lerp(doorPivotRef.current.rotation.y, targetAngle, 0.1);
    }
    if (internalLightRef.current) {
      internalLightRef.current.intensity = THREE.MathUtils.lerp(internalLightRef.current.intensity, targetLightIntensity, 0.1);
    }
  });

  return (
    <group ref={fridgeRef} position={[0, -0.4, 0]} scale={[1.3, 1.3, 1.3]}>
      {/* Main Refrigerator Body Cabinet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.9, 0.3]} />
        <meshStandardMaterial
          color="#111111" // Premium Matte Black
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>

      {/* Gold Trim/Accents around the body cabinet borders */}
      <mesh position={[0, 0, 0.151]}>
        <planeGeometry args={[0.34, 0.88]} />
        <meshStandardMaterial
          color="#d4af37" // Luxurious gold border
          metalness={0.9}
          roughness={0.15}
          wireframe
        />
      </mesh>

      {/* Golden interior shelfs (visible when door opens slightly) */}
      <group position={[0, 0.1, 0.05]}>
        <mesh>
          <boxGeometry args={[0.32, 0.015, 0.2]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
      <group position={[0, -0.15, 0.05]}>
        <mesh>
          <boxGeometry args={[0.32, 0.015, 0.2]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* Warm Golden Emitted Light */}
      <pointLight
        ref={internalLightRef}
        position={[0, 0, 0.1]}
        color="#fbbf24" // Golden Amber
        intensity={0}
        distance={1.5}
        decay={2}
      />

      {/* Refrigerator Door with pivot/hinge on the left-front edge: [-0.18, 0, 0.15] */}
      <group ref={doorPivotRef} position={[-0.18, 0, 0.15]}>
        {/* Door Model itself, offset from pivot so the edge is at the pivot */}
        <group position={[0.18, 0, 0.015]}>
          {/* Main Door Slab */}
          <mesh castShadow>
            <boxGeometry args={[0.36, 0.9, 0.03]} />
            <meshStandardMaterial
              color="#0d0d0d" // Ultra premium Matte Black
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>

          {/* Golden Vertical Door Handle */}
          <group position={[0.14, 0, 0.025]}>
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.5, 16]} />
              <meshStandardMaterial
                color="#d4af37" // Luxurious Gold
                metalness={0.95}
                roughness={0.1}
              />
            </mesh>
            {/* Handle Mount Top */}
            <mesh position={[-0.01, 0.22, -0.01]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.02, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Handle Mount Bottom */}
            <mesh position={[-0.01, -0.22, -0.01]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.006, 0.006, 0.02, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>

          {/* Premium Logo Seal on the Door */}
          <mesh position={[0, 0.3, 0.016]}>
            <planeGeometry args={[0.06, 0.02]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function RefrigeratorStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG Refrigerator Illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="1.5" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <line x1="5" y1="10" x2="19" y2="10" stroke="#d4af37" strokeWidth="1.5" />
        <line x1="15" y1="4" x2="15" y2="8" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="12" x2="15" y2="17" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="6" r="0.5" fill="#d4af37" />
        <circle cx="12" cy="15" r="1.5" stroke="#d4af37" fill="#111" className="animate-pulse" />
      </svg>
    </div>
  );
}

interface RefrigeratorDecorationProps {
  className?: string;
}

export default function RefrigeratorDecoration({ className }: RefrigeratorDecorationProps) {
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
        <ThreeErrorBoundary fallback={<RefrigeratorStaticFallback />}>
          <Suspense fallback={<RefrigeratorStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.0} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={1.9} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.6} color="#fbbf24" />
              <RefrigeratorModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <RefrigeratorStaticFallback />
      )}
    </div>
  );
}
