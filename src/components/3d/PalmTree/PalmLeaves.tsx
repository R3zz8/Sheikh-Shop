'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, MeshWobbleMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

export function PalmLeaves() {
    const leavesGroupRef = useRef<THREE.Group>(null);

    // Leaf swaying animation
    useFrame((state) => {
        if (leavesGroupRef.current) {
            leavesGroupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
        }
    });

    // Generate multiple palm fronds
    const fronds = useMemo(() => {
        return [...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 0.8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const rotationY = angle;
            const height = 2 + Math.random() * 0.5;
            const width = 0.1 + Math.random() * 0.05;

            return {
                position: [x, height / 2, z] as [number, number, number],
                rotation: [0, rotationY, 0] as [number, number, number],
                height,
                width,
                delay: i * 0.1
            };
        });
    }, []);

    return (
        <group ref={leavesGroupRef}>
            {fronds.map((frond, index) => (
                <Float
                    key={index}
                    speed={1.5}
                    rotationIntensity={0.5}
                    floatIntensity={0.5}
                    floatingRange={[0, 0.1]}
                >
                    <Cylinder
                        args={[frond.width, frond.width * 0.3, frond.height, 6]}
                        position={frond.position}
                        rotation={frond.rotation}
                        castShadow
                    >
                        <MeshWobbleMaterial
                            color="#228B22"
                            factor={0.2}
                            speed={0.8}
                            roughness={0.3}
                            metalness={0.1}
                        />
                    </Cylinder>
                </Float>
            ))}

            {/* Center cluster of smaller leaves */}
            <group position={[0, 0.5, 0]}>
                {[...Array(6)].map((_, i) => (
                    <Cylinder
                        key={`center-${i}`}
                        args={[0.05, 0.02, 1.5, 4]}
                        position={[0, 0.75, 0]}
                        rotation={[0, (i / 6) * Math.PI * 2, 0]}
                        castShadow
                    >
                        <MeshWobbleMaterial
                            color="#32CD32"
                            factor={0.3}
                            speed={1}
                            roughness={0.2}
                            metalness={0.05}
                        />
                    </Cylinder>
                ))}
            </group>
        </group>
    );
} 