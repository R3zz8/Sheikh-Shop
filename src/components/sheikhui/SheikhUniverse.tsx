'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html as ThreeHtml, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  Smartphone,
  Car,
  ShoppingBag,
  Sparkles,
  Cpu,
  Shield
} from 'lucide-react';

// Category Definitions
interface CategoryItem {
  id: string;
  name: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'digital',
    name: 'شیخ دیجیتال',
    description: 'لوازم دیجیتال و گجت‌های هوشمند',
    Icon: Smartphone,
    color: '#fbbf24',
  },
  {
    id: 'car',
    name: 'شیخ خودرو',
    description: 'تجهیزات و لوازم لوکس خودرو',
    Icon: Car,
    color: '#f59e0b',
  },
  {
    id: 'market',
    name: 'شیخ مارکت',
    description: 'کالاهای سوپرمارکتی و مصرفی',
    Icon: ShoppingBag,
    color: '#d97706',
  },
  {
    id: 'perfume',
    name: 'شیخ پرفیوم',
    description: 'عطرهای لوکس و رایحه‌های خاص',
    Icon: Sparkles,
    color: '#fb7316',
  },
  {
    id: 'smart',
    name: 'شیخ اسمارت',
    description: 'خانه هوشمند و گجت‌های خلاقانه',
    Icon: Cpu,
    color: '#ea580c',
  },
  {
    id: 'security',
    name: 'شیخ امنیت',
    description: 'سیستم‌های امنیتی و نظارتی هوشمند',
    Icon: Shield,
    color: '#c2410c',
  },
];

// Mouse tracker for parallax effect
interface MouseTracker {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

// Particle interface
interface ParticleData {
  pos: [number, number, number];
  speed: number;
  scale: number;
  seed: number;
}

// Subtle golden particle background
function GoldenParticles({ count = 40, disabled = false }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particles = useRef<ParticleData[]>([]);

  useEffect(() => {
    const temp: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        pos: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
        ],
        speed: 0.1 + Math.random() * 0.2,
        scale: 0.02 + Math.random() * 0.05,
        seed: Math.random() * 100,
      });
    }
    particles.current = temp;
  }, [count]);

  useFrame((state) => {
    if (disabled || !pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const positionAttr = pointsRef.current.geometry.attributes.position;
    if (!positionAttr) return;

    const positions = positionAttr.array as Float32Array;

    particles.current.forEach((p, i) => {
      // Gentle rising and swaying motion
      const index = i * 3;
      const currentY = positions[index + 1];
      if (currentY !== undefined) {
        positions[index + 1] = currentY + p.speed * 0.02; // rise y
      }

      const currentX = positions[index];
      if (currentX !== undefined) {
        positions[index] = currentX + Math.sin(time + p.seed) * 0.005; // sway x
      }

      // Wrap around screen boundaries
      const yVal = positions[index + 1];
      if (yVal !== undefined && yVal > 4) {
        positions[index + 1] = -4;
      }

      const xVal = positions[index];
      if (xVal !== undefined) {
        if (xVal > 6) {
          positions[index] = -6;
        } else if (xVal < -6) {
          positions[index] = 6;
        }
      }
    });

    positionAttr.needsUpdate = true;
  });

  const positionArray = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, [count]);

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
        size={0.06}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Centered floating gold emblem with text
interface EmblemProps {
  scale: number;
  disabled: boolean;
}

function GoldenEmblem({ scale, disabled }: EmblemProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerDiscRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (disabled) return;
    const time = state.clock.getElapsedTime();

    // Elegant float motion
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = time * 0.3;
      outerRingRef.current.rotation.x = Math.sin(time * 0.5) * 0.15;
      outerRingRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    }

    if (innerDiscRef.current) {
      innerDiscRef.current.rotation.y = -time * 0.15;
      innerDiscRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <group scale={scale}>
      {/* Outer rotating golden luxury ring */}
      <mesh ref={outerRingRef} castShadow receiveShadow>
        <torusGeometry args={[1.5, 0.08, 16, 100]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.15}
          emissive="#d97706"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner thin rotating disk / plate */}
      <mesh ref={innerDiscRef} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.1, 0.05, 32]} />
        <meshStandardMaterial
          color="#1c1917"
          metalness={0.8}
          roughness={0.2}
          emissive="#78350f"
          emissiveIntensity={0.1}
        />

        {/* Decorative inner golden rim */}
        <mesh position={[0, 0.03, 0]}>
          <torusGeometry args={[1.05, 0.02, 8, 64]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Brand Persian text projected onto the emblem */}
        <ThreeHtml
          position={[0, 0, 0.06]}
          center
          distanceFactor={4}
          className="select-none pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center font-vazirmatn text-center">
            <h1 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-100 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)] whitespace-nowrap">
              فروشگاه شیخ
            </h1>
            <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-1" />
            <span className="text-[8px] md:text-[10px] tracking-widest text-amber-200/80 uppercase mt-0.5">
              EST. 2024
            </span>
          </div>
        </ThreeHtml>
      </mesh>
    </group>
  );
}

// Beautiful glass-morphic orbiting category nodes
interface OrbitSystemProps {
  scale: number;
  disabled: boolean;
  activeHoverId: string | null;
  setActiveHoverId: (id: string | null) => void;
}

function OrbitSystem({ scale, disabled, activeHoverId, setActiveHoverId }: OrbitSystemProps) {
  const orbitGroupRef = useRef<THREE.Group>(null);
  const orbitRadius = 3.6;

  useFrame((state) => {
    if (disabled || !orbitGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Orbit group auto-rotation
    orbitGroupRef.current.rotation.y = time * 0.08;
  });

  return (
    <group ref={orbitGroupRef} scale={scale} rotation={[0.2, 0, 0.15]}>
      {/* Tilted orbital guide ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[orbitRadius, 0.015, 8, 120]} />
        <meshBasicMaterial
          color="#fde68a"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbit categories placement */}
      {CATEGORIES.map((item, index) => {
        const angle = (index / CATEGORIES.length) * Math.PI * 2;
        const x = orbitRadius * Math.cos(angle);
        const z = orbitRadius * Math.sin(angle);

        return (
          <group key={item.id} position={[x, 0, z]}>
            <ThreeHtml center distanceFactor={7}>
              <div
                className="relative group cursor-pointer"
                onMouseEnter={() => setActiveHoverId(item.id)}
                onMouseLeave={() => setActiveHoverId(null)}
              >
                {/* Node Container with glowing background */}
                <div
                  className={`flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full border transition-all duration-500 ease-out backdrop-blur-xl ${
                    activeHoverId === item.id
                      ? 'bg-amber-500/20 border-amber-400 scale-125 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                      : 'bg-stone-950/60 border-amber-500/30 hover:border-amber-400 hover:scale-110 shadow-[0_4px_15px_rgba(0,0,0,0.4)]'
                  }`}
                  style={{
                    boxShadow: activeHoverId === item.id ? `0 0 30px ${item.color}50` : ''
                  }}
                >
                  <item.Icon
                    className={`w-6 h-6 md:w-7 md:h-7 transition-all duration-500 ${
                      activeHoverId === item.id ? 'text-amber-300 rotate-[360deg]' : 'text-amber-100/80 group-hover:text-amber-300'
                    }`}
                  />
                </div>

                {/* Golden pulsating particle behind the active node */}
                {activeHoverId === item.id && (
                  <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md animate-ping pointer-events-none" />
                )}

                {/* Premium Glassmorphic Tooltip */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-18 md:bottom-20 w-48 md:w-56 p-3 rounded-xl border border-amber-500/20 bg-stone-950/80 backdrop-blur-lg transition-all duration-500 flex flex-col items-center text-center pointer-events-none shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-50 ${
                    activeHoverId === item.id
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 scale-90'
                  }`}
                >
                  {/* Glass shimmer overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent rounded-xl pointer-events-none" />

                  {/* Tooltip Corner Glow */}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-r border-b border-amber-500/20 bg-stone-950"
                  />

                  <span className="font-bold text-amber-300 text-sm md:text-base mb-1 tracking-wide font-vazirmatn">
                    {item.name}
                  </span>
                  <p className="text-gray-300 text-[10px] md:text-xs leading-relaxed font-vazirmatn">
                    {item.description}
                  </p>
                </div>
              </div>
            </ThreeHtml>
          </group>
        );
      })}
    </group>
  );
}

// Main Scene Controller combining mouse movement
function SceneController({ disabled }: { disabled: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef<MouseTracker>({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse positions to [-0.5, 0.5]
      mouse.current.targetX = (e.clientX / window.innerWidth) - 0.5;
      mouse.current.targetY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    if (disabled || !groupRef.current) return;

    // Smooth lerp for responsive parallax effect
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;

    // Gently rotate entire scene group based on mouse coordinates
    groupRef.current.rotation.y = mouse.current.x * 0.5;
    groupRef.current.rotation.x = mouse.current.y * 0.3;
  });

  return (
    <group ref={groupRef}>
      {/* Golden Atmosphere/Lighting */}
      <ambientLight intensity={0.6} color="#fcd34d" />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#fbbf24" castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ea580c" />
      <spotLight position={[0, 10, 0]} intensity={1.2} color="#fff" angle={0.4} penumbra={1} castShadow />

      {/* Golden Particles */}
      <GoldenParticles count={50} disabled={disabled} />

      {/* Custom scaled components based on parent context */}
      <EmblemController disabled={disabled} />
    </group>
  );
}

// Controller to compute sizes reactively
function EmblemController({ disabled }: { disabled: boolean }) {
  const { width } = useThree((state) => state.viewport);

  // Calculate size scale based on three.js viewport width
  let scale = 1.0;
  if (width < 5) {
    scale = 0.55; // Mobile compact scale
  } else if (width < 9) {
    scale = 0.8;  // Tablet scale
  }

  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);

  return (
    <>
      <GoldenEmblem scale={scale} disabled={disabled} />
      <OrbitSystem
        scale={scale}
        disabled={disabled}
        activeHoverId={activeHoverId}
        setActiveHoverId={setActiveHoverId}
      />
    </>
  );
}

// Root Interactive Sheikh Universe Component
export default function SheikhUniverse() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;

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
      <div className="w-full h-[550px] bg-stone-950/20 flex items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] select-none">
      {/* Background Soft Glow Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-gradient-radial from-amber-500/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute w-full h-full bg-gradient-to-b from-stone-950/10 via-transparent to-stone-950/40" />
      </div>

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'auto' }}
        className="relative z-10 w-full h-full"
      >
        <SceneController disabled={prefersReducedMotion} />

        {/* Safe navigation controls fallback */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
