'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Eye,
  Sparkles,
  Music,
  Droplet,
  Flame,
  Cpu,
  Shield,
  Percent,
  CheckCircle,
  Award
} from 'lucide-react';
import { formatToToman } from '@/lib/currency';

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
// Three.js Error Boundary
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
    console.warn('R3F showcase canvas error. Falling back gracefully to premium 2D design.', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ==========================================
// 3D MODELS USING PROCEDURAL PRIMITIVES
// ==========================================

// PUSHER SHEIKH (LEFT SIDE)
interface PusherSheikhProps {
  isPushing: boolean;
}

function PusherSheikh({ isPushing }: PusherSheikhProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating idle breathing
      groupRef.current.position.y = -0.7 + Math.sin(time * 1.5) * 0.025;
      groupRef.current.rotation.y = -Math.PI / 4 + Math.sin(time * 0.4) * 0.03;
    }

    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 1.5) * 0.015;
      headRef.current.rotation.y = Math.cos(time * 0.8) * 0.04;
    }

    // Arm push animation
    if (leftArmRef.current) {
      let targetRotX = 0.1;
      let targetRotY = 0.2;
      let targetRotZ = -0.4;

      if (isPushing) {
        // High energy arm sweep extension to push the products
        targetRotX = -0.8;
        targetRotY = -0.6;
        targetRotZ = 0.5;
      }

      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetRotX, 0.18);
      leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, targetRotY, 0.18);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, targetRotZ, 0.18);
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
      {/* Head Group */}
      <group ref={headRef} position={[0, 0.72, 0]}>
        {/* Face */}
        <mesh>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#fffbee" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Beard */}
        <mesh position={[0, -0.1, 0.14]}>
          <boxGeometry args={[0.16, 0.09, 0.16]} />
          <meshStandardMaterial color="#1f1815" roughness={0.8} />
        </mesh>
        {/* Keffiyeh White Cover */}
        <mesh position={[0, 0.07, -0.02]}>
          <sphereGeometry args={[0.235, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        {/* Keffiyeh Draping */}
        <mesh position={[0, -0.28, -0.04]}>
          <cylinderGeometry args={[0.235, 0.36, 0.65, 16, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        {/* Agal rings */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.015, 8, 64]} />
          <meshStandardMaterial color="#090909" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.15, 0.01]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
          <torusGeometry args={[0.184, 0.011, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Thobe Body (Kandura) */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.19, 0.38, 1.15, 32]} />
        <meshStandardMaterial color="#fffdf8" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Gold Embroidery Detail */}
      <mesh position={[0, 0.28, 0.201]}>
        <boxGeometry args={[0.02, 0.24, 0.01]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Dark Bisht Cloak */}
      <mesh position={[0, -0.15, -0.05]}>
        <cylinderGeometry args={[0.23, 0.42, 1.1, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#1a130e" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Left Arm Group (Pushing Arm) */}
      <group ref={leftArmRef} position={[-0.24, 0.32, 0.05]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a130e" roughness={0.5} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.15, 0.05]} rotation={[Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.032, 0.28, 16]} />
          <meshStandardMaterial color="#fffdf8" roughness={0.3} />
        </mesh>
        {/* Luxury Shopping Gloves / Golden Hand */}
        <mesh position={[0, -0.28, 0.11]}>
          <boxGeometry args={[0.05, 0.07, 0.02]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.2} /> {/* Dark Amber Leather Glove */}
        </mesh>
        {/* Gold Details on glove cuff */}
        <mesh position={[0, -0.24, 0.09]}>
          <torusGeometry args={[0.032, 0.007, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Right Arm Group (Steady/Resting) */}
      <group position={[0.24, 0.32, 0.05]} rotation={[0.1, -0.1, -0.15]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a130e" roughness={0.5} />
        </mesh>
        {/* Rest of the arm draped */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.038, 0.3, 16]} />
          <meshStandardMaterial color="#fffdf8" roughness={0.3} />
        </mesh>
      </group>

      {/* Leather Sandals (Base) */}
      <mesh position={[-0.09, -0.7, 0.1]}>
        <boxGeometry args={[0.07, 0.03, 0.18]} />
        <meshStandardMaterial color="#3e2723" roughness={0.7} />
      </mesh>
      <mesh position={[0.09, -0.7, 0.1]}>
        <boxGeometry args={[0.07, 0.03, 0.18]} />
        <meshStandardMaterial color="#3e2723" roughness={0.7} />
      </mesh>
    </group>
  );
}

// RECEIVER SHEIKH (RIGHT SIDE)
interface ReceiverSheikhProps {
  isReceiving: boolean;
}

function ReceiverSheikh({ isReceiving }: ReceiverSheikhProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle breathing
      groupRef.current.position.y = -0.7 + Math.sin(time * 1.5) * 0.025;
      groupRef.current.rotation.y = Math.PI / 4 - Math.sin(time * 0.4) * 0.03;
    }

    // Receiver React animation (Smile nod)
    let targetHeadRotX = Math.sin(time * 1.5) * 0.015;
    if (isReceiving) {
      targetHeadRotX = 0.28 + Math.sin(time * 8.0) * 0.03; // Warm nod
    }
    if (headRef.current) {
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetHeadRotX, 0.12);
      headRef.current.rotation.y = Math.sin(time * 0.6) * 0.03;
    }

    // Arm receiving welcoming gesture
    if (rightArmRef.current) {
      let targetRotX = -0.1;
      let targetRotY = -0.2;
      let targetRotZ = 0.3;

      if (isReceiving) {
        // Open welcoming arm extension
        targetRotX = -0.5;
        targetRotY = 0.4;
        targetRotZ = -0.2;
      }

      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetRotX, 0.15);
      rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, targetRotY, 0.15);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, targetRotZ, 0.15);
    }
  });

  return (
    <group ref={groupRef} scale={[0.85, 0.85, 0.85]}>
      {/* Head Group */}
      <group ref={headRef} position={[0, 0.72, 0]}>
        {/* Face */}
        <mesh>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial color="#fffbee" roughness={0.2} metalness={0.05} />
        </mesh>
        {/* Beard */}
        <mesh position={[0, -0.1, 0.14]}>
          <boxGeometry args={[0.16, 0.09, 0.16]} />
          <meshStandardMaterial color="#1f1815" roughness={0.8} />
        </mesh>
        {/* Keffiyeh */}
        <mesh position={[0, 0.07, -0.02]}>
          <sphereGeometry args={[0.235, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.28, -0.04]}>
          <cylinderGeometry args={[0.235, 0.36, 0.65, 16, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} />
        </mesh>
        {/* Agal */}
        <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.015, 8, 64]} />
          <meshStandardMaterial color="#090909" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.15, 0.01]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
          <torusGeometry args={[0.184, 0.011, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Thobe */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.19, 0.38, 1.15, 32]} />
        <meshStandardMaterial color="#fffdf8" roughness={0.3} metalness={0.05} />
      </mesh>

      {/* Embroideries */}
      <mesh position={[0, 0.28, 0.201]}>
        <boxGeometry args={[0.02, 0.24, 0.01]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Cloak */}
      <mesh position={[0, -0.15, -0.05]}>
        <cylinderGeometry args={[0.23, 0.42, 1.1, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#1a130e" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Right Arm Group (Welcoming / Receiving) */}
      <group ref={rightArmRef} position={[0.24, 0.32, 0.05]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a130e" roughness={0.5} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.15, 0.05]} rotation={[-Math.PI / 6, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.032, 0.28, 16]} />
          <meshStandardMaterial color="#fffdf8" roughness={0.3} />
        </mesh>
        {/* Leather glove / Hand */}
        <mesh position={[0, -0.28, 0.11]}>
          <boxGeometry args={[0.05, 0.07, 0.02]} />
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.24, 0.09]}>
          <torusGeometry args={[0.032, 0.007, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
      </group>

      {/* Left Arm Group (Resting) */}
      <group position={[-0.24, 0.32, 0.05]} rotation={[0.1, 0.1, 0.15]}>
        {/* Shoulder */}
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1a130e" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.04, 0.038, 0.3, 16]} />
          <meshStandardMaterial color="#fffdf8" roughness={0.3} />
        </mesh>
      </group>

      {/* Sandals */}
      <mesh position={[-0.09, -0.7, 0.1]}>
        <boxGeometry args={[0.07, 0.03, 0.18]} />
        <meshStandardMaterial color="#3e2723" roughness={0.7} />
      </mesh>
      <mesh position={[0.09, -0.7, 0.1]}>
        <boxGeometry args={[0.07, 0.03, 0.18]} />
        <meshStandardMaterial color="#3e2723" roughness={0.7} />
      </mesh>
    </group>
  );
}

// 3D Particles
function AmbientGoldParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 30;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position;
    if (!posAttr) return;

    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = arr[idx];
      const y = arr[idx + 1];
      if (x !== undefined && y !== undefined) {
        const nextY = y + 0.003;
        arr[idx + 1] = nextY;
        arr[idx] = x + Math.sin(time * 0.5 + i) * 0.0015;

        if (nextY > 1.8) {
          arr[idx + 1] = -1.8;
          arr[idx] = (Math.random() - 0.5) * 4;
        }
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f59e0b"
        size={0.035}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ==========================================
// 2D STYLIZED FALLBACK MASCOTS
// ==========================================
function StaticSheikhFallback({ align }: { align: 'left' | 'right' }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end p-2 relative select-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 to-transparent blur-xl" />
      <div className="w-[80px] h-[160px] md:w-[130px] md:h-[260px] bg-stone-900/90 rounded-3xl border border-amber-500/20 shadow-2xl flex flex-col items-center justify-end p-3 relative overflow-hidden">
        {/* Gold backlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />

        {/* Head */}
        <div className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full bg-white relative mb-2 flex items-center justify-center shadow-lg">
          <div className="absolute bottom-0 w-[80%] h-[40%] bg-stone-950 rounded-b-full" />
          <div className="absolute -top-1 w-[90%] h-1.5 md:h-2.5 border-t-[3px] border-amber-500 rounded-t-full" />
          <div className="absolute bottom-[20%] w-[35%] h-[10%] bg-amber-200/50 rounded-full" />
        </div>

        {/* Thobe & Bisht */}
        <div className="w-[90%] h-[60%] bg-stone-950/80 rounded-t-3xl border-t border-amber-400/20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 md:w-1 h-full bg-gradient-to-b from-amber-400 via-yellow-300 to-transparent" />
          {/* Subtle responsive arms */}
          <div className={`absolute top-2 w-3 h-12 bg-stone-900 rounded-full border-t border-amber-500/10 ${align === 'left' ? 'left-[-4px] animate-bounce' : 'right-[-4px]'}`} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EXQUISITE CATEGORY EFFECT GRAPHICS
// ==========================================
function CategoryVisualEffect({ effect }: { effect: string }) {
  const norm = effect.toUpperCase();

  // 1. Concentric Soundwaves (SPEAKER)
  if (norm === 'SPEAKER') {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="absolute w-[180%] h-[180%] rounded-full border border-amber-500/10 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
        <div className="absolute w-[140%] h-[140%] rounded-full border border-yellow-500/10 animate-ping opacity-25" style={{ animationDuration: '4.5s' }} />
        <div className="absolute w-[100%] h-[100%] rounded-full border border-orange-500/10 animate-ping opacity-20" style={{ animationDuration: '6s' }} />
      </div>
    );
  }

  // 2. Music Particles (HEADPHONES)
  if (norm === 'HEADPHONES') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 animate-bounce text-amber-500/40 text-[20px] duration-1000"><Music /></div>
        <div className="absolute bottom-1/4 left-1/4 animate-bounce text-yellow-500/30 text-[24px] duration-[1500ms]"><Sparkles /></div>
        <div className="absolute top-1/3 left-1/5 animate-ping text-orange-400/20 text-[16px]" style={{ animationDuration: '5s' }}><Music /></div>
      </div>
    );
  }

  // 3. Honey Droplets (HONEY)
  if (norm === 'HONEY') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-between p-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 bg-gradient-to-b from-amber-400 to-yellow-600 rounded-full blur-[0.5px] opacity-45 animate-bounce"
            style={{
              alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end',
              animationDuration: `${1.5 + i * 0.5}s`,
              transform: `translateY(${i * 12}px)`,
            }}
          />
        ))}
      </div>
    );
  }

  // 4. Palm Leaf Particles (DATES)
  if (norm === 'DATES') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-full bg-gradient-radial from-amber-500/5 via-transparent to-transparent scale-150 animate-pulse duration-[3s]" />
        {/* Stylized flying shapes */}
        <div className="absolute top-10 right-10 w-2 h-8 bg-green-800/10 rounded-full rotate-45 animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-12 left-10 w-3 h-10 bg-amber-800/10 rounded-full -rotate-12 animate-spin" style={{ animationDuration: '14s' }} />
      </div>
    );
  }

  // 5. Saffron Dust Shimmer (SAFFRON)
  if (norm === 'SAFFRON') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/3 via-transparent to-transparent animate-pulse duration-[4s]" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-red-400 rounded-full animate-ping opacity-60"
            style={{
              top: `${20 + i * 15}%`,
              left: `${15 + (i * 17) % 70}%`,
              animationDuration: `${2.2 + i * 0.6}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // 6. Perfume Golden Mist (PERFUME)
  if (norm === 'PERFUME') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute w-[130%] h-[130%] bg-gradient-radial from-amber-500/10 via-transparent to-transparent rounded-full animate-pulse scale-110" style={{ animationDuration: '5s' }} />
        <div className="absolute w-[80%] h-[80%] bg-gradient-radial from-yellow-500/8 via-transparent to-transparent rounded-full animate-pulse scale-90" style={{ animationDuration: '3.5s' }} />
      </div>
    );
  }

  // 7. Neon Amber Circuits (DIGITAL)
  if (norm === 'DIGITAL') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        <div className="absolute inset-y-0 left-1/3 w-px bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
    );
  }

  // Default Soft warm glow bokeh (LIGHTING or others)
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3.5s' }} />
      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-orange-400/5 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s' }} />
    </div>
  );
}

// ==========================================
// MAIN CLASSIC ROYAL SHOWCASE SYSTEM
// ==========================================
interface ProductWithMetadata {
  id: string;
  name: string;
  category: string;
  categoryType: string;
  basePrice: number;
  description?: string;
  images?: Array<{ secureUrl?: string; image?: string }>;
  badgeType?: string;
  categoryEffect?: string;
  ctaText?: string;
  ctaLink?: string;
  slug?: string;
}

const DEFAULT_PRODUCTS: ProductWithMetadata[] = [
  {
    id: 'pd_speaker_1',
    name: 'اسپیکر ایستاده شیخ مدل Luxury X9',
    category: 'OTHERS',
    categoryType: 'SheikhDigital',
    basePrice: 18900000,
    images: [{ secureUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop' }],
    badgeType: 'BEST_SELLER',
    categoryEffect: 'SPEAKER',
    ctaText: 'مشاهده اسپیکر ایستاده',
    ctaLink: '/products/luxury-x9-speaker'
  },
  {
    id: 'pd_speaker_2',
    name: 'اسپیکر هوشمند شیخ مدل Royal Sound Pro',
    category: 'OTHERS',
    categoryType: 'SheikhDigital',
    basePrice: 24500000,
    images: [{ secureUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop' }],
    badgeType: 'FEATURED',
    categoryEffect: 'SPEAKER',
    ctaText: 'مشاهده اسپیکر هوشمند',
    ctaLink: '/products/royal-sound-pro-speaker'
  },
  {
    id: 'pd_headphones',
    name: 'هدفون بی‌سیم لوکس شیخ مدل Golden Scent',
    category: 'OTHERS',
    categoryType: 'SheikhDigital',
    basePrice: 14200000,
    images: [{ secureUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop' }],
    badgeType: 'NEW',
    categoryEffect: 'HEADPHONES',
    ctaText: 'خرید هدفون بی‌سیم',
    ctaLink: '/products/golden-scent-headphones'
  },
  {
    id: 'pd_smartwatch',
    name: 'ساعت هوشمند سلطنتی شیخ مدل Royal Watch V2',
    category: 'OTHERS',
    categoryType: 'SheikhDigital',
    basePrice: 32800000,
    images: [{ secureUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop' }],
    badgeType: 'FEATURED',
    categoryEffect: 'LIGHTING',
    ctaText: 'خرید ساعت هوشمند',
    ctaLink: '/products/royal-watch-v2'
  },
  {
    id: 'p1',
    name: 'عسل طبیعی کوهستان ممتاز شیخ',
    category: 'HONEY',
    categoryType: 'SheikhFood',
    basePrice: 1250000,
    images: [{ secureUrl: '/honey.webp' }],
    badgeType: 'BEST_SELLER',
    categoryEffect: 'HONEY',
    ctaText: 'خرید عسل طبیعی',
    ctaLink: '/products/p1'
  },
  {
    id: 'p2',
    name: 'زعفران سوپر نگین خراسان ممتاز',
    category: 'SAFFRON',
    categoryType: 'SheikhFood',
    basePrice: 4250000,
    images: [{ secureUrl: '/saffron.webp' }],
    badgeType: 'NEW',
    categoryEffect: 'SAFFRON',
    ctaText: 'خرید زعفران سوپر نگین',
    ctaLink: '/products/p2'
  },
  {
    id: 'p3',
    name: 'خرمای مجول ممتاز صادراتی شیخ',
    category: 'DATES',
    categoryType: 'SheikhFood',
    basePrice: 890000,
    images: [{ secureUrl: '/dates.webp' }],
    badgeType: 'BEST_SELLER',
    categoryEffect: 'DATES',
    ctaText: 'خرید خرما مجول',
    ctaLink: '/products/p3'
  }
];

export default function RoyalShowcase() {
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.05,
    rootMargin: '200px 0px',
    triggerOnce: false,
  });

  // States
  const [config, setConfig] = useState({
    isEnabled: true,
    loopMode: true,
    autoplayInterval: 5000,
    animationSpeed: 1000,
    backgroundGlow: '#fbbf24',
    maxProducts: 8,
  });

  const [products, setProducts] = useState<ProductWithMetadata[]>(DEFAULT_PRODUCTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: prev, 1: next

  // Mascot gesture triggers
  const [isPushing, setIsPushing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  // Tilt coordinates
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Autoplay timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setWebGLSupported(isWebGLAvailable());

    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Fetch config & products
    const fetchShowcaseData = async () => {
      try {
        const res = await fetch('/api/admin/showcase-config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
          if (Array.isArray(data.featuredProducts) && data.featuredProducts.length > 0) {
            // Map detailed product details from allProducts
            const all = data.allProducts || [];
            const mapped = data.featuredProducts.map((fp: any) => {
              const baseProd = all.find((p: any) => p.id === fp.productId);
              return {
                id: fp.productId,
                name: baseProd?.name || 'محصول ویژه شیخ',
                category: baseProd?.category || 'HONEY',
                categoryType: baseProd?.categoryType || 'SheikhFood',
                basePrice: baseProd?.basePrice || 0,
                images: baseProd?.images || [],
                badgeType: fp.badgeType,
                categoryEffect: fp.categoryEffect,
                ctaText: fp.ctaText,
                ctaLink: fp.ctaLink || `/products/${baseProd?.slug || fp.productId}`,
                slug: baseProd?.slug,
              };
            });
            setProducts(mapped);
          } else {
            // Fallback to mock catalog products if empty
            const all = data.allProducts || [];
            const mockFeatured = [
              { id: 'pd_speaker_1', badgeType: 'BEST_SELLER', categoryEffect: 'SPEAKER', ctaText: 'مشاهده اسپیکر' },
              { id: 'pd_speaker_2', badgeType: 'FEATURED', categoryEffect: 'SPEAKER', ctaText: 'مشاهده هوشمند' },
              { id: 'pd_headphones', badgeType: 'NEW', categoryEffect: 'HEADPHONES', ctaText: 'خرید بی‌سیم' },
              { id: 'pd_smartwatch', badgeType: 'FEATURED', categoryEffect: 'LIGHTING', ctaText: 'خرید ساعت' },
              { id: 'p1', badgeType: 'BEST_SELLER', categoryEffect: 'HONEY', ctaText: 'خرید عسل' },
              { id: 'p2', badgeType: 'NEW', categoryEffect: 'SAFFRON', ctaText: 'خرید زعفران' },
              { id: 'p3', badgeType: 'BEST_SELLER', categoryEffect: 'DATES', ctaText: 'خرید خرما' },
            ].map(f => {
              const baseProd = all.find((p: any) => p.id === f.id);
              return {
                id: f.id,
                name: baseProd?.name || 'محصول ویژه',
                category: baseProd?.category || 'HONEY',
                categoryType: baseProd?.categoryType || 'SheikhFood',
                basePrice: baseProd?.basePrice || 1200000,
                images: baseProd?.images || [],
                badgeType: f.badgeType,
                categoryEffect: f.categoryEffect,
                ctaText: f.ctaText,
                ctaLink: `/products/${baseProd?.slug || f.id}`,
                slug: baseProd?.slug,
              };
            });
            setProducts(mockFeatured);
          }
        }
      } catch (error) {
        console.error('Error in RoyalShowcase mount:', error);
      }
    };

    fetchShowcaseData();
  }, []);

  // Setup autoplay loop
  useEffect(() => {
    if (!config.isEnabled || products.length <= 1) return;

    const interval = config.autoplayInterval || 5000;

    const runAutoplay = () => {
      timerRef.current = setInterval(() => {
        handleNext();
      }, interval);
    };

    runAutoplay();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [config, products, activeIndex]);

  const handleNext = () => {
    if (products.length <= 1) return;
    setDirection(1);

    // Trigger Left Sheikh mascot "Push" gesture
    setIsPushing(true);
    setTimeout(() => setIsPushing(false), 800);

    // Trigger Right Sheikh mascot "Receive" gesture on delay
    setTimeout(() => {
      setIsReceiving(true);
      setTimeout(() => setIsReceiving(false), 900);
    }, 450);

    setActiveIndex((prev) => {
      if (prev === products.length - 1) {
        return config.loopMode ? 0 : prev;
      }
      return prev + 1;
    });
  };

  const handlePrev = () => {
    if (products.length <= 1) return;
    setDirection(-1);

    // Subtle reversed gestures
    setIsReceiving(true);
    setTimeout(() => setIsReceiving(false), 700);

    setActiveIndex((prev) => {
      if (prev === 0) {
        return config.loopMode ? products.length - 1 : prev;
      }
      return prev - 1;
    });
  };

  // Add To Cart operation
  const handleAddToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (res.ok) {
        toast.success('محصول با موفقیت به سبد خرید اضافه شد');
      } else {
        toast.error('خطا در اضافه کردن محصول به سبد خرید');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور جهت اضافه کردن به سبد خرید');
    }
  };

  // Parallax mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 15, y: y * -15 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!mounted) {
    return (
      <section className="container-fluid py-8 max-w-7xl mx-auto select-none">
        <div className="w-full h-[400px] bg-stone-950/40 rounded-[2.5rem] border border-amber-500/10 animate-pulse" />
      </section>
    );
  }

  if (!config.isEnabled || products.length === 0) {
    return null;
  }

  const activeProduct = products[activeIndex];

  // Map premium badges
  const getBadgeElement = (badgeType?: string) => {
    const type = badgeType?.toUpperCase() || 'BEST_SELLER';
    if (type === 'NEW') {
      return (
        <span className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          جدید
        </span>
      );
    }
    if (type === 'DISCOUNT') {
      return (
        <span className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/30 text-rose-200 px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-inner">
          <Percent className="w-3.5 h-3.5 text-rose-400" />
          پیشنهاد ویژه
        </span>
      );
    }
    if (type === 'FEATURED') {
      return (
        <span className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-200 px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-inner">
          <Award className="w-3.5 h-3.5 text-cyan-400" />
          پیشنهاد شیخ
        </span>
      );
    }
    // Default BEST_SELLER
    return (
      <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-amber-400/35 text-amber-200 px-3 py-1 rounded-full text-[11px] font-black tracking-wider shadow-inner">
        <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
        پرفروش‌ترین
      </span>
    );
  };

  // Safe Image resolver
  const getProductImage = (prod?: ProductWithMetadata) => {
    if (prod?.images && prod.images.length > 0) {
      const firstImg = prod.images[0];
      if (firstImg) {
        return firstImg.secureUrl || firstImg.image || '/placeholder.webp';
      }
    }
    return '/placeholder.webp';
  };

  return (
    <section ref={sectionRef} className="container-fluid py-10 sm:py-14 md:py-18 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden relative z-20">
      {/* Upper header */}
      <div className="text-center mb-8 sm:mb-12 relative z-10 flex flex-col items-center">
        <h2 className="text-[20px] sm:text-[28px] md:text-[34px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 font-vazirmatn mb-3">
          ⭐ پرفروش‌ترین محصولات فروشگاه شیخ
        </h2>
        {/* Luxury golden divider */}
        <div className="w-[180px] h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rotate-45 border border-amber-950" />
        </div>
      </div>

      {/* LUXURY ROYAL STAGE STAGING WRAPPER */}
      <div
        className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-amber-950/85 via-stone-900/95 to-amber-950/90 border border-amber-500/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-4 md:p-8 overflow-hidden"
        style={{
          boxShadow: `0 25px 60px rgba(0,0,0,0.9), 0 0 80px ${config.backgroundGlow}12`
        }}
      >
        {/* Stage background glow */}
        <div
          className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-transparent to-transparent pointer-events-none transition-all duration-1000 z-0"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${config.backgroundGlow}08 0%, transparent 70%)`
          }}
        />

        {/*
          RTL ROW WRAPPER: Left Sheikh, Center Slider Showcase, Right Sheikh
          This row will NEVER stack, scaling perfectly proportionally on screens down to 320px
        */}
        <div
          className="flex flex-row items-center justify-between w-full h-[clamp(210px,46vw,560px)] relative z-10"
          style={{ direction: 'rtl' }}
        >
          {/*
            LEFT COLUMN: Pushing Sheikh
            22% proportional width
          */}
          <div className="w-[22%] h-full relative overflow-hidden flex items-center justify-center">
            {webGLSupported && inView && !isMobile ? (
              <div className="w-full h-full pointer-events-auto relative overflow-hidden">
                <ThreeErrorBoundary fallback={<StaticSheikhFallback align="left" />}>
                  <Suspense fallback={<StaticSheikhFallback align="left" />}>
                    <Canvas
                      camera={{ position: [0, 0, 2.5], fov: 42 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      <ambientLight intensity={1.1} color="#fffbee" />
                      <directionalLight position={[-1, 3, 2]} intensity={1.5} color="#fff1d0" />
                      <directionalLight position={[1, 1, -1]} intensity={0.3} color="#d97706" />
                      <pointLight position={[0, -0.6, 1]} intensity={0.5} color="#ea580c" />
                      <AmbientGoldParticles />
                      <PusherSheikh isPushing={isPushing} />
                    </Canvas>
                  </Suspense>
                </ThreeErrorBoundary>
              </div>
            ) : (
              <StaticSheikhFallback align="left" />
            )}
          </div>

          {/*
            CENTER COLUMN: LUXURY GLASS SHOWCASE SLIDER
            54% proportional width
          */}
          <div className="w-[54%] h-full flex items-center justify-center relative px-1 sm:px-2">
            {/* Dynamic visual category background effects */}
            {activeProduct && (
              <CategoryVisualEffect effect={activeProduct.categoryEffect || activeProduct.category} />
            )}

            {/* Showcase Stage Frame */}
            <div className="absolute inset-0 border border-amber-500/5 rounded-[2rem] bg-stone-950/20 backdrop-blur-[3px] pointer-events-none" />

            <AnimatePresence mode="wait" custom={direction}>
              {activeProduct && (
                <motion.div
                  key={activeProduct.id}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    scale: 0.85,
                    rotateY: direction > 0 ? 30 : -30,
                    filter: 'blur(10px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    filter: 'blur(0px)',
                    transition: {
                      type: 'spring',
                      stiffness: 140,
                      damping: 18,
                      mass: 0.9,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    rotateY: direction > 0 ? -35 : 35,
                    filter: 'blur(12px)',
                    transition: { duration: 0.45 },
                  }}
                  className="w-full max-w-[420px] h-[92%] relative"
                >
                  <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                      transition: 'transform 0.15s ease-out',
                    }}
                    className="w-full h-full bg-gradient-to-br from-stone-950/80 to-stone-900/60 border border-amber-400/25 hover:border-amber-400/40 rounded-[1.8rem] sm:rounded-[2.2rem] shadow-[0_20px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_55px_rgba(245,158,11,0.12)] p-2 sm:p-4 md:p-6 text-center relative overflow-hidden flex flex-col justify-between backdrop-blur-2xl"
                  >
                    {/* Subtle Light Sweep Animation across Card */}
                    <motion.div
                      initial={{ left: '-150%' }}
                      animate={{ left: '200%' }}
                      transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.2 }}
                      className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent skew-x-12 pointer-events-none z-10"
                    />

                    {/* Header Elements: Badge & Dynamic Category Icon */}
                    <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                      {getBadgeElement(activeProduct.badgeType)}
                      <span className="text-amber-400 text-[11px] sm:text-xs font-bold font-vazirmatn">
                        {activeProduct.categoryType === 'SheikhDigital' ? 'دیجیتال لوکس' : activeProduct.categoryType === 'SheikhHome' ? 'لوازم خانگی لوکس' : 'اکوسیستم ممتاز'}
                      </span>
                    </div>

                    {/* Product Interactive Display (Scaled Image) */}
                    <div className="relative w-full h-[36%] min-h-[70px] sm:min-h-[120px] md:min-h-[160px] flex items-center justify-center my-1 sm:my-2">
                      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 to-transparent blur-xl" />
                      <motion.img
                        initial={{ scale: 0.9, y: 5 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 12 }}
                        src={getProductImage(activeProduct)}
                        alt={activeProduct.name}
                        className="max-h-full max-w-[85%] object-contain rounded-2xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.65)] hover:scale-105 duration-300"
                      />
                    </div>

                    {/* Text Description Block */}
                    <div className="text-right flex flex-col justify-center px-1">
                      <h3 className="text-[12px] sm:text-[16px] md:text-[18px] lg:text-[20px] font-black text-amber-5 leading-tight tracking-tight mb-1 truncate font-vazirmatn">
                        {activeProduct.name}
                      </h3>

                      {/* Responsive rating stars */}
                      <div className="flex items-center gap-0.5 mb-1.5 justify-start">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-[8px] h-[8px] sm:w-[12px] sm:h-[12px] text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-[8px] sm:text-[11px] text-gray-400 mr-1.5 font-vazirmatn">۵.۰ (امتیاز ویژه)</span>
                      </div>

                      {/* Persian native Toman price */}
                      <div className="flex items-baseline gap-1 mt-1 justify-start">
                        <span className="text-[12px] sm:text-[18px] md:text-[22px] font-black text-amber-400 font-vazirmatn">
                          {formatToToman(activeProduct.basePrice).split(' ')[0]}
                        </span>
                        <span className="text-[8px] sm:text-xs text-amber-200/70 font-vazirmatn">تومان</span>
                      </div>

                      {/* Shipping description */}
                      <p className="text-[7.5px] sm:text-[11px] text-emerald-400 flex items-center gap-1 justify-start font-vazirmatn mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        ارسال هدیه VIP شیخ + ضمانت سلامت کالا
                      </p>
                    </div>

                    {/* Footer Actions Panel */}
                    <div className="flex gap-1.5 sm:gap-2.5 mt-2 justify-between">
                      <Link href={activeProduct.slug ? `/products/${activeProduct.slug}` : `/products/${activeProduct.id}`} className="flex-1">
                        <button className="w-full py-1 sm:py-2.5 px-2 bg-stone-950/70 border border-amber-500/25 hover:border-amber-500/50 hover:bg-stone-900 rounded-[8px] sm:rounded-xl text-amber-200 text-[8px] sm:text-[12px] font-bold font-vazirmatn transition-all duration-300 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                          <span>{activeProduct.ctaText || 'مشاهده'}</span>
                        </button>
                      </Link>

                      <button
                        onClick={() => handleAddToCart(activeProduct.id)}
                        className="flex-1 py-1 sm:py-2.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-[8px] sm:text-[12px] font-black font-vazirmatn rounded-[8px] sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                        <span>خرید ویژه</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Slider Navigation controls */}
            <button
              onClick={handlePrev}
              aria-label="محصول قبلی"
              className="absolute right-[-10px] md:right-[-25px] top-1/2 -translate-y-1/2 w-6 h-6 sm:w-11 sm:h-11 rounded-full bg-stone-950/80 border border-amber-500/30 text-amber-400 hover:bg-stone-900 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-20 shadow-xl"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              aria-label="محصول بعدی"
              className="absolute left-[-10px] md:left-[-25px] top-1/2 -translate-y-1/2 w-6 h-6 sm:w-11 sm:h-11 rounded-full bg-stone-950/80 border border-amber-500/30 text-amber-400 hover:bg-stone-900 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-20 shadow-xl"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/*
            RIGHT COLUMN: Receiving Sheikh
            22% proportional width
          */}
          <div className="w-[22%] h-full relative overflow-hidden flex items-center justify-center">
            {webGLSupported && inView && !isMobile ? (
              <div className="w-full h-full pointer-events-auto relative overflow-hidden">
                <ThreeErrorBoundary fallback={<StaticSheikhFallback align="right" />}>
                  <Suspense fallback={<StaticSheikhFallback align="right" />}>
                    <Canvas
                      camera={{ position: [0, 0, 2.5], fov: 42 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      <ambientLight intensity={1.1} color="#fffbee" />
                      <directionalLight position={[1, 3, 2]} intensity={1.5} color="#fff1d0" />
                      <directionalLight position={[-1, 1, -1]} intensity={0.3} color="#d97706" />
                      <pointLight position={[0, -0.6, 1]} intensity={0.5} color="#ea580c" />
                      <AmbientGoldParticles />
                      <ReceiverSheikh isReceiving={isReceiving} />
                    </Canvas>
                  </Suspense>
                </ThreeErrorBoundary>
              </div>
            ) : (
              <StaticSheikhFallback align="right" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
