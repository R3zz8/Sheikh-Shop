'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface PalmTrunkProps {
    position?: [number, number, number];
}

export function PalmTrunk({ position = [0, 0, 0] }: PalmTrunkProps) {
  const trunkRef = useRef<THREE.Mesh>(null);

  // Subtle trunk swaying animation
  useFrame((state) => {
    if (trunkRef.current) {
      trunkRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Main trunk */}
      <Cylinder
        ref={trunkRef}
        args={[0.3, 0.4, 6, 8]}
        position={[0, 3, 0]}
        castShadow
        receiveShadow
      >
        <MeshWobbleMaterial
          color="#8B4513"
          factor={0.1}
          speed={0.5}
          roughness={0.8}
          metalness={0.1}
        />
      </Cylinder>

      {/* Trunk texture details - bark rings */}
      {[...Array(8)].map((_, i) => (
        <Cylinder
          key={i}
          args={[0.31, 0.31, 0.1, 8]}
          position={[0, 0.5 + i * 0.7, 0]}
          castShadow
        >
          <MeshWobbleMaterial
            color="#654321"
            factor={0.05}
            speed={0.3}
            roughness={0.9}
            metalness={0.05}
          />
        </Cylinder>
      ))}

      {/* Base of the trunk - wider section */}
      <Cylinder
        args={[0.5, 0.6, 1, 8]}
        position={[0, 0.5, 0]}
        castShadow
        receiveShadow
      >
        <MeshWobbleMaterial
          color="#654321"
          factor={0.08}
          speed={0.4}
          roughness={0.8}
          metalness={0.1}
        />
      </Cylinder>
    </group>
  );
}
