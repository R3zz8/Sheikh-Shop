'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

      {/* Front Speaker Baffle */}
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
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.008, 16, 32]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={upperConeRef} position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.04, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#050505" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Lower Woofer */}
      <group position={[-0.35, -0.3, 0.185]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.008, 16, 32]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh ref={lowerConeRef} position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.04, 32]} />
          <meshStandardMaterial color="#222222" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.012]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#050505" metalness={0.85} roughness={0.15} />
        </mesh>
      </group>

      {/* Reflex Port */}
      <mesh position={[-0.35, -0.52, 0.181]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 32]} />
        <meshStandardMaterial color="#030303" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Sound Waves */}
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
    const pulseSpeed = hovered ? 12.0 : 8.0;
    const nodAmount = hovered ? 0.025 : 0.012;
    const nod = Math.sin(time * pulseSpeed) * nodAmount;

    if (headRef.current) {
      headRef.current.rotation.x = nod;
      headRef.current.rotation.y = Math.sin(time * 1.2) * 0.03;
    }

    if (sheikhGroupRef.current) {
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
      <group ref={headRef} position={[0, 0.58, 0]}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshStandardMaterial color="#fffcf7" roughness={0.25} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.09, 0.12]}>
          <boxGeometry args={[0.15, 0.08, 0.15]} />
          <meshStandardMaterial color="#1d1510" roughness={0.8} metalness={0.0} />
        </mesh>
        <mesh position={[0, -0.04, 0.191]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.005, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1d1510" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.06, -0.02]}>
          <sphereGeometry args={[0.215, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.0} />
        </mesh>
        <mesh position={[0, -0.28, -0.04]}>
          <cylinderGeometry args={[0.215, 0.35, 0.6, 16, 1, true]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.0} />
        </mesh>
        <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.165, 0.013, 8, 64]} />
          <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.14, 0.01]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
          <torusGeometry args={[0.169, 0.009, 8, 64]} />
          <meshStandardMaterial color="#d97706" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.35, 1.05, 32]} />
        <meshStandardMaterial color="#fffdfa" roughness={0.35} metalness={0.05} />
      </mesh>

      <mesh position={[0, 0.22, 0.191]}>
        <boxGeometry args={[0.018, 0.22, 0.01]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
      </mesh>

      <mesh position={[0, -0.18, -0.05]}>
        <cylinderGeometry args={[0.22, 0.4, 1.0, 32, 1, true, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color="#14110e" roughness={0.55} metalness={0.15} />
      </mesh>

      <mesh ref={leftBishtRef} position={[-0.15, -0.15, 0.07]} rotation={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.05, 0.8, 0.04]} />
        <meshStandardMaterial color="#14110e" roughness={0.55} />
      </mesh>
      <mesh position={[-0.125, -0.15, 0.09]} rotation={[0, 0.1, -0.05]}>
        <boxGeometry args={[0.01, 0.8, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

      <mesh ref={rightBishtRef} position={[0.15, -0.15, 0.07]} rotation={[0, -0.1, 0.05]}>
        <boxGeometry args={[0.05, 0.8, 0.04]} />
        <meshStandardMaterial color="#14110e" roughness={0.55} />
      </mesh>
      <mesh position={[0.125, -0.15, 0.09]} rotation={[0, -0.1, 0.05]}>
        <boxGeometry args={[0.01, 0.8, 0.012]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
      </mesh>

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
      positions[i * 3] = (Math.random() - 0.5) * 4.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
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
        const nextY = y + 0.003;
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

// Slow floating camera movement
function CameraController() {
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    state.camera.position.x = Math.sin(time * 0.25) * 0.12;
    state.camera.position.y = Math.cos(time * 0.3) * 0.08;
    state.camera.lookAt(0, -0.15, 0);
  });
  return null;
}

export default function Speaker3DCanvas({ hovered }: { hovered: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.9} color="#fffbee" />
      <directionalLight position={[2, 4, 3]} intensity={1.6} color="#fff5df" castShadow />
      <directionalLight position={[-2, 1, -1]} intensity={0.4} color="#d97706" />
      <pointLight position={[0, -0.8, 1.5]} intensity={0.5} color="#ea580c" />

      <VolumetricBacklight />
      <FloatingGoldParticles count={30} />

      <group position={[0, -0.15, 0]}>
        <StandingSpeaker hovered={hovered} />
        <StylizedSheikh hovered={hovered} />
      </group>

      <CameraController />
    </Canvas>
  );
}
