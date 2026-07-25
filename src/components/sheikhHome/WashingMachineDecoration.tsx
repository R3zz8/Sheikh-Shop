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
    console.warn('Washing machine 3D render failed. Falling back to 2D.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function WashingMachineModel() {
  const machineRef = useRef<THREE.Group>(null);
  const drumRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Gentle float and tilt of the entire body
    if (machineRef.current) {
      machineRef.current.position.y = Math.sin(time * 0.8) * 0.04;
      machineRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
    }

    // Front glass rotates extremely slowly to depict an active gentle deluxe wash cycle
    if (drumRef.current) {
      drumRef.current.rotation.z = time * 0.12; // slow and smooth
    }
  });

  return (
    <group ref={machineRef} position={[0, -0.3, 0]} scale={[1.2, 1.2, 1.2]}>
      {/* Main Washing Machine Outer Cabinet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.45, 0.42]} />
        <meshStandardMaterial
          color="#111111" // Premium Matte Black
          roughness={0.4}
          metalness={0.75}
        />
      </mesh>

      {/* Control Panel Top Accent bar */}
      <mesh position={[0, 0.17, 0.211]}>
        <boxGeometry args={[0.38, 0.07, 0.015]} />
        <meshStandardMaterial
          color="#0a0a0a" // Deep Glossy Black
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Small Gold Control Dial/Button */}
      <mesh position={[-0.1, 0.17, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Small Gold LED Indicator Lights on the panel */}
      <mesh position={[0.08, 0.17, 0.219]}>
        <boxGeometry args={[0.04, 0.008, 0.005]} />
        <meshStandardMaterial color="#fbbf24" emissive="#d4af37" emissiveIntensity={0.8} />
      </mesh>

      {/* Main Front Circular Door Ring (Luxury Industrial Gold Ring) */}
      <group position={[0, -0.04, 0.211]}>
        {/* Outer Gold ring */}
        <mesh>
          <torusGeometry args={[0.13, 0.016, 16, 48]} />
          <meshStandardMaterial
            color="#d4af37" // Luxurious Brushed Gold
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Inner Glass Dome/Drum (Rotating slowly) */}
        <mesh ref={drumRef} position={[0, 0, -0.005]}>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 32]} />
          <meshStandardMaterial
            color="#080808" // Deep obsidian dark translucent glass
            roughness={0.1}
            metalness={0.9}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Dynamic inner metal ribs of the drum (shows rotation) */}
        <mesh position={[0, 0, 0.001]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.18, 0.008, 0.005]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} opacity={0.6} transparent />
        </mesh>

        {/* Soft Golden Glow inside the drum door */}
        <pointLight
          position={[0, 0, -0.05]}
          color="#fbbf24" // Soft gold
          intensity={1.2}
          distance={0.8}
          decay={1.5}
        />
      </group>

      {/* Base Platform / Gold Feet */}
      <group position={[0, -0.23, 0]}>
        <mesh position={[-0.17, -0.01, 0.17]}>
          <cylinderGeometry args={[0.015, 0.018, 0.02, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.17, -0.01, 0.17]}>
          <cylinderGeometry args={[0.015, 0.018, 0.02, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.17, -0.01, -0.17]}>
          <cylinderGeometry args={[0.015, 0.018, 0.02, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.17, -0.01, -0.17]}>
          <cylinderGeometry args={[0.015, 0.018, 0.02, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

function WashingMachineStaticFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-none select-none">
      {/* SVG Washing Machine Illustration */}
      <svg className="w-[70%] h-[70%] max-w-[56px] max-h-[56px] text-amber-500/80 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="3" width="14" height="18" rx="1.5" fill="#1c110a" stroke="#d4af37" strokeWidth="2" />
        <line x1="5" y1="7" x2="19" y2="7" stroke="#d4af37" strokeWidth="1.5" />
        <circle cx="9" cy="5" r="0.75" fill="#d4af37" />
        <circle cx="12" cy="5" r="0.75" fill="#d4af37" />
        <circle cx="15" cy="14" r="4.5" stroke="#d4af37" fill="#111" />
        <circle cx="15" cy="14" r="2.5" stroke="#d4af37" fill="#1c110a" className="animate-spin" style={{ transformOrigin: 'center', animationDuration: '3s' }} />
      </svg>
    </div>
  );
}

interface WashingMachineDecorationProps {
  className?: string;
}

export default function WashingMachineDecoration({ className }: WashingMachineDecorationProps) {
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
        <ThreeErrorBoundary fallback={<WashingMachineStaticFallback />}>
          <Suspense fallback={<WashingMachineStaticFallback />}>
            <Canvas
              camera={{ position: [0, 0, 1.4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              <ambientLight intensity={1.0} />
              <directionalLight position={[1.5, 2.5, 1.8]} intensity={1.9} color="#fffbee" />
              <pointLight position={[-1.2, -1.2, 1.2]} intensity={0.6} color="#fbbf24" />
              <WashingMachineModel />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <WashingMachineStaticFallback />
      )}
    </div>
  );
}
