'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    PresentationControls,
    AdaptiveDpr,
    AdaptiveEvents,
    Preload
} from '@react-three/drei';
import * as THREE from 'three';
import { PalmLeaves } from './PalmLeaves';
import { PalmTrunk } from './PalmTrunk';
import { DateFruits } from './DateFruits';
import { DesertEnvironment } from './DesertEnvironment';

interface PalmTreeProps {
    position?: [number, number, number];
    scale?: number;
    autoRotate?: boolean;
    enableControls?: boolean;
    intensity?: number;
}

export function PalmTree({
    position = [0, 0, 0],
    scale = 1,
    autoRotate = true,
    enableControls = false,
    intensity = 1
}: PalmTreeProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Simple animation loop
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {/* Ambient lighting for warm desert feel */}
            <ambientLight intensity={0.4 * intensity} color="#fef3c7" />

            {/* Main directional light simulating sun */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={0.8 * intensity}
                color="#fbbf24"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />

            {/* Warm fill light for golden hour effect */}
            <directionalLight
                position={[-5, 5, -5]}
                intensity={0.3 * intensity}
                color="#f59e0b"
            />

            {/* Palm Trunk */}
            <PalmTrunk position={[0, 0, 0]} />

            {/* Animated Palm Leaves */}
            <group position={[0, 3, 0]}>
                <PalmLeaves />
            </group>

            {/* Floating Date Fruits with glow effect */}
            <group position={[0, 2.5, 0]}>
                <DateFruits />
            </group>

            {/* Desert environment with sand and atmosphere */}
            <DesertEnvironment />

            {/* Camera controls for interaction */}
            {enableControls && (
                <PresentationControls
                    global
                    rotation={[0, -Math.PI / 4, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate={autoRotate}
                        autoRotateSpeed={0.5}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 3}
                    />
                </PresentationControls>
            )}

            {/* Performance optimizations */}
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <Preload all />
        </group>
    );
} 