'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export function DateFruits() {
  const datesGroupRef = useRef<THREE.Group>(null);

  // Floating animation for dates
  useFrame((state) => {
    if (datesGroupRef.current) {
      datesGroupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  // Generate date fruit clusters
  const dateClusters = useMemo(() => {
    return [...Array(8)].map((_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 0.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 0.2 + Math.random() * 0.4;

      return {
        position: [x, y, z] as [number, number, number],
        size: 0.08 + Math.random() * 0.04,
        delay: i * 0.2,
      };
    });
  }, []);

  return (
    <group ref={datesGroupRef}>
      {/* Main date cluster */}
      <group position={[0, 0, 0]}>
        {dateClusters.map((cluster, index) => (
          <Float
            key={index}
            speed={2}
            rotationIntensity={1}
            floatIntensity={0.5}
            floatingRange={[0, 0.2]}
          >
            <Sphere
              args={[cluster.size, 8, 6]}
              position={cluster.position}
              castShadow
            >
              <MeshDistortMaterial
                color="#8B4513"
                factor={0.3}
                speed={2}
                roughness={0.4}
                metalness={0.2}
              />
            </Sphere>
          </Float>
        ))}
      </group>

      {/* Additional smaller dates scattered around */}
      {[...Array(12)].map((_, i) => (
        <Float
          key={`small-${i}`}
          speed={1.5}
          rotationIntensity={0.8}
          floatIntensity={0.3}
          floatingRange={[0, 0.15]}
        >
          <Sphere
            args={[0.04, 6, 4]}
            position={[
              (Math.random() - 0.5) * 1.5,
              Math.random() * 0.8,
              (Math.random() - 0.5) * 1.5,
            ]}
            castShadow
          >
            <MeshDistortMaterial
              color="#A0522D"
              factor={0.2}
              speed={1.5}
              roughness={0.5}
              metalness={0.1}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}
