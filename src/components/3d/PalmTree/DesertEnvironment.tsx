'use client';

import React from 'react';
import { Plane, MeshWobbleMaterial, Environment, Lightformer } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function DesertEnvironment() {
    const { scene } = useThree();

    // Set fog properly using the scene
    React.useEffect(() => {
        scene.fog = new THREE.Fog('#fef3c7', 5, 30);
        return () => {
            scene.fog = null;
        };
    }, [scene]);

    return (
        <group>
            {/* Desert sand ground */}
            <Plane
                args={[20, 20]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
                receiveShadow
            >
                <MeshWobbleMaterial
                    color="#f4d03f"
                    factor={0.1}
                    speed={0.3}
                    roughness={0.8}
                    metalness={0.1}
                />
            </Plane>

            {/* Ambient environment lighting */}
            <Environment preset="sunset" background={false}>
                <Lightformer
                    intensity={0.5}
                    color="#fbbf24"
                    position={[10, 10, 5]}
                    scale={[10, 10, 1]}
                />
                <Lightformer
                    intensity={0.3}
                    color="#f59e0b"
                    position={[-10, -10, -5]}
                    scale={[10, 10, 1]}
                />
            </Environment>
        </group>
    );
} 