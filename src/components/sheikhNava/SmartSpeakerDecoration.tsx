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
    console.warn('Smart Speaker 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function SmartSpeakerModel() {
  const speakerRef = useRef<THREE.Group>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Group>(null);

  // Generate particle positions
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < 15; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 1.2,
          Math.random() * 1.5 - 0.5,
          (Math.random() - 0.5) * 1.2,
        ] as [number, number, number],
        speed: Math.random() * 0.4 + 0.1,
        offset: Math.random() * Math.PI * 2,
        scale: Math.random() * 0.015 + 0.005,
      });
    }
    return temp;
  });

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Slow floating and elegant gentle rotation
    if (speakerRef.current) {
      speakerRef.current.position.y = Math.sin(time * 0.6) * 0.08;
      speakerRef.current.rotation.y = time * 0.15;
    }

    // Soft pulsing breathing glow on the LED ring
    if (glowRingRef.current) {
      const ringMaterial = glowRingRef.current.material as THREE.MeshStandardMaterial;
      if (ringMaterial) {
        ringMaterial.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.3;
      }
    }

    // Animate tiny floating dust particles
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, index) => {
        const p = particles[index];
        if (p) {
          child.position.y += Math.sin(time * p.speed + p.offset) * 0.002;
          child.rotation.y += 0.01;
        }
      });
    }
  });

  return (
    <group>
      {/* Floating Smart Speaker Group */}
      <group ref={speakerRef} position={[0, -0.2, 0]} scale={[1, 1, 1]}>
        {/* Main Speaker Cylindrical Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.32, 0.8, 32]} />
          <meshStandardMaterial
            color="#141414" // Premium deep graphite black
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Decorative Luxury Gold Bands */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.305, 0.305, 0.02, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.325, 0.325, 0.02, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Gold Front Branded Accent Strip */}
        <mesh position={[0, -0.1, 0.305]}>
          <boxGeometry args={[0.04, 0.3, 0.01]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Dynamic Glowing LED Voice Ring on Top */}
        <mesh ref={glowRingRef} position={[0, 0.405, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.015, 16, 32]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#d4af37"
            emissiveIntensity={0.6}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>

        {/* Top Metallic Control Glass / Dial */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.01, 32]} />
          <meshStandardMaterial color="#080808" roughness={0.05} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.41, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Soft bottom sound-reflective base */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.22, 0.26, 0.04, 32]} />
          <meshStandardMaterial color="#080808" roughness={0.5} metalness={0.7} />
        </mesh>
      </group>

      {/* Floating Dust / Gold Particles Group */}
      <group ref={particlesRef}>
        {particles.map((p, index) => (
          <mesh key={index} position={p.position}>
            <sphereGeometry args={[p.scale, 8, 8]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d4af37"
              emissiveIntensity={0.8}
              roughness={0.1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SmartSpeakerStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* Premium SVG Smart Speaker Illustration */}
      <svg
        className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="6" y="2" width="12" height="20" rx="3" fill="#111" stroke="#d4af37" strokeWidth="2" />
        <line x1="8" y1="6" x2="16" y2="6" stroke="#d4af37" strokeWidth="1" />
        <line x1="8" y1="8" x2="16" y2="8" stroke="#d4af37" strokeWidth="1" />
        <circle cx="12" cy="15" r="3.5" stroke="#d4af37" strokeWidth="1.5" fill="#1e120b" className="animate-pulse" style={{ transformOrigin: 'center' }} />
        <circle cx="12" cy="15" r="1.5" fill="#d4af37" />
        {/* Floating sparkles */}
        <circle cx="5" cy="5" r="0.7" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.2s' }} />
        <circle cx="19" cy="9" r="0.8" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.8s' }} />
        <circle cx="4" cy="16" r="0.6" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '1.4s' }} />
      </svg>
    </div>
  );
}

interface SmartSpeakerDecorationProps {
  className?: string;
}

export default function SmartSpeakerDecoration({ className }: SmartSpeakerDecorationProps) {
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
        <ThreeErrorBoundary fallback={<SmartSpeakerStaticFallback />}>
          <Suspense fallback={<SmartSpeakerStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.1} />
              <directionalLight position={[1, 2, 1.5]} intensity={1.8} color="#fffbee" />
              <pointLight position={[-1, -1, 1]} intensity={0.5} color="#fbbf24" />
              <SmartSpeakerModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <SmartSpeakerStaticFallback />
      )}
    </div>
  );
}
