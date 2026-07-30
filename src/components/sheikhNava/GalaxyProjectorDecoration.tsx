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
    console.warn('Galaxy Projector 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GalaxyProjectorModel() {
  const projectorRef = useRef<THREE.Group>(null);
  const lensGlowRef = useRef<THREE.PointLight>(null);
  const galaxyStarsRef = useRef<THREE.Group>(null);

  // Generate randomized star coordinates
  const [stars] = useState(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 1.5,
        ] as [number, number, number],
        speed: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.012 + 0.003,
      });
    }
    return temp;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Elegant slow floating & gentle rotation
    if (projectorRef.current) {
      projectorRef.current.position.y = Math.sin(time * 0.5) * 0.09;
      projectorRef.current.rotation.y = time * 0.12;
      projectorRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
    }

    // Breathing lens lighting
    if (lensGlowRef.current) {
      lensGlowRef.current.intensity = 1.0 + Math.sin(time * 3) * 0.4;
    }

    // Slow orbital rotation of galaxy stars
    if (galaxyStarsRef.current) {
      galaxyStarsRef.current.rotation.y = time * 0.08;
      galaxyStarsRef.current.children.forEach((child, index) => {
        const s = stars[index];
        if (s) {
          const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (material) {
            material.emissiveIntensity = 0.5 + Math.sin(time * s.speed + s.phase) * 0.4;
          }
        }
      });
    }
  });

  return (
    <group>
      {/* Main Galaxy Projector Sphere Body */}
      <group ref={projectorRef} position={[0, -0.1, 0]} scale={[0.9, 0.9, 0.9]}>
        {/* Core Spherical Projector */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.38, 32, 32]} />
          <meshStandardMaterial
            color="#18181a" // High tech graphite dark grey
            roughness={0.25}
            metalness={0.9}
          />
        </mesh>

        {/* Center Golden Orbital Ring */}
        <mesh rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[0.42, 0.02, 16, 48]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Diagonal projector lens barrel */}
        <group position={[0.15, 0.25, 0.15]} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          {/* Lens housing */}
          <mesh>
            <cylinderGeometry args={[0.12, 0.14, 0.15, 16]} />
            <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Gold rim */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.125, 0.125, 0.02, 16]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Glass Lens emitting light */}
          <mesh position={[0, 0.09, 0]}>
            <sphereGeometry args={[0.11, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1.5}
              roughness={0.0}
            />
          </mesh>
          {/* Point light to simulate real projection beam */}
          <pointLight ref={lensGlowRef} position={[0, 0.15, 0]} color="#3b82f6" intensity={1.5} distance={2.5} />
        </group>

        {/* Supporting Base Stand */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 0.06, 24]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* Orbiting Galaxy Stars Group */}
      <group ref={galaxyStarsRef}>
        {stars.map((s, index) => (
          <mesh key={index} position={s.position}>
            <sphereGeometry args={[s.scale, 6, 6]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GalaxyProjectorStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Premium SVG Galaxy Projector Illustration */}
      <svg
        className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="11" r="7" fill="#111" stroke="#d4af37" strokeWidth="2" />
        <ellipse cx="12" cy="11" rx="9" ry="2" stroke="#d4af37" strokeWidth="1.5" style={{ transform: 'rotate(-20deg)', transformOrigin: 'center' }} />
        <circle cx="15" cy="7" r="2.5" fill="#3b82f6" stroke="#d4af37" strokeWidth="1" className="animate-pulse" style={{ transformOrigin: 'center' }} />
        {/* Galaxy stars */}
        <polygon points="5,4 6,5 5,6 4,5" fill="#60a5fa" className="animate-ping" style={{ animationDelay: '0.1s' }} />
        <polygon points="19,5 20,6 19,7 18,6" fill="#60a5fa" className="animate-ping" style={{ animationDelay: '0.9s' }} />
        <polygon points="3,15 4,16 3,17 2,16" fill="#60a5fa" className="animate-ping" style={{ animationDelay: '0.5s' }} />
        <polygon points="21,14 22,15 21,16 20,15" fill="#60a5fa" className="animate-ping" style={{ animationDelay: '1.2s' }} />
      </svg>
    </div>
  );
}

interface GalaxyProjectorDecorationProps {
  className?: string;
}

export default function GalaxyProjectorDecoration({ className }: GalaxyProjectorDecorationProps) {
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
        <ThreeErrorBoundary fallback={<GalaxyProjectorStaticFallback />}>
          <Suspense fallback={<GalaxyProjectorStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[-1, 2, 1.5]} intensity={1.8} color="#fffbee" />
              <pointLight position={[1, -1, 1]} intensity={0.5} color="#fbbf24" />
              <GalaxyProjectorModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <GalaxyProjectorStaticFallback />
      )}
    </div>
  );
}
