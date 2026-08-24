'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
          <meshStandardMaterial color="#b45309" metalness={0.7} roughness={0.2} />
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

// 3D Particles
function AmbientGoldParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 30;

  const positions = React.useMemo(() => {
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

export default function RoyalShowcasePusherCanvas({ isPushing }: { isPushing: boolean }) {
  return (
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
  );
}
