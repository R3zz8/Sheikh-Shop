'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import * as THREE from 'three';
import ErrorBoundary from './PalmTree/ErrorBoundary';

// Custom interface for component props
interface AuthBrandSceneProps {
  className?: string;
  isHovered?: boolean;
}

// Custom interface for Floating Icon props
interface FloatingIconProps {
  position: [number, number, number];
  offset: number;
  speed: number;
  title: string;
  type: 'honey' | 'saffron' | 'digital' | 'beauty' | 'dates' | 'auto' | 'web';
}

// Custom interface for Particle
interface ParticleData {
  id: number;
  position: [number, number, number];
  speed: number;
  scale: number;
  phase: number;
  opacity: number;
}

// ==========================================
// 1. SHEIKH MASCOT COMPONENT (PREMIUM POLISHED)
// ==========================================
function SheikhMascot({ isHovered = false }: { isHovered?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const bagRef = useRef<THREE.Group>(null);
  const bagGlowRef = useRef<THREE.PointLight>(null);

  // Smooth hover interpolation state
  const hoverProgress = useRef(0);

  useFrame((state) => {
    // 1. Breath / Idle motion for the whole Sheikh (Very subtle & luxurious)
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.9) * 0.03 - 0.5;
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.02;
    }

    // Interpolate hover state smoothly using lerp
    hoverProgress.current = THREE.MathUtils.lerp(
      hoverProgress.current,
      isHovered ? 1.0 : 0.0,
      0.08
    );

    // 2. Head nod / elegant tilt reaction
    if (headRef.current) {
      const idleBob = Math.sin(state.clock.getElapsedTime() * 0.9) * 0.01;
      const nod = hoverProgress.current * -0.08; // Delicate nod
      const tilt = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.01 * hoverProgress.current;

      headRef.current.rotation.x = idleBob + nod;
      headRef.current.rotation.z = tilt;
    }

    // 3. Bag breathing & hover glow intensity
    if (bagRef.current) {
      const bagIdle = Math.sin(state.clock.getElapsedTime() * 1.1) * 0.015;
      bagRef.current.position.y = bagIdle + hoverProgress.current * 0.04;
      bagRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.8) * 0.01 + hoverProgress.current * -0.03;
    }

    if (bagGlowRef.current) {
      // Idle has very soft warm glow (1.2), hovering increases to a rich bright glow (3.8)
      bagGlowRef.current.intensity = 1.2 + hoverProgress.current * 2.6;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* ==================== KANDURA (ROBE) ==================== */}
      {/* Main robe body - Low poly stylized elegant cone */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.55, 2.0, 10]} />
        <meshStandardMaterial
          color="#fdfdfd"
          roughness={0.85}
          metalness={0.03}
        />
      </mesh>

      {/* Gold Collar / Neck Trim - High luxury metallic gold */}
      <mesh castShadow position={[0, 0.96, 0]}>
        <cylinderGeometry args={[0.19, 0.21, 0.08, 10]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Elegant Gold Chest Embroidery Strip */}
      <mesh castShadow position={[0, 0.65, 0.19]} rotation={[0.04, 0, 0]}>
        <boxGeometry args={[0.03, 0.45, 0.015]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>

      {/* Left Sleeve (Static/Idle) */}
      <mesh castShadow position={[-0.26, 0.5, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.08, 0.11, 0.7, 8]} />
        <meshStandardMaterial color="#fdfdfd" roughness={0.85} />
      </mesh>

      {/* Left Hand (Skin) */}
      <mesh castShadow position={[-0.34, 0.19, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#eed8c5" roughness={0.4} />
      </mesh>

      {/* Right Sleeve (Holding the bag) */}
      <group position={[0.24, 0.5, 0.08]} rotation={[-0.08, 0, -0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
          <meshStandardMaterial color="#fdfdfd" roughness={0.85} />
        </mesh>
        {/* Right Hand */}
        <mesh castShadow position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#eed8c5" roughness={0.4} />
        </mesh>
      </group>

      {/* ==================== HEAD & FACE ==================== */}
      <group ref={headRef} position={[0, 1.25, 0.01]}>
        {/* Base Head / Skin */}
        <mesh castShadow>
          <sphereGeometry args={[0.2, 10, 10]} />
          <meshStandardMaterial color="#eed8c5" roughness={0.4} />
        </mesh>

        {/* Premium Styled Gold Visor/Sunglasses (Modern luxury high-tech detail) */}
        <mesh castShadow position={[0, 0.05, 0.16]}>
          <boxGeometry args={[0.27, 0.06, 0.07]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.98}
            roughness={0.03}
          />
        </mesh>

        {/* ==================== GHUTRA & AGAL ==================== */}
        {/* Agal (Double luxury golden-black rings on top of head) */}
        <group position={[0, 0.16, 0]} rotation={[0.04, 0, 0]}>
          {/* Bottom Ring */}
          <mesh castShadow position={[0, 0, 0]}>
            <torusGeometry args={[0.16, 0.018, 6, 24]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
          </mesh>
          {/* Top Ring (Gold Accent) */}
          <mesh castShadow position={[0, 0.035, -0.01]}>
            <torusGeometry args={[0.15, 0.014, 6, 24]} />
            <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
          </mesh>
        </group>

        {/* Ghutra (Main fabric head covering) */}
        <mesh castShadow position={[0, 0.04, -0.01]}>
          <sphereGeometry args={[0.23, 16, 16, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>

        {/* Ghutra Draping Tails (Left and Right hanging fabric) */}
        {/* Left Side */}
        <mesh castShadow position={[-0.16, -0.28, -0.04]} rotation={[0.08, 0.04, 0.08]}>
          <cylinderGeometry args={[0.06, 0.1, 0.7, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
        {/* Right Side */}
        <mesh castShadow position={[0.16, -0.28, -0.04]} rotation={[0.08, -0.04, -0.08]}>
          <cylinderGeometry args={[0.06, 0.1, 0.7, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </mesh>
      </group>

      {/* ==================== GOLDEN SANDALS ==================== */}
      <group position={[0, -1.02, 0.04]}>
        {/* Left Sandal */}
        <mesh castShadow position={[-0.14, 0, 0.08]} rotation={[0, 0.08, 0]}>
          <boxGeometry args={[0.13, 0.035, 0.26]} />
          <meshStandardMaterial color="#351f11" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[-0.14, 0.03, 0.14]} rotation={[0.12, 0.08, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} />
        </mesh>

        {/* Right Sandal */}
        <mesh castShadow position={[0.14, 0, 0.08]} rotation={[0, -0.08, 0]}>
          <boxGeometry args={[0.13, 0.035, 0.26]} />
          <meshStandardMaterial color="#351f11" roughness={0.9} />
        </mesh>
        <mesh castShadow position={[0.14, 0.03, 0.14]} rotation={[0.12, -0.08, 0]}>
          <boxGeometry args={[0.1, 0.01, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* ==================== GOLDEN SHOPPING BAG ==================== */}
      <group ref={bagRef} position={[0.34, 0.02, 0.2]}>
        {/* Main Golden Bag Body */}
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.38, 0.16]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>

        {/* Shiny Gold Plate Label (Luxury Logo Placement) */}
        <mesh position={[0, 0, 0.082]}>
          <boxGeometry args={[0.18, 0.09, 0.01]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.98}
            roughness={0.02}
          />
        </mesh>

        {/* Crown Emblem on Bag Label */}
        <mesh position={[0, 0, 0.09]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.035, 0.035, 0.012]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.98}
            roughness={0.02}
          />
        </mesh>

        {/* Thin Strap Handles (Torus) */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.012, 6, 16, Math.PI]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.08}
          />
        </mesh>

        {/* Glowing Gift Boxes inside the bag */}
        {/* Box 1 */}
        <mesh position={[-0.05, 0.2, 0.01]} rotation={[0.08, 0.18, -0.12]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={1.8}
            roughness={0.1}
          />
        </mesh>
        {/* Box 2 */}
        <mesh position={[0.04, 0.22, -0.01]} rotation={[-0.12, -0.08, 0.18]}>
          <boxGeometry args={[0.11, 0.11, 0.11]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={2.2}
            roughness={0.1}
          />
        </mesh>

        {/* Warm Golden Glow Light emanating from within the bag */}
        <pointLight
          ref={bagGlowRef}
          color="#f59e0b"
          distance={2.0}
          intensity={1.2}
          position={[0, 0.26, 0]}
        />
      </group>
    </group>
  );
}

// ==========================================
// 2. PREMIUM FLOATING GLASS ICONS (POLISHED & COMPACTED)
// ==========================================
function FloatingIcon({ position, offset, speed, title, type }: FloatingIconProps) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Very slow floating breath (Asynchronous phase drift)
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed + offset) * 0.1;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.getElapsedTime() * (speed * 0.75) + offset) * 0.05;

      // Gentle continuous rotation
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25 + offset;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.04;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* 1. Glassmorphic Translucent Card Backing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.34, 0.03]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          transmission={0.92}
          roughness={0.1}
          thickness={0.4}
          clearcoat={1.0}
          clearcoatRoughness={0.03}
          ior={1.5}
        />
      </mesh>

      {/* 2. Deluxe Gold Rim for Glass Card */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.36, 0.36, 0.015]} />
        <meshStandardMaterial
          color="#d4af37"
          wireframe
          metalness={0.95}
          roughness={0.08}
        />
      </mesh>

      {/* 3. Unique Procedural Golden Sculptures */}
      <group position={[0, 0, 0.02]}>
        {type === 'honey' && (
          <group scale={1.0}>
            {/* Honey Pot Base */}
            <mesh castShadow>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.08} />
            </mesh>
            {/* Honey Pot Lid */}
            <mesh castShadow position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.025, 8]} />
              <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
            </mesh>
            {/* Little Wand Stick */}
            <mesh position={[0.05, 0.08, 0.01]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 4]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )}

        {type === 'dates' && (
          <group scale={1.0}>
            <mesh castShadow position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 4]} />
              <meshStandardMaterial color="#3d2314" roughness={0.8} />
            </mesh>
            <mesh castShadow position={[-0.03, 0.02, 0]} rotation={[0, 0, 0.6]}>
              <sphereGeometry args={[0.045, 6, 6]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh castShadow position={[0.03, 0.03, 0]} rotation={[0, 0, -0.6]}>
              <sphereGeometry args={[0.047, 6, 6]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
            </mesh>
            <mesh castShadow position={[0, 0.07, 0.01]}>
              <sphereGeometry args={[0.042, 6, 6]} />
              <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.1} />
            </mesh>
          </group>
        )}

        {type === 'saffron' && (
          <group scale={0.9}>
            <mesh castShadow position={[0, -0.04, 0]}>
              <cylinderGeometry args={[0.015, 0.02, 0.06, 6]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh castShadow position={[-0.04, 0.03, 0]} rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.015, 0.12, 0.015]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
            </mesh>
            <mesh castShadow position={[0.04, 0.03, 0]} rotation={[0, 0, -0.5]}>
              <boxGeometry args={[0.015, 0.12, 0.015]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
            </mesh>
            <mesh castShadow position={[0, 0.06, 0.015]}>
              <boxGeometry args={[0.015, 0.13, 0.015]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.08} />
            </mesh>
          </group>
        )}

        {type === 'digital' && (
          <group scale={1.0}>
            <mesh castShadow position={[0, 0.02, 0]}>
              <boxGeometry args={[0.16, 0.11, 0.012]} />
              <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
            </mesh>
            <mesh castShadow position={[0, -0.05, 0.05]} rotation={[0.18, 0, 0]}>
              <boxGeometry args={[0.18, 0.012, 0.12]} />
              <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.08} />
            </mesh>
          </group>
        )}

        {type === 'beauty' && (
          <group scale={0.9}>
            <mesh castShadow>
              <octahedronGeometry args={[0.11]} />
              <meshStandardMaterial
                color="#d4af37"
                metalness={0.98}
                roughness={0.02}
                emissive="#d4af37"
                emissiveIntensity={0.15}
              />
            </mesh>
            <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
              <torusGeometry args={[0.14, 0.008, 4, 16]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        )}

        {/* NEW: SHEIKH AUTO (🚗) sports-car silhouette mesh */}
        {type === 'auto' && (
          <group scale={0.8} position={[0, -0.02, 0]}>
            {/* Main Car Body */}
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.06, 0.08]} />
              <meshStandardMaterial color="#d4af37" metalness={0.96} roughness={0.05} />
            </mesh>
            {/* Car Cabin */}
            <mesh castShadow position={[-0.02, 0.05, 0]}>
              <boxGeometry args={[0.12, 0.05, 0.075]} />
              <meshStandardMaterial color="#ffffff" metalness={0.98} roughness={0.02} />
            </mesh>
            {/* Front Wheel */}
            <mesh position={[-0.06, -0.03, 0.042]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.01, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
            {/* Back Wheel */}
            <mesh position={[0.06, -0.03, 0.042]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.01, 8]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
          </group>
        )}

        {/* NEW: SHEIKH WEB (🌐) wireframe globe mesh */}
        {type === 'web' && (
          <group scale={0.95}>
            {/* Wireframe Globe Spherical Core */}
            <mesh castShadow>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} transparent opacity={0.4} />
            </mesh>
            {/* Longitudinal Ring 1 */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.105, 0.007, 4, 24]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Longitudinal Ring 2 */}
            <mesh rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.105, 0.007, 4, 24]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Latitudinal Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.105, 0.007, 4, 24]} />
              <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.05} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

// ==========================================
// 3. AMBIENT VOLUMETRIC LUXURY PARTICLES (RANDOMIZED & NON-REPETITIVE)
// ==========================================
function DriftingParticles({ isHovered = false }: { isHovered?: boolean }) {
  const particlesRef = useRef<THREE.Group>(null);
  const particleCount = 30;

  // Fully randomized, non-repetitive coordinates, speeds, opacities, and sizes
  const particles = useRef<ParticleData[]>([]);

  if (particles.current.length === 0) {
    for (let i = 0; i < particleCount; i++) {
      particles.current.push({
        id: i,
        // Drifts in 3D volume around mascot
        position: [
          (Math.random() - 0.5) * 4.8,
          (Math.random() - 0.5) * 3.8,
          (Math.random() - 0.5) * 1.8 - 0.4,
        ],
        // Distinct randomized drift speed
        speed: 0.12 + Math.random() * 0.28,
        // Individualized scaling limits
        scale: 0.25 + Math.random() * 0.75,
        // Unique asynchronous phase offsets
        phase: Math.random() * Math.PI * 2,
        // Base ambient opacity
        opacity: 0.35 + Math.random() * 0.45,
      });
    }
  }

  const hoverLerp = useRef(0);

  useFrame((state) => {
    hoverLerp.current = THREE.MathUtils.lerp(
      hoverLerp.current,
      isHovered ? 1.0 : 0.0,
      0.06
    );

    if (particlesRef.current) {
      // Extremely slow drift of the global particle swarm
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;

      const children = particlesRef.current.children;
      particles.current.forEach((p, idx) => {
        const mesh = children[idx] as THREE.Mesh;
        if (mesh) {
          // Asynchronous vertical drifting
          const currentY = p.position[1] + state.clock.getElapsedTime() * p.speed * 0.15;
          // Soft wrap so particles re-emerge at the bottom
          mesh.position.y = ((currentY + 2.2) % 4.4) - 2.2;

          // Asynchronous horizontal sway
          mesh.position.x = p.position[0] + Math.sin(state.clock.getElapsedTime() * 0.35 * p.speed + p.phase) * 0.18;

          // Shimmer / flicker breathing cycle
          const pulse = Math.sin(state.clock.getElapsedTime() * p.speed * 1.8 + p.phase);
          const currentScale = p.scale * (0.8 + pulse * 0.2) * (1.0 + hoverLerp.current * 0.6);
          mesh.scale.set(currentScale, currentScale, currentScale);

          // Render soft glowing material behavior
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.emissiveIntensity = 0.4 + pulse * 0.25 + hoverLerp.current * 2.2;
            mat.opacity = p.opacity * (0.7 + pulse * 0.3);
          }
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.current.map((p) => (
        <mesh key={p.id} position={p.position}>
          <sphereGeometry args={[0.024, 4, 4]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.4}
            transparent
            opacity={0.6}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// ==========================================
// 4. PARALLAX & CAMERA SCENE CONTROLLER
// ==========================================
function SceneController({ isHovered = false }: { isHovered?: boolean }) {
  const { camera, pointer } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // Elegant, slow parallax drift following the mouse to maximize luxury feel
    if (groupRef.current) {
      const targetX = -pointer.y * 0.1;
      const targetY = pointer.x * 0.1;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Volumetric particles */}
      <DriftingParticles isHovered={isHovered} />

      {/* 2. Main Character Sheikh Mascot */}
      <SheikhMascot isHovered={isHovered} />

      {/* 3. Surrounded Category Icons (7 premium floating glassmorphic categories) */}
      <FloatingIcon
        position={[-1.2, 0.7, 0.1]}
        offset={0}
        speed={0.7}
        title="عسل لوکس"
        type="honey"
      />
      <FloatingIcon
        position={[-1.3, -0.4, 0.3]}
        offset={1.5}
        speed={0.6}
        title="خرما ممتاز"
        type="dates"
      />
      <FloatingIcon
        position={[1.2, 0.8, -0.1]}
        offset={3.0}
        speed={0.8}
        title="زعفران اصیل"
        type="saffron"
      />
      <FloatingIcon
        position={[1.3, -0.4, 0.3]}
        offset={4.2}
        speed={0.65}
        title="شیخ دیجیتال"
        type="digital"
      />
      <FloatingIcon
        position={[0, 1.3, -0.3]}
        offset={5.5}
        speed={0.5}
        title="زیبایی و لوکس"
        type="beauty"
      />
      {/* NEW: SHEIKH AUTO (🚗) category card */}
      <FloatingIcon
        position={[-0.7, -1.0, 0.2]}
        offset={2.4}
        speed={0.75}
        title="شیخ خودرو"
        type="auto"
      />
      {/* NEW: SHEIKH WEB (🌐) category card */}
      <FloatingIcon
        position={[0.7, -1.0, 0.2]}
        offset={4.8}
        speed={0.72}
        title="شیخ وب"
        type="web"
      />
    </group>
  );
}

// ==========================================
// 5. PREMIUM PERSiAN STATIC FALLBACK (TWIN DESIGN TO 3D SCENE)
// ==========================================
function StaticAuthBrandIllustration() {
  return (
    <div className="w-full h-full min-h-[380px] lg:min-h-[500px] bg-gradient-to-br from-[#1c0d05]/70 via-[#120702]/85 to-[#070201]/95 rounded-[32px] border border-amber-500/15 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Back glow resembling 3D lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none" />

      {/* Header Info */}
      <div className="text-center z-10">
        <span className="text-amber-500 text-[10px] sm:text-xs font-semibold tracking-widest font-vazirmatn uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
          دنیای لوکس شیخ شاپ
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white mt-3 font-vazirmatn">
          بازار لوکس و مدرن ایرانی
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 font-vazirmatn max-w-sm mx-auto leading-relaxed">
          کیفیت ممتاز، اصالت کالا و ارسال سریع به سراسر کشور با طعم واقعی خرید لوکس
        </p>
      </div>

      {/* Stylized visual twin of 3D Scene */}
      <div className="relative flex justify-center items-center h-48 sm:h-56 z-10">
        {/* Orbit circle representing 3D ring layout */}
        <div className="absolute w-48 h-44 rounded-full border border-dashed border-amber-500/25 animate-spin" style={{ animationDuration: '50s' }} />

        {/* Glow core */}
        <div className="absolute w-28 h-28 rounded-full bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/30 flex items-center justify-center shadow-lg animate-pulse">
          {/* Main Crown Mascot core */}
          <span className="text-5xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">👑</span>
        </div>

        {/* 7 Floating Premium Cards resembling the 3D categories */}
        <div className="absolute -left-3 top-2 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '6s' }}>
          <span className="text-sm">🍯</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">عسل طبیعی</span>
        </div>

        <div className="absolute -right-3 top-4 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '7s', animationDelay: '1s' }}>
          <span className="text-sm">🌺</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">زعفران ممتاز</span>
        </div>

        <div className="absolute left-6 bottom-1 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>
          <span className="text-sm">🌴</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">خرما اعلا</span>
        </div>

        <div className="absolute right-6 bottom-1 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '8s', animationDelay: '1.5s' }}>
          <span className="text-sm">💻</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">دیجیتال</span>
        </div>

        <div className="absolute -top-12 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '9s', animationDelay: '2s' }}>
          <span className="text-sm">✨</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">زیبایی</span>
        </div>

        {/* NEW: SHEIKH AUTO static card fallback */}
        <div className="absolute -left-4 bottom-14 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '6.5s', animationDelay: '0.8s' }}>
          <span className="text-sm">🚗</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">خودرو</span>
        </div>

        {/* NEW: SHEIKH WEB static card fallback */}
        <div className="absolute -right-4 bottom-14 bg-white/5 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg animate-bounce" style={{ animationDuration: '7.5s', animationDelay: '1.2s' }}>
          <span className="text-sm">🌐</span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200 font-vazirmatn">وب</span>
        </div>
      </div>

      {/* Bottom Slogan */}
      <div className="text-center z-10 pt-4 border-t border-white/5">
        <p className="text-[10px] sm:text-xs text-amber-500/70 font-vazirmatn">
          عضو برتر زنجیره تامین محصولات ارگانیک و خدمات دیجیتال لوکس کشور
        </p>
      </div>

      {/* Floating subtle CSS sparkles */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/40 rounded-full animate-pulse"
            style={{
              left: `${10 + i * 11}%`,
              top: `${15 + (i % 2) * 55}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2.0 + i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. MAIN AUTH BRAND SCENE WRAPPER
// ==========================================
export default function AuthBrandScene({ className = '', isHovered = false }: AuthBrandSceneProps) {
  const [isClient, setIsClient] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      // Robust WebGL capability check to switch cleanly tofallback twin on low-spec or headless devices
      try {
        const canvas = document.createElement('canvas');
        const support = !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
        setHasWebGL(support);
      } catch (e) {
        setHasWebGL(false);
      }

      const handleResize = () => {
        setViewportWidth(window.innerWidth);
        setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
    return undefined;
  }, []);

  if (!isClient) {
    // Standard Loading Placeholder (Hydration-safe)
    return (
      <div className="w-full h-full min-h-[350px] lg:min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-500/60 font-medium font-vazirmatn text-sm">در حال بارگذاری تجربه سه بعدی لوکس...</p>
        </div>
      </div>
    );
  }

  // If WebGL fails, display the premium static illustration fallback
  if (!hasWebGL) {
    return <StaticAuthBrandIllustration />;
  }

  // Adjust camera distance & fov responsively to prevent clipping & overflow
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;

  const cameraDistance = isMobile ? 3.4 : isTablet ? 3.8 : 4.2;
  const cameraFov = isMobile ? 55 : isTablet ? 50 : 45;

  return (
    <div className={`relative w-full h-[240px] xs:h-[300px] sm:h-[380px] lg:h-[500px] ${className}`.trim()}>
      <ErrorBoundary fallback={<StaticAuthBrandIllustration />}>
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-transparent">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-amber-500/60 font-medium font-vazirmatn text-sm">آماده‌سازی جلوه‌های بصری...</p>
            </div>
          </div>
        }>
          <Canvas
            shadows
            camera={{
              position: [0, 0, cameraDistance],
              fov: cameraFov,
              near: 0.1,
              far: 20,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            dpr={pixelRatio}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            {/* Ambient Lighting - Warm and cozy HDRI-like glow */}
            <ambientLight intensity={0.4} color="#fef3c7" />

            {/* Principal Key Directional Light - Sun-like light casting soft shadows */}
            <directionalLight
              position={[5, 6, 4]}
              intensity={1.2}
              color="#fbbf24"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={15}
              shadow-camera-left={-3}
              shadow-camera-right={3}
              shadow-camera-top={3}
              shadow-camera-bottom={-3}
            />

            {/* Warm Fill Light - Emphasizes golden contours & premium material sheen */}
            <directionalLight
              position={[-4, 2, -2]}
              intensity={0.4}
              color="#d97706"
            />

            {/* Subtle bottom bounce light - Cream/white glow from bottom ground */}
            <directionalLight
              position={[0, -5, 0]}
              intensity={0.25}
              color="#fcfaf2"
            />

            {/* NEW: Warm Rim Light directly behind the Sheikh to better separate model from background */}
            <pointLight
              position={[0, 0.8, -1.8]}
              color="#fde68a"
              intensity={2.2}
              distance={4.0}
            />

            {/* Main Interactive Scene controller */}
            <SceneController isHovered={isHovered} />

            {/* Performance Adaptive Optimization */}
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <Preload all />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Export static illustration fallback in case it's needed elsewhere
export { StaticAuthBrandIllustration };
