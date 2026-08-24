"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// 1. Stylized Premium 3D Sheikh Character inside React Three Fiber
function Sheikh3DCharacter({ mouseX, mouseY, prefersReducedMotion }: { mouseX: number; mouseY: number; prefersReducedMotion: boolean }) {
  const characterGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftBishtRef = useRef<THREE.Mesh>(null);
  const rightBishtRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (!prefersReducedMotion && characterGroupRef.current) {
      // Elegant, very slow floating motion (sinusoidal)
      characterGroupRef.current.position.y = Math.sin(time * 1.5) * 0.12;

      // Small breathing animation (subtle scale pulsation)
      const breathScale = 1.0 + Math.sin(time * 2.0) * 0.008;
      characterGroupRef.current.scale.set(breathScale, breathScale, breathScale);

      // Mouse movement interactive rotation (limited to a few degrees)
      const targetRotY = mouseX * 0.35;
      const targetRotX = mouseY * 0.2;
      characterGroupRef.current.rotation.y += (targetRotY - characterGroupRef.current.rotation.y) * 0.08;
      characterGroupRef.current.rotation.x += (targetRotX - characterGroupRef.current.rotation.x) * 0.08;
    }

    if (!prefersReducedMotion) {
      // Subtle cloth/Bisht flutter simulation using sine waves
      if (leftBishtRef.current) {
        leftBishtRef.current.rotation.z = Math.sin(time * 1.2) * 0.015 - 0.05;
      }
      if (rightBishtRef.current) {
        rightBishtRef.current.rotation.z = Math.cos(time * 1.2) * 0.015 + 0.05;
      }
      // Extremely subtle head tilt
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.02;
      }
    }
  });

  return (
    <group ref={characterGroupRef}>
      {/* 3D Core Model Group */}
      <group position={[0, -0.2, 0]}>
        {/* Face / Head (Sleek minimalist ivory material) */}
        <mesh ref={headRef} position={[0, 0.58, 0]}>
          <sphereGeometry args={[0.22, 32, 32]} />
          <meshStandardMaterial
            color="#fffcf7"
            roughness={0.25}
            metalness={0.05}
          />
        </mesh>

        {/* Minimalist styled Beard */}
        <mesh position={[0, 0.48, 0.13]}>
          <boxGeometry args={[0.16, 0.09, 0.16]} />
          <meshStandardMaterial
            color="#1d1510"
            roughness={0.8}
            metalness={0.0}
          />
        </mesh>

        {/* Subtle, welcoming Smile curve */}
        <mesh position={[0, 0.53, 0.211]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.032, 0.005, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1d1510" roughness={0.5} />
        </mesh>

        {/* Keffiyeh Main Cap Cover (Ivory Silk draped headpiece) */}
        <mesh position={[0, 0.65, -0.02]}>
          <sphereGeometry args={[0.235, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>

        {/* Keffiyeh Draped Scarf Sides (White cloth flowing over shoulders) */}
        <mesh position={[0, 0.28, -0.04]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.235, 0.38, 0.65, 16, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.4}
            metalness={0.0}
          />
        </mesh>

        {/* Traditional black & gold Agal (Dual cords securing Keffiyeh) */}
        <mesh position={[0, 0.76, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.015, 8, 64]} />
          <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.74, 0.01]} rotation={[Math.PI / 2 + 0.05, 0, 0]}>
          <torusGeometry args={[0.184, 0.01, 8, 64]} />
          <meshStandardMaterial color="#d97706" roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Thobe (Premium ivory-white traditional long gown) */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.2, 0.38, 1.25, 32]} />
          <meshStandardMaterial
            color="#fffdfa"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Elegant gold embroidery front collar detail (Zari trim) */}
        <mesh position={[0, 0.12, 0.21]}>
          <boxGeometry args={[0.02, 0.32, 0.01]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Bisht (Royal outer dark cloak with gold lining) */}
        {/* Back cloak shell */}
        <mesh position={[0, -0.38, -0.05]}>
          <cylinderGeometry args={[0.24, 0.43, 1.2, 32, 1, true, -Math.PI / 2, Math.PI]} />
          <meshStandardMaterial
            color="#14110e"
            roughness={0.55}
            metalness={0.15}
          />
        </mesh>

        {/* Left Bisht draped side */}
        <mesh ref={leftBishtRef} position={[-0.17, -0.32, 0.08]} rotation={[0, 0.1, -0.05]}>
          <boxGeometry args={[0.055, 0.95, 0.045]} />
          <meshStandardMaterial color="#14110e" roughness={0.55} />
        </mesh>
        {/* Left gold border */}
        <mesh position={[-0.145, -0.32, 0.1]} rotation={[0, 0.1, -0.05]}>
          <boxGeometry args={[0.012, 0.95, 0.015]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Right Bisht draped side */}
        <mesh ref={rightBishtRef} position={[0.17, -0.32, 0.08]} rotation={[0, -0.1, 0.05]}>
          <boxGeometry args={[0.055, 0.95, 0.045]} />
          <meshStandardMaterial color="#14110e" roughness={0.55} />
        </mesh>
        {/* Right gold border */}
        <mesh position={[0.145, -0.32, 0.1]} rotation={[0, -0.1, 0.05]}>
          <boxGeometry args={[0.012, 0.95, 0.015]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Left Welcoming Hand/Arm Gesture */}
        <group position={[0.28, -0.08, 0.15]} rotation={[-0.15, -0.35, 0.22]}>
          {/* Inner arm sleeve */}
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.045, 0.28, 16]} />
            <meshStandardMaterial color="#fffdfa" roughness={0.35} />
          </mesh>
          {/* Sleeve outer gold trim */}
          <mesh position={[0, -0.13, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.042, 0.007, 8, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Welcoming stylized organic palm mesh */}
          <mesh position={[0, -0.18, 0.045]} rotation={[0, 0.25, 0]}>
            <boxGeometry args={[0.045, 0.075, 0.015]} />
            <meshStandardMaterial color="#fffcf7" roughness={0.25} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// 2. Soft Golden Floating Particles in 3D canvas
function FloatingGoldParticles({ count = 35 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positionArray = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 5.5; // X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5; // Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3; // Z
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
      const z = positions[idx + 2];

      if (x !== undefined && y !== undefined && z !== undefined) {
        // Rising motion
        const nextY = y + 0.004;

        // Swaying motion
        const nextX = x + Math.sin(time + i) * 0.0025;

        // Reset when particle floats too high
        if (nextY > 2.2) {
          positions[idx + 1] = -2.2;
          positions[idx] = (Math.random() - 0.5) * 5.5;
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
        color="#fcd34d"
        size={0.065}
        transparent
        opacity={0.65}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3. Volumetric Backlighting Ring / Aura
function VolumetricBacklight() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1.25]}>
      <planeGeometry args={[3.2, 3.2]} />
      <meshBasicMaterial
        color="#ea580c"
        transparent
        opacity={0.16}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

interface Sheikh3DCanvasProps {
  mouseX: number;
  mouseY: number;
  prefersReducedMotion: boolean;
}

export default function Sheikh3DCanvas({ mouseX, mouseY, prefersReducedMotion }: Sheikh3DCanvasProps) {
  return (
    <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] relative z-10 pointer-events-auto overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 4.0], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        className="w-full h-full"
      >
        {/* Immersive Studio Ambient Lights */}
        <ambientLight intensity={0.8} color="#fff8e7" />
        <directionalLight position={[3, 5, 4]} intensity={1.5} color="#fff3db" castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.5} color="#d97706" />
        <pointLight position={[0, -1, 2]} intensity={0.4} color="#f59e0b" />

        {/* Soft Ambient Volumetric backlighting behind character */}
        <VolumetricBacklight />

        {/* Floating golden dust particles */}
        <FloatingGoldParticles count={45} />

        {/* 3D Premium Sheikh Character Model */}
        <Sheikh3DCharacter
          mouseX={mouseX}
          mouseY={mouseY}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Orbit control fallback to allow tiny, safe interactions if they touch/drag */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.2}
          maxAzimuthAngle={Math.PI / 8}
          minAzimuthAngle={-Math.PI / 8}
        />
      </Canvas>
    </div>
  );
}
