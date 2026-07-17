'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Link from 'next/link';
import { Music, Sparkles, ChevronLeft, Volume2 } from 'lucide-react';

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
    console.warn('Three.js speaker rendering failed. Falling back gracefully to premium 2D design.', error, errorInfo);
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

// Sound wave ring expanding from a woofer
interface SoundWaveProps {
  position: [number, number, number];
  delay: number;
}

function SoundWave({ position, delay }: SoundWaveProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() + delay;
    const cycle = (time % 2.0) / 2.0; // 0 to 1 loop

    if (meshRef.current) {
      // Expanding radius/scale
      const scaleVal = 0.2 + cycle * 1.5;
      meshRef.current.scale.set(scaleVal, scaleVal, 1);
      // Fade out as it expands
      if (meshRef.current.material) {
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, (1 - cycle) * 0.35);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.15, 0.17, 32]} />
      <meshBasicMaterial
        color="#fbbf24"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Standing Speaker
interface StandingSpeakerProps {
  hovered: boolean;
}

function StandingSpeaker({ hovered }: StandingSpeakerProps) {
  const speakerGroupRef = useRef<THREE.Group>(null);
  const upperConeRef = useRef<THREE.Mesh>(null);
  const lowerConeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Pulse speed and magnitude, slightly increased on hover
    const pulseSpeed = hovered ? 12.0 : 8.0;
    const pulseAmount = hovered ? 0.08 : 0.04;
    const pulse = 1.0 + Math.sin(time * pulseSpeed) * pulseAmount;

    if (upperConeRef.current) {
      upperConeRef.current.scale.set(pulse, pulse, 1.0);
    }
    if (lowerConeRef.current) {
      lowerConeRef.current.scale.set(pulse, pulse, 1.0);
    }

    if (speakerGroupRef.current) {
      // Gentle floating sway
      speakerGroupRef.current.rotation.y = Math.sin(time * 0.5) * 0.02;
    }
  });

  return (
    <group ref={speakerGroupRef}>
      {/* Main Enclosure (Cabinet) */}
      <mesh position={[-0.35, -0.15, 0]}>
        <boxGeometry args={[0.38, 1.15, 0.35]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>

      {/* Front Speaker Baffle (Inset frame) */}
      <mesh position={[-0.35, -0.15, 0.176]}>
        <boxGeometry args={[0.34, 1.11, 0.01]} />
        <meshStandardMaterial
          color="#141414"
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Upper Woofer */}
      <group position={[-0.35, 0.15, 0.185]}>
        {/* Outer Gold Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.008, 16, 32]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Inner Cone */}
        <mesh ref={upperConeRef} position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.04, 32]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.65}
            roughness={0.35}
          />
        </mesh>
        {/* Center Dust Cap */}
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial
            color="#050505"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Lower Woofer */}
      <group position={[-0.35, -0.3, 0.185]}>
        {/* Outer Gold Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.008, 16, 32]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Inner Cone */}
        <mesh ref={lowerConeRef} position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.04, 32]} />
          <meshStandardMaterial
            color="#222222"
            metalness={0.65}
            roughness={0.35}
          />
        </mesh>
        {/* Center Dust Cap */}
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial
            color="#050505"
            metalness={0.85}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Reflex Port (Bass Tube) */}
      <mesh position={[-0.35, -0.52, 0.181]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 32]} />
        <meshStandardMaterial
          color="#030303"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Sound Waves emanating from woofers */}
      <SoundWave position={[-0.35, 0.15, 0.2]} delay={0} />
      <SoundWave position={[-0.35, 0.15, 0.2]} delay={1.0} />
      <SoundWave position={[-0.35, -0.3, 0.2]} delay={0.5} />
      <SoundWave position={[-0.35, -0.3, 0.2]} delay={1.5} />
    </group>
  );
}

// Stylized Premium Sheikh Character
interface StylizedSheikhProps {
  hovered: boolean;
}

function StylizedSheikh({ hovered }: StylizedSheikhProps) {
  const sheikhGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftBishtRef = useRef<THREE.Mesh>(null);
  const rightBishtRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Synced with the speaker's bass pulse speed
    const pulseSpeed = hovered ? 12.0 : 8.0;
    const nodAmount = hovered ? 0.025 : 0.012;
    const nod = Math.sin(time * pulseSpeed) * nodAmount;

    if (headRef.current) {
      headRef.current.rotation.x = nod; // Nod head synced with bass
      headRef.current.rotation.y = Math.sin(time * 1.2) * 0.03; // Gentle ambient panning
    }

    if (sheikhGroupRef.current) {
      // Slow breathing float
      sheikhGroupRef.current.position.y = -0.22 + Math.sin(time * 1.5) * 0.015;

      const shrug = Math.sin(time * pulseSpeed) * 0.004;
      if (leftBishtRef.current) {
        leftBishtRef.current.rotation.z = -0.05 + shrug;
      }
      if (rightBishtRef.current) {
        rightBishtRef.current.rotation.z = 0.05 - shrug;
      }
    }
  });

  return (
    <group ref={sheikhGroupRef} position={[0.35, -0.22, 0]} scale={[0.7, 0.7, 0.7]}>
      {/* Head Group */}
      <group ref={headRef} position={[0, 0.58, 0]}>
        {/* Face (Ivory material) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial
            color="#fffcf7"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>

        {/* Minimalist Beard */}
        <mesh position={[0, -0.09, 0.12]}>
          <boxGeometry args={[0.15, 0.08, 0.15]} />
          <meshStandardMaterial
            color="#1d1510"
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Friendly Smile curve */}
        <mesh position={[0, -0.04, 0.191]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.005, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1d1510" roughness={0.5} />
        </mesh>

        {/* Keffiyeh Headpiece Cover */}
        <mesh position={[0, 0.06, -0.02]}>
          <sphereGeometry args={[0.215, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>

        {/* Keffiyeh Draping scarf sides */}
        <mesh position={[0, -0.28, -0.04]}>
          <cylinderGeometry args={[0.215, 0.35, 0.6, 16, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>

        {/* Agal rings */}
        <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.165, 0.013, 8, 64]} />
          <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.14, 0.01]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
          <torusGeometry args={[0.169, 0.009, 8, 64]} />
          <meshStandardMaterial color="#d97706" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Thobe (Gown Body) */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.35, 1.05, 32]} />
        <meshStandardMaterial
          color="#fffdfa"
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Golden Embroidery */}
      <mesh position={[0, 0.22, 0.191]}>
        <boxGeometry args={[0.018, 0.22, 0.01]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Bisht Cloak */}
      <mesh position={[0, -0.18, -0.05]}>
        <cylinderGeometry args={[0.22, 0.4, 1.0, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial
          color="#14110e"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Left Bisht draped side & gold trim */}
      <mesh ref={leftBishtRef} position={[-0.15, -0.15, 0.07]} rotation={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.05, 0.8, 0.04]} />
        <meshStandardMaterial color="#14110e" roughness={0.55} />
      </mesh>
      <mesh position={[-0.125, -0.15, 0.09]} rotation={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.01, 0.8, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Right Bisht draped side & gold trim */}
      <mesh ref={rightBishtRef} position={[0.15, -0.15, 0.07]} rotation={[0, -0.1, 0.05]}>
        <boxGeometry args={[0.05, 0.8, 0.04]} />
        <meshStandardMaterial color="#14110e" roughness={0.55} />
      </mesh>
      <mesh position={[0.125, -0.15, 0.09]} rotation={[0, -0.1, 0.05]}>
        <boxGeometry args={[0.01, 0.8, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Left Hand/Arm Welcoming Gesture */}
      <group position={[0.24, 0.08, 0.1]} rotation={[-0.15, -0.35, 0.22]}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.038, 0.22, 16]} />
          <meshStandardMaterial color="#fffdfa" roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.036, 0.006, 8, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.14, 0.035]} rotation={[0, 0.25, 0]}>
          <boxGeometry args={[0.035, 0.06, 0.013]} />
          <meshStandardMaterial color="#fffcf7" roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// Floating Ambient Gold Particles
function FloatingGoldParticles({ count = 25 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positionArray = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.0; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.0; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0; // Z
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
        // Slowly floating up
        const nextY = y + 0.003;
        // Subtle weaving drift
        const nextX = x + Math.sin(time * 0.4 + i) * 0.0015;

        if (nextY > 1.5) {
          positions[idx + 1] = -1.5;
          positions[idx] = (Math.random() - 0.5) * 4.0;
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
        size={0.04}
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Volumetric Background Spotlight / Glow
function VolumetricBacklight() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const scale = 1.0 + Math.sin(time * 0.5) * 0.05;
      meshRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.1, -1.0]}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial
        color="#d97706"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Slow floating camera movement (almost imperceptible)
function CameraController() {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(time * 0.25) * 0.12;
    state.camera.position.y = Math.cos(time * 0.3) * 0.08;
    state.camera.lookAt(0, -0.15, 0);
  });
  return null;
}

// Fallback component for loading state
function CanvasFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-950/20">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-amber-200/60 text-xs font-vazirmatn">در حال بارگذاری نمایشگر سه بعدی...</p>
    </div>
  );
}

// Highly polished, premium 2D fallback layout when WebGL is unavailable
function Premium2DFallback() {
  return (
    <div className="w-full h-full relative flex items-center justify-center p-2 select-none pointer-events-none">
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/5 to-transparent blur-2xl rounded-full" />

      <div className="relative flex items-center justify-center gap-[clamp(12px,2vw,36px)] w-full max-w-xs md:max-w-sm">
        {/* Stylized Speaker Glass Frame */}
        <div className="w-[clamp(65px,10vw,120px)] h-[clamp(130px,20vw,240px)] bg-stone-950/80 rounded-2xl border border-amber-500/15 flex flex-col items-center justify-center gap-[clamp(8px,1vw,16px)] p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent" />
          {/* Tweeter Ring */}
          <div className="w-[clamp(24px,4vw,48px)] h-[clamp(24px,4vw,48px)] rounded-full border border-amber-500/30 flex items-center justify-center">
            <div className="w-[clamp(14px,2.5vw,30px)] h-[clamp(14px,2.5vw,30px)] rounded-full bg-stone-900 border-2 border-amber-500/60" />
          </div>
          {/* Woofer Ring */}
          <div className="w-[clamp(32px,5.5vw,64px)] h-[clamp(32px,5.5vw,64px)] rounded-full border border-amber-500/30 flex items-center justify-center relative">
            <div className="w-[clamp(20px,3.5vw,42px)] h-[clamp(20px,3.5vw,42px)] rounded-full bg-stone-900 border-2 border-amber-500/60 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping opacity-25" />
          </div>
          {/* Bass tube */}
          <div className="w-[clamp(10px,1.5vw,18px)] h-[clamp(10px,1.5vw,18px)] rounded-full bg-stone-900" />
        </div>

        {/* Stylized Sheikh Character Glass Frame */}
        <div className="w-[clamp(65px,10vw,120px)] h-[clamp(130px,20vw,240px)] bg-stone-950/80 rounded-2xl border border-amber-500/15 flex flex-col items-center justify-end p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent" />
          {/* Head & Keffiyeh */}
          <div className="w-[clamp(24px,4vw,48px)] h-[clamp(24px,4vw,48px)] rounded-full bg-white relative mb-2 flex items-center justify-center shadow-lg">
            {/* Beard */}
            <div className="absolute bottom-0 w-[80%] h-[40%] bg-stone-900 rounded-b-full" />
            {/* Smile */}
            <div className="absolute bottom-[25%] w-[30%] h-[15%] border-b border-stone-800" />
            {/* Agal headpiece cord */}
            <div className="absolute -top-1 w-[90%] h-2 border-t-2 border-amber-500 rounded-t-full" />
          </div>
          {/* Royal Thobe & Bisht Body */}
          <div className="w-[85%] h-[55%] bg-stone-900 rounded-t-3xl border-t border-amber-500/30 relative shadow-inner">
            {/* Golden embroidery trim */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-amber-400 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Dynamic Premium Speaker Component
// ==========================================
export default function PremiumSpeakerShowcase() {
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebGLSupported(isWebGLAvailable());

    // Check for reduced motion settings
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!mounted) {
    return (
      <section className="container-fluid py-8 px-4 max-w-7xl mx-auto select-none">
        <div className="w-full h-[320px] sm:h-[420px] md:h-[500px] bg-stone-950/25 border border-amber-500/10 rounded-[2.5rem] animate-pulse" />
      </section>
    );
  }

  return (
    <section className="container-fluid py-8 sm:py-12 md:py-16 px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto select-none">
      {/* Container holding both content and showcase, with glassmorphism and subtle luxury golden borders */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-full rounded-[2.2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-amber-950/75 via-stone-900/90 to-amber-950/80 border border-amber-500/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden p-[clamp(12px,2vw,36px)]"
      >
        {/* Soft luxury ambient background glowing overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-transparent to-white/2 pointer-events-none z-0" />

        {/* Responsive dual-column layout that never stacks (even on tiny 320px screens) */}
        <div
          className="flex flex-row-reverse items-center justify-between w-full relative z-10"
          style={{ direction: 'rtl' }}
        >
          {/* RIGHT SIDE: Luxury Persian marketing content */}
          <div className="w-[52%] flex flex-col justify-center text-right pr-[1vw] pl-[2vw] overflow-hidden">
            {/* Golden Elegant Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex self-start items-center gap-[0.5vw] bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/20 px-[clamp(6px,1vw,14px)] py-[clamp(2px,0.4vw,6px)] rounded-full mb-[2vw]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span className="text-[clamp(8px,1vw,12px)] font-bold text-amber-200 tracking-wide font-vazirmatn">
                سیستم صوتی انحصاری شیخ
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[clamp(13px,2.8vw,42px)] font-black bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100 bg-clip-text text-transparent leading-[1.2] tracking-tight font-vazirmatn drop-shadow-sm"
            >
              قدرتی که شنیده می‌شود
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-gray-300 text-[clamp(8.5px,1.15vw,15px)] leading-[1.65] font-light font-vazirmatn mt-[1.5vw] mb-[2.5vw] max-w-xl"
            >
              تجربه‌ای متفاوت از دنیای سیستم‌های صوتی، اسپیکرهای حرفه‌ای و تجهیزات دیجیتال با کیفیت ممتاز، ضمانت اصالت و بهترین قیمت در فروشگاه شیخ.
            </motion.p>

            {/* CTA Buttons side-by-side */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-row gap-[1.5vw] items-center"
            >
              {/* Primary Button */}
              <Link href="/categories/sheikh-audio" className="flex-1 max-w-[195px]">
                <button className="w-full whitespace-nowrap bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-[clamp(7.5px,1.05vw,14px)] font-black font-vazirmatn py-[clamp(5px,0.85vw,12px)] px-[clamp(8px,1.6vw,26px)] rounded-[clamp(6px,0.9vw,12px)] shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.35)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-[0.4vw]">
                  <span>مشاهده سیستم‌های صوتی</span>
                  <Volume2 className="w-[clamp(8px,1.2vw,16px)] h-[clamp(8px,1.2vw,16px)] shrink-0" />
                </button>
              </Link>

              {/* Secondary Button */}
              <Link href="/sheikh-digital" className="flex-1 max-w-[195px]">
                <button className="w-full whitespace-nowrap bg-stone-950/80 hover:bg-stone-900 border border-amber-500/25 hover:border-amber-400/45 text-amber-200 text-[clamp(7.5px,1.05vw,14px)] font-bold font-vazirmatn py-[clamp(5px,0.85vw,12px)] px-[clamp(8px,1.6vw,26px)] rounded-[clamp(6px,0.9vw,12px)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-[0.4vw] backdrop-blur-md">
                  <span>مشاهده شیخ دیجیتال</span>
                  <Sparkles className="w-[clamp(8px,1.2vw,16px)] h-[clamp(8px,1.2vw,16px)] text-amber-400 shrink-0" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* LEFT SIDE: Interactive Three.js/Fallback Showcase */}
          <div className="w-[45%] h-[clamp(140px,28vw,480px)] relative flex items-center justify-center overflow-hidden">
            {/* Subtle glow surrounding the showcase */}
            <div
              className={`absolute inset-0 rounded-[1.5rem] bg-amber-400/5 blur-xl transition-opacity duration-700 pointer-events-none ${
                hovered ? 'opacity-100' : 'opacity-40'
              }`}
            />

            <ThreeErrorBoundary fallback={<Premium2DFallback />}>
              {webGLSupported && !prefersReducedMotion ? (
                <div className="w-full h-full relative z-10 pointer-events-auto">
                  <Suspense fallback={<CanvasFallback />}>
                    <Canvas
                      camera={{ position: [0, 0, 3.4], fov: 40 }}
                      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                      className="w-full h-full"
                    >
                      {/* Premium Studio Lights */}
                      <ambientLight intensity={0.9} color="#fffbee" />
                      <directionalLight position={[2, 4, 3]} intensity={1.6} color="#fff5df" castShadow />
                      <directionalLight position={[-2, 1, -1]} intensity={0.4} color="#d97706" />
                      <pointLight position={[0, -0.8, 1.5]} intensity={0.5} color="#ea580c" />

                      {/* Volumetric ambient background glow */}
                      <VolumetricBacklight />

                      {/* Floating slow gold particles */}
                      <FloatingGoldParticles count={30} />

                      {/* Standing Speaker and Stylized Sheikh models */}
                      <group position={[0, -0.15, 0]}>
                        <StandingSpeaker hovered={hovered} />
                        <StylizedSheikh hovered={hovered} />
                      </group>

                      {/* Interactive Camera Controller */}
                      <CameraController />
                    </Canvas>
                  </Suspense>
                </div>
              ) : (
                <Premium2DFallback />
              )}
            </ThreeErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}
