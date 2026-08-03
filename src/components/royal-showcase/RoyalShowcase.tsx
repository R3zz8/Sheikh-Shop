'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
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
  Award,
  CheckCircle,
  Percent
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
// ULTRA-LUXURY MASCOTS IN 3D
// ==========================================

// LEFT SHEIKH - THE CURATOR (Cream Thobe, Black & Gold Bisht, pointing presentation)
interface SheikhProps {
  isPointing: boolean;
  activeProductId: string;
}

function PusherSheikh({ isPointing }: { isPointing: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  // Blinking timer ref
  const blinkTimerRef = useRef(0);
  const blinkDurationRef = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Gentle floating breathing idle
    if (groupRef.current) {
      groupRef.current.position.y = -0.75 + Math.sin(time * 1.2) * 0.02;
      groupRef.current.rotation.y = -0.4 + Math.sin(time * 0.35) * 0.02;
    }

    // 2. Head tracking: slowly turn head towards central card & mouse pointer
    if (headRef.current) {
      // Base rotation looking slightly right (towards center) plus subtle mouse parallax
      const targetY = 0.35 + state.pointer.x * 0.12;
      const targetX = state.pointer.y * -0.08;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);
      headRef.current.rotation.z = Math.sin(time * 0.8) * 0.005; // Head breathing tilt
    }

    // 3. Subtle organic eye blinking
    blinkTimerRef.current += 0.016;
    if (blinkTimerRef.current > 4.2) {
      blinkDurationRef.current = 0.12; // Start blink
      blinkTimerRef.current = 0;
    }
    if (blinkDurationRef.current > 0) {
      blinkDurationRef.current -= 0.016;
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 0.1;
        rightEyeRef.current.scale.y = 0.1;
      }
    } else {
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 1.0;
        rightEyeRef.current.scale.y = 1.0;
      }
    }

    // 4. Arm presentation pointing gesture
    if (leftArmRef.current) {
      // Base idle position
      let targetRotX = 0.2;
      let targetRotY = 0.4;
      let targetRotZ = -0.55;

      if (isPointing) {
        // Smoothly extend and point left hand towards center product card
        targetRotX = -0.75;
        targetRotY = -0.35;
        targetRotZ = 0.65;
      }

      leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, targetRotX, 0.08);
      leftArmRef.current.rotation.y = THREE.MathUtils.lerp(leftArmRef.current.rotation.y, targetRotY, 0.08);
      leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, targetRotZ, 0.08);
    }
  });

  return (
    <group ref={groupRef} scale={[0.82, 0.82, 0.82]}>
      {/* Exquisite Showroom Pedestal */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.12, 32]} />
        <meshStandardMaterial color="#1c1917" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.40, 0.40, 0.015, 32]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.74, 0]}>
        {/* Face */}
        <mesh>
          <sphereGeometry args={[0.21, 32, 32]} />
          <meshStandardMaterial color="#fdfbf7" roughness={0.15} metalness={0.02} />
        </mesh>

        {/* Closed/Narrow Minimalist Luxury Eyes */}
        <mesh ref={leftEyeRef} position={[0.07, 0.02, 0.165]} rotation={[0, 0.2, 0]}>
          <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>
        <mesh ref={rightEyeRef} position={[-0.07, 0.02, 0.165]} rotation={[0, -0.2, 0]}>
          <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>

        {/* Sculpted Charcoal/Beard */}
        <mesh position={[0, -0.09, 0.13]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.15, 0.11, 0.14]} />
          <meshStandardMaterial color="#141414" roughness={0.8} />
        </mesh>

        {/* Elegant White Ghutra (Silk Headcover) */}
        <mesh position={[0, 0.08, -0.03]}>
          <sphereGeometry args={[0.228, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.02} />
        </mesh>

        {/* Draped Ghutra Folds falling beautifully over shoulders */}
        <mesh position={[0, -0.25, -0.05]} rotation={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.225, 0.35, 0.58, 16, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        {/* Left shoulder drape fold */}
        <mesh position={[-0.14, -0.26, 0.06]} rotation={[0, 0, 0.25]}>
          <cylinderGeometry args={[0.05, 0.1, 0.45, 8, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        {/* Right shoulder drape fold */}
        <mesh position={[0.14, -0.26, 0.06]} rotation={[0, 0, -0.25]}>
          <cylinderGeometry args={[0.05, 0.1, 0.45, 8, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>

        {/* Black Cord Agal (Double Ring) */}
        <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.176, 0.016, 8, 64]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Gold thread woven agal accent */}
        <mesh position={[0, 0.165, 0.008]} rotation={[Math.PI / 2 + 0.04, 0, 0]}>
          <torusGeometry args={[0.18, 0.012, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.95} />
        </mesh>
      </group>

      {/* Luxury Thobe Body (Kandura) */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.18, 0.34, 1.08, 32]} />
        <meshStandardMaterial color="#fbfaf7" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Golden Vertical Buttons Down Chest */}
      <mesh position={[0, 0.26, 0.181]}>
        <boxGeometry args={[0.016, 0.22, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Royal Black Bisht (Open Cloak) */}
      <mesh position={[0, -0.12, -0.04]}>
        <cylinderGeometry args={[0.22, 0.38, 1.04, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#0d0c0c" roughness={0.4} metalness={0.3} />
      </mesh>

      {/* Left Presenting Arm */}
      <group ref={leftArmRef} position={[-0.22, 0.34, 0.04]}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#0d0c0c" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.14, 0.04]} rotation={[Math.PI / 8, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.03, 0.26, 16]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.25} />
        </mesh>
        {/* Dark Amber Leather Glove presenting hands */}
        <mesh position={[0, -0.27, 0.09]}>
          <boxGeometry args={[0.048, 0.065, 0.018]} />
          <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Gold ornament trim on cuff */}
        <mesh position={[0, -0.23, 0.07]}>
          <torusGeometry args={[0.03, 0.006, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Right Arm (Resting Draped) */}
      <group position={[0.22, 0.34, 0.04]} rotation={[0.12, -0.12, -0.18]}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#0d0c0c" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.038, 0.034, 0.28, 16]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.25} />
        </mesh>
      </group>

      {/* Premium Leather Sandals */}
      <mesh position={[-0.08, -0.68, 0.08]}>
        <boxGeometry args={[0.065, 0.025, 0.16]} />
        <meshStandardMaterial color="#292524" roughness={0.65} />
      </mesh>
      <mesh position={[0.08, -0.68, 0.08]}>
        <boxGeometry args={[0.065, 0.025, 0.16]} />
        <meshStandardMaterial color="#292524" roughness={0.65} />
      </mesh>
    </group>
  );
}

// RIGHT SHEIKH - THE COLLECTOR / WELCOMING HOST (Ivory Thobe, Chocolate Bisht, welcoming posture)
function ReceiverSheikh({ isPointing }: { isPointing: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  const blinkTimerRef = useRef(0);
  const blinkDurationRef = useRef(0);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Synchronized luxury breathing idle
    if (groupRef.current) {
      groupRef.current.position.y = -0.75 + Math.sin(time * 1.15) * 0.02;
      groupRef.current.rotation.y = 0.4 - Math.sin(time * 0.35) * 0.02;
    }

    // 2. Head tracking: look-at product card plus mouse cursor
    if (headRef.current) {
      const targetY = -0.35 + state.pointer.x * 0.12;
      const targetX = state.pointer.y * -0.08;
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetY, 0.08);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetX, 0.08);
      headRef.current.rotation.z = -Math.sin(time * 0.75) * 0.005;
    }

    // 3. Blinking logic
    blinkTimerRef.current += 0.016;
    if (blinkTimerRef.current > 3.8) {
      blinkDurationRef.current = 0.12;
      blinkTimerRef.current = 0;
    }
    if (blinkDurationRef.current > 0) {
      blinkDurationRef.current -= 0.016;
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 0.1;
        rightEyeRef.current.scale.y = 0.1;
      }
    } else {
      if (leftEyeRef.current && rightEyeRef.current) {
        leftEyeRef.current.scale.y = 1.0;
        rightEyeRef.current.scale.y = 1.0;
      }
    }

    // 4. Right arm welcoming presentation gesture
    if (rightArmRef.current) {
      let targetRotX = 0.2;
      let targetRotY = -0.4;
      let targetRotZ = 0.55;

      if (isPointing) {
        // Points towards the center product card
        targetRotX = -0.75;
        targetRotY = 0.35;
        targetRotZ = -0.65;
      }

      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, targetRotX, 0.08);
      rightArmRef.current.rotation.y = THREE.MathUtils.lerp(rightArmRef.current.rotation.y, targetRotY, 0.08);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, targetRotZ, 0.08);
    }
  });

  return (
    <group ref={groupRef} scale={[0.82, 0.82, 0.82]}>
      {/* Exquisite Showroom Pedestal */}
      <mesh position={[0, -0.78, 0]}>
        <cylinderGeometry args={[0.42, 0.48, 0.12, 32]} />
        <meshStandardMaterial color="#1c1917" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.40, 0.40, 0.015, 32]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Head Group */}
      <group ref={headRef} position={[0, 0.74, 0]}>
        {/* Face */}
        <mesh>
          <sphereGeometry args={[0.21, 32, 32]} />
          <meshStandardMaterial color="#fdfbf7" roughness={0.15} metalness={0.02} />
        </mesh>

        {/* Minimalist Closed Eyes */}
        <mesh ref={leftEyeRef} position={[0.07, 0.02, 0.165]} rotation={[0, 0.2, 0]}>
          <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>
        <mesh ref={rightEyeRef} position={[-0.07, 0.02, 0.165]} rotation={[0, -0.2, 0]}>
          <torusGeometry args={[0.025, 0.006, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1c1917" roughness={0.3} />
        </mesh>

        {/* Sculpted Beard */}
        <mesh position={[0, -0.09, 0.13]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.15, 0.11, 0.14]} />
          <meshStandardMaterial color="#1c1c1c" roughness={0.85} />
        </mesh>

        {/* White Ghutra (Silk Cover) */}
        <mesh position={[0, 0.08, -0.03]}>
          <sphereGeometry args={[0.228, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} metalness={0.02} />
        </mesh>

        {/* Welcoming draped ghutra style - slightly distinct from Left Sheikh */}
        <mesh position={[0, -0.25, -0.05]} rotation={[0.02, 0, 0]}>
          <cylinderGeometry args={[0.225, 0.36, 0.58, 16, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[-0.14, -0.26, 0.04]} rotation={[0, 0, 0.22]}>
          <cylinderGeometry args={[0.05, 0.09, 0.42, 8, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        <mesh position={[0.14, -0.26, 0.04]} rotation={[0, 0, -0.22]}>
          <cylinderGeometry args={[0.05, 0.09, 0.42, 8, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>

        {/* Black & Gold Agal Cord */}
        <mesh position={[0, 0.19, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.176, 0.016, 8, 64]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.165, 0.008]} rotation={[Math.PI / 2 + 0.04, 0, 0]}>
          <torusGeometry args={[0.18, 0.012, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.1} metalness={0.95} />
        </mesh>
      </group>

      {/* Royal Ivory Thobe */}
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.18, 0.34, 1.08, 32]} />
        <meshStandardMaterial color="#fbfaf7" roughness={0.25} metalness={0.05} />
      </mesh>

      {/* Vertical Golden chest panel line */}
      <mesh position={[0, 0.26, 0.181]}>
        <boxGeometry args={[0.016, 0.22, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Luxurious Warm Chocolate/Espresso Bisht Cloak */}
      <mesh position={[0, -0.12, -0.04]}>
        <cylinderGeometry args={[0.22, 0.38, 1.04, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#2d160f" roughness={0.4} metalness={0.2} /> {/* Chocolate-brown Bisht */}
      </mesh>

      {/* Welcoming Left Draped Arm */}
      <group position={[-0.22, 0.34, 0.04]} rotation={[0.12, 0.12, 0.18]}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#2d160f" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.038, 0.034, 0.28, 16]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.25} />
        </mesh>
      </group>

      {/* Welcoming Presenting Right Arm */}
      <group ref={rightArmRef} position={[0.22, 0.34, 0.04]}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#2d160f" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.14, 0.04]} rotation={[-Math.PI / 8, 0, 0]}>
          <cylinderGeometry args={[0.038, 0.03, 0.26, 16]} />
          <meshStandardMaterial color="#fbfaf7" roughness={0.25} />
        </mesh>
        {/* Dark leather glove */}
        <mesh position={[0, -0.27, 0.09]}>
          <boxGeometry args={[0.048, 0.065, 0.018]} />
          <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Golden cuff cuff ornament */}
        <mesh position={[0, -0.23, 0.07]}>
          <torusGeometry args={[0.03, 0.006, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Leather Sandals */}
      <mesh position={[-0.08, -0.68, 0.08]}>
        <boxGeometry args={[0.065, 0.025, 0.16]} />
        <meshStandardMaterial color="#292524" roughness={0.65} />
      </mesh>
      <mesh position={[0.08, -0.68, 0.08]}>
        <boxGeometry args={[0.065, 0.025, 0.16]} />
        <meshStandardMaterial color="#292524" roughness={0.65} />
      </mesh>
    </group>
  );
}

// 3D Tiny floating luxury gold dust particles
function AmbientGoldParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 45; // slightly increased but extremely tiny/high performance

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 4.5;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
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
        const nextY = y + 0.0035;
        arr[idx + 1] = nextY;
        arr[idx] = x + Math.sin(time * 0.4 + i) * 0.0018;

        if (nextY > 1.8) {
          arr[idx + 1] = -1.8;
          arr[idx] = (Math.random() - 0.5) * 4.5;
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
        color="#fbbf24" // premium bright gold
        size={0.022}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ==========================================
// 2D FALLBACK SYSTEM (For older/failing systems)
// ==========================================
function StaticSheikhFallback({ align }: { align: 'left' | 'right' }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-end p-2 relative select-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 to-transparent blur-xl" />
      <div className="w-[85px] h-[170px] md:w-[135px] md:h-[270px] bg-stone-900/95 rounded-3xl border border-amber-500/30 shadow-2xl flex flex-col items-center justify-end p-3 relative overflow-hidden">
        {/* Gold backlight */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent" />

        {/* Head */}
        <div className="w-[32px] h-[32px] md:w-[48px] md:h-[48px] rounded-full bg-stone-100 relative mb-2 flex items-center justify-center shadow-lg border border-amber-500/10">
          <div className="absolute bottom-0 w-[80%] h-[40%] bg-stone-950 rounded-b-full" />
          <div className="absolute -top-1 w-[90%] h-1.5 md:h-2.5 border-t-[3px] border-amber-500 rounded-t-full" />
          <div className="absolute bottom-[20%] w-[35%] h-[10%] bg-amber-200/50 rounded-full" />
        </div>

        {/* Thobe & Bisht */}
        <div className="w-[90%] h-[60%] bg-stone-950 rounded-t-3xl border-t border-amber-400/20 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 md:w-1 h-full bg-gradient-to-b from-amber-400 via-yellow-300 to-transparent" />
          {/* Gentle breathing animation */}
          <div className={`absolute top-2 w-3 h-12 bg-stone-900 rounded-full border-t border-amber-500/10 ${align === 'left' ? 'left-[-4px] animate-pulse' : 'right-[-4px]'}`} />
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

  // Default Soft warm glow bokeh
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '3.5s' }} />
      <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-orange-400/5 rounded-full blur-xl animate-pulse" style={{ animationDuration: '5s' }} />
    </div>
  );
}

// ==========================================
// EXQUISITE MAIN SHOWCASE SYSTEM
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

export default function RoyalShowcase() {
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Configuration States
  const [config, setConfig] = useState({
    isEnabled: true,
    loopMode: true,
    autoplayInterval: 6000,
    animationSpeed: 1000,
    backgroundGlow: '#fbbf24',
    maxProducts: 10,
  });

  const [products, setProducts] = useState<ProductWithMetadata[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: prev, 1: next

  // Mascot pointing triggers
  const [isPointing, setIsPointing] = useState(false);

  // Card Parallax Tilt Coordinates
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Autoplay Loop Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    setWebGLSupported(isWebGLAvailable());

    // Fetch config and prioritized real products
    const fetchShowcaseData = async () => {
      try {
        const res = await fetch('/api/admin/showcase-config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            setConfig(data.config);
          }
          // Direct prioritized database products
          if (Array.isArray(data.allProducts) && data.allProducts.length > 0) {
            setProducts(data.allProducts);
          }
        }
      } catch (error) {
        console.error('Error in RoyalShowcase mount:', error);
      }
    };

    fetchShowcaseData();
  }, []);

  // Setup autoplay loops (strictly every 6 seconds as per prompt)
  useEffect(() => {
    if (!config.isEnabled || products.length <= 1) return;

    const interval = config.autoplayInterval || 6000;

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

    // Trigger subtle pointing gesture on active change (Left pointing first, Right follow)
    setIsPointing(true);
    setTimeout(() => setIsPointing(false), 1400);

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

    setIsPointing(true);
    setTimeout(() => setIsPointing(false), 1400);

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
    setTilt({ x: x * 12, y: y * -12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!mounted) {
    return (
      <section className="container-fluid py-8 max-w-7xl mx-auto select-none">
        <div className="w-full h-[450px] bg-stone-950/40 rounded-[2.5rem] border border-amber-500/10 animate-pulse" />
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
    <section className="container-fluid py-10 sm:py-14 md:py-18 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto select-none overflow-hidden relative z-20">
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
        className="relative w-full rounded-[2.5rem] bg-gradient-to-br from-[#120a06]/95 via-stone-900/98 to-[#1a110a]/95 border border-amber-500/20 shadow-[0_30px_70px_rgba(0,0,0,0.95)] p-4 md:p-8 overflow-hidden"
        style={{
          boxShadow: `0 30px 70px rgba(0,0,0,0.95), 0 0 85px ${config.backgroundGlow}15`
        }}
      >
        {/* Soft, blurred large golden showroom showroom lighting halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full bg-amber-500/4 blur-[130px] pointer-events-none z-0 mix-blend-screen" />

        {/*
          RTL ROW WRAPPER: Left Sheikh, Center Slider Showcase, Right Sheikh
          This row will NEVER stack, scaling perfectly proportionally on screens down to 320px
        */}
        <div
          className="flex flex-row items-center justify-between w-full h-[clamp(240px,48vw,580px)] relative z-10"
          style={{ direction: 'rtl' }}
        >
          {/*
            LEFT COLUMN: Presenting Sheikh Mascot (22% proportional width)
          */}
          <div className="w-[22%] h-full relative overflow-hidden flex items-center justify-center">
            {webGLSupported ? (
              <div className="w-full h-full pointer-events-auto relative overflow-hidden">
                <ThreeErrorBoundary fallback={<StaticSheikhFallback align="left" />}>
                  <Suspense fallback={<StaticSheikhFallback align="left" />}>
                    <Canvas
                      camera={{ position: [0, 0, 2.4], fov: 42 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      {/* Premium Cinematic Lighting System */}
                      <ambientLight intensity={1.25} color="#fffbee" />
                      {/* Warm front key light */}
                      <directionalLight position={[-1, 3.2, 2.5]} intensity={1.8} color="#ffeec9" />
                      {/* Soft gold rim light to trace silhouette elegantly */}
                      <directionalLight position={[1.5, 1.8, -2.5]} intensity={3.0} color="#fbbf24" />
                      <directionalLight position={[-1.5, 1.0, -1.5]} intensity={0.8} color="#d97706" />
                      <pointLight position={[0, -0.6, 1]} intensity={0.6} color="#ea580c" />
                      <AmbientGoldParticles />
                      <PusherSheikh isPointing={isPointing} />
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
          <div className="w-[54%] h-full flex items-center justify-center relative px-1 sm:px-3">
            {/* Dynamic visual category background effects */}
            {activeProduct && (
              <CategoryVisualEffect effect={activeProduct.categoryEffect || activeProduct.category} />
            )}

            {/* Showcase Stage Frame */}
            <div className="absolute inset-0 border border-amber-500/10 rounded-[2.2rem] bg-stone-950/40 backdrop-blur-[5px] pointer-events-none" />

            <AnimatePresence mode="wait" custom={direction}>
              {activeProduct && (
                <motion.div
                  key={activeProduct.id}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    scale: 0.88,
                    rotateY: direction > 0 ? 35 : -35,
                    filter: 'blur(12px)',
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotateY: 0,
                    filter: 'blur(0px)',
                    transition: {
                      type: 'spring',
                      stiffness: 150,
                      damping: 19,
                      mass: 0.9,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.82,
                    rotateY: direction > 0 ? -35 : 35,
                    filter: 'blur(12px)',
                    transition: { duration: 0.45 },
                  }}
                  className="w-full max-w-[420px] h-[94%] relative"
                >
                  {/* Floating Depth container with 3D tilts and warm shadows */}
                  <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                      transition: 'transform 0.18s ease-out',
                    }}
                    className="w-full h-full bg-gradient-to-br from-[#1c1410]/85 via-stone-950/60 to-[#120a06]/85 border border-amber-400/30 hover:border-amber-400/45 rounded-[2.2rem] shadow-[0_25px_55px_rgba(0,0,0,0.95)] hover:shadow-[0_25px_65px_rgba(245,158,11,0.18)] p-2.5 sm:p-5 md:p-6 text-center relative overflow-hidden flex flex-col justify-between backdrop-blur-3xl"
                  >
                    {/* Exquisite Diagonal Sweeping Glass Reflection */}
                    <motion.div
                      initial={{ left: '-150%' }}
                      animate={{ left: '200%' }}
                      transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.2 }}
                      className="absolute top-0 bottom-0 w-36 bg-gradient-to-r from-transparent via-amber-400/12 to-transparent skew-x-12 pointer-events-none z-10"
                    />

                    {/* Header Elements: Badge & Dynamic Category Icon */}
                    <div className="flex items-center justify-between w-full mb-1 sm:mb-2">
                      {getBadgeElement(activeProduct.badgeType)}
                      <span className="text-amber-400 text-[11px] sm:text-xs font-black font-vazirmatn drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        {activeProduct.categoryType === 'SheikhDigital' ? 'دیجیتال لوکس' : activeProduct.categoryType === 'SheikhHome' ? 'لوازم خانگی لوکس' : 'اکوسیستم ممتاز'}
                      </span>
                    </div>

                    {/* Product Display Gallery Section with warm reflections */}
                    <div className="relative w-full h-[40%] min-h-[80px] sm:min-h-[140px] md:min-h-[180px] flex items-center justify-center my-1 sm:my-2">
                      <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 to-transparent blur-2xl rounded-full pointer-events-none scale-110" />
                      <motion.img
                        initial={{ scale: 0.88, y: 8 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                        src={getProductImage(activeProduct)}
                        alt={activeProduct.name}
                        className="max-h-full max-w-[85%] object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] hover:scale-105 duration-500"
                      />
                    </div>

                    {/* Text Details & Luxury Persian Typography */}
                    <div className="text-right flex flex-col justify-center px-1">
                      <h3 className="text-[12px] sm:text-[16px] md:text-[18px] lg:text-[21px] font-black text-amber-5 leading-tight tracking-tight mb-1 truncate font-vazirmatn">
                        {activeProduct.name}
                      </h3>

                      {/* Professional Stars */}
                      <div className="flex items-center gap-0.5 mb-1.5 justify-start">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-[9px] h-[9px] sm:w-[13px] sm:h-[13px] text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-[8px] sm:text-[11px] text-amber-200/50 mr-1.5 font-vazirmatn">۵.۰ (بررسی ویژه)</span>
                      </div>

                      {/* Toman Persian pricing */}
                      <div className="flex items-baseline gap-1 mt-1 justify-start">
                        <span className="text-[12px] sm:text-[18px] md:text-[23px] font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 font-vazirmatn">
                          {formatToToman(activeProduct.basePrice).split(' ')[0]}
                        </span>
                        <span className="text-[8px] sm:text-xs text-amber-200/70 font-vazirmatn">تومان</span>
                      </div>

                      {/* Shipping information */}
                      <p className="text-[7.5px] sm:text-[11.5px] text-emerald-400 flex items-center gap-1.5 justify-start font-vazirmatn mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        ارسال هدیه VIP شیخ + ضمانت سلامت کالا
                      </p>
                    </div>

                    {/* CTA Actions Bar */}
                    <div className="flex gap-1.5 sm:gap-2.5 mt-2 justify-between">
                      <Link href={activeProduct.slug ? `/products/${activeProduct.slug}` : `/products/${activeProduct.id}`} className="flex-1">
                        <button className="w-full py-1 sm:py-2.5 px-2 bg-stone-950/80 border border-amber-500/30 hover:border-amber-500/60 hover:bg-stone-900 rounded-[10px] sm:rounded-xl text-amber-200 text-[8px] sm:text-[12px] font-bold font-vazirmatn transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                          <span>{activeProduct.ctaText || 'مشاهده جزئیات'}</span>
                        </button>
                      </Link>

                      <button
                        onClick={() => handleAddToCart(activeProduct.id)}
                        className="flex-1 py-1 sm:py-2.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-[8px] sm:text-[12px] font-black font-vazirmatn rounded-[10px] sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
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
              className="absolute right-[-12px] md:right-[-25px] top-1/2 -translate-y-1/2 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-stone-950/90 border border-amber-500/40 text-amber-400 hover:bg-stone-900 hover:text-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-20 shadow-2xl"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={handleNext}
              aria-label="محصول بعدی"
              className="absolute left-[-12px] md:left-[-25px] top-1/2 -translate-y-1/2 w-7 h-7 sm:w-11 sm:h-11 rounded-full bg-stone-950/90 border border-amber-500/40 text-amber-400 hover:bg-stone-900 hover:text-amber-300 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center z-20 shadow-2xl"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/*
            RIGHT COLUMN: Welcoming Sheikh Mascot (22% proportional width)
          */}
          <div className="w-[22%] h-full relative overflow-hidden flex items-center justify-center">
            {webGLSupported ? (
              <div className="w-full h-full pointer-events-auto relative overflow-hidden">
                <ThreeErrorBoundary fallback={<StaticSheikhFallback align="right" />}>
                  <Suspense fallback={<StaticSheikhFallback align="right" />}>
                    <Canvas
                      camera={{ position: [0, 0, 2.4], fov: 42 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    >
                      {/* Cinematic Lighting matching the premium stage */}
                      <ambientLight intensity={1.25} color="#fffbee" />
                      <directionalLight position={[1, 3.2, 2.5]} intensity={1.8} color="#ffeec9" />
                      <directionalLight position={[-1.5, 1.8, -2.5]} intensity={3.0} color="#fbbf24" />
                      <directionalLight position={[1.5, 1.0, -1.5]} intensity={0.8} color="#d97706" />
                      <pointLight position={[0, -0.6, 1]} intensity={0.6} color="#ea580c" />
                      <AmbientGoldParticles />
                      <ReceiverSheikh isPointing={isPointing} />
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
