'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html as ThreeHtml } from '@react-three/drei';
import * as THREE from 'three';

interface LuxuryGiftBoxSceneProps {
  status: 'closed' | 'opening' | 'open';
  product: {
    id: string;
    name: string;
    slug?: string | null;
    basePrice: number;
    images?: Array<{ image?: string | null; secureUrl?: string | null }> | null;
  };
  config: {
    animationSpeed?: number;
    particleDensity?: number;
    lightIntensity?: number;
    cameraDistance?: number;
    ribbonColor?: string;
    goldenGlow?: string;
    backgroundStyle?: string;
    openingDuration?: number;
    featuredProductMode?: string;
  };
  onAnimationComplete?: () => void;
}

export default function LuxuryGiftBoxScene({
  status,
  product,
  config,
  onAnimationComplete,
}: LuxuryGiftBoxSceneProps) {
  const { camera } = useThree();

  const animationSpeed = config.animationSpeed ?? 1.0;
  const particleDensity = config.particleDensity ?? 1.0;
  const lightIntensity = config.lightIntensity ?? 1.0;
  const cameraDistance = config.cameraDistance ?? 5.0;
  const ribbonColorHex = config.ribbonColor ?? '#d97706';
  const goldenGlowHex = config.goldenGlow ?? '#f59e0b';

  // Refs for animation
  const lidRef = useRef<THREE.Group>(null);
  const lockRef = useRef<THREE.Mesh>(null);
  const ribbonRef = useRef<THREE.Group>(null);
  const pedestalRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // States
  const [openProgress, setOpenProgress] = useState(0); // 0 (closed) to 1 (fully open)
  const [completeCalled, setCompleteCalled] = useState(false);

  // Product Image
  const productImg = product.images && product.images.length > 0
    ? product.images[0]?.secureUrl || product.images[0]?.image || '/noImage.jpg'
    : '/noImage.jpg';

  // Initialize particles positions
  const particleCount = Math.floor(60 * particleDensity);
  const particlesData = useRef<{ pos: THREE.Vector3; speed: number; angle: number; radius: number }[]>([]);

  useEffect(() => {
    const data = [];
    for (let i = 0; i < particleCount; i++) {
      data.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          -0.2 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.8
        ),
        speed: 0.2 + Math.random() * 0.4,
        angle: Math.random() * Math.PI * 2,
        radius: 0.1 + Math.random() * 0.3,
      });
    }
    particlesData.current = data;
  }, [particleCount]);

  useFrame((state, delta) => {
    const step = delta * animationSpeed * 0.6;

    // Camera rig smoothly zooming and orbiting slowly
    if (status === 'closed') {
      // Slow background rotation
      const t = state.clock.getElapsedTime() * 0.15;
      const targetCamX = Math.sin(t) * cameraDistance * 1.1;
      const targetCamZ = Math.cos(t) * cameraDistance * 1.1;
      camera.position.x += (targetCamX - camera.position.x) * 0.05;
      camera.position.y += (1.8 - camera.position.y) * 0.05;
      camera.position.z += (targetCamZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);
    } else if (status === 'opening' || status === 'open') {
      // Zoom into open look view
      const targetCamX = 0;
      const targetCamY = 1.2;
      const targetCamZ = cameraDistance * 0.85;
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(0, 0.4, 0);
    }

    // Unboxing steps progress
    if (status === 'opening') {
      if (openProgress < 1) {
        const nextProgress = Math.min(1, openProgress + step);
        setOpenProgress(nextProgress);

        if (nextProgress >= 1 && !completeCalled) {
          setCompleteCalled(true);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }
      }
    } else if (status === 'open') {
      if (openProgress < 1) {
        setOpenProgress(1);
      }
    } else if (status === 'closed') {
      if (openProgress > 0) {
        setOpenProgress(0);
        setCompleteCalled(false);
      }
    }

    // Apply animation parameters based on openProgress (0 to 1)

    // 1. Lock drops down and pivots open
    if (lockRef.current) {
      lockRef.current.position.y = -0.05 - openProgress * 0.25;
      lockRef.current.rotation.x = openProgress * Math.PI * 0.4;
    }

    // 2. Ribbon unties (slides to sides or fades in size)
    if (ribbonRef.current) {
      ribbonRef.current.scale.setScalar(Math.max(0.001, 1 - openProgress * 1.2));
    }

    // 3. Lid slowly opens around back hinge
    // Pivot is located at [0, 0.4, -0.45] (back top edge of the box bottom)
    if (lidRef.current) {
      // Rotates backward on X axis
      lidRef.current.rotation.x = -openProgress * Math.PI * 0.72;
      // Offset position to keep the hinge aligned
      lidRef.current.position.z = -0.45 + Math.sin(openProgress * Math.PI * 0.72) * 0.05;
      lidRef.current.position.y = 0.4 + (1 - Math.cos(openProgress * Math.PI * 0.72)) * 0.05;
    }

    // 4. Volumetric glow light intensifies
    if (glowLightRef.current) {
      glowLightRef.current.intensity = openProgress * 8 * lightIntensity;
    }

    // 5. Pedestal rises and spins
    if (pedestalRef.current) {
      // Rises from deep inside base (-0.35) to elegant height (0.55)
      pedestalRef.current.position.y = -0.35 + openProgress * 0.9;
      // Gentle floating levitation
      if (openProgress >= 0.95) {
        const bounce = Math.sin(state.clock.getElapsedTime() * 2) * 0.04;
        pedestalRef.current.position.y += bounce;
      }
      // Gentle rotational movement
      pedestalRef.current.rotation.y = state.clock.getElapsedTime() * 0.45;
    }

    // 6. Particles system rising out
    if (particlesRef.current && particlesData.current.length > 0) {
      const geo = particlesRef.current.geometry;
      const posAttr = geo.attributes.position;
      if (posAttr && posAttr.array) {
        const positions = posAttr.array as Float32Array;

        particlesData.current.forEach((p, idx) => {
          // Only float up if box is opening or open
          if (openProgress > 0.1) {
            p.pos.y += delta * p.speed * openProgress;
            p.pos.x += Math.sin(state.clock.getElapsedTime() + idx) * 0.005;

            // Recycle if too high
            if (p.pos.y > 1.8) {
              p.pos.y = -0.2;
              p.pos.x = (Math.random() - 0.5) * 0.6;
              p.pos.z = (Math.random() - 0.5) * 0.6;
            }
          } else {
            // Stay inside box when closed
            p.pos.y = -0.15;
          }

          positions[idx * 3] = p.pos.x;
          positions[idx * 3 + 1] = p.pos.y;
          positions[idx * 3 + 2] = p.pos.z;
        });

        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <>
      {/* Ambient background setup */}
      <ambientLight intensity={0.45} />

      {/* Rim light for gold outline sparkle */}
      <directionalLight position={[0, 4, -4]} intensity={1.2} color="#ffffff" />

      {/* Front-right luxury golden key-light */}
      <directionalLight
        position={[3, 4, 3]}
        intensity={1.8}
        color="#fff1db"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* R3F OrbitControls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={12}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.55}
      />

      {/* ==================================================
          MAIN 3D GIFT BOX GROUP
          ================================================== */}
      <group position={[0, -0.4, 0]}>

        {/* A. BOX BOTTOM BASE [0.9m x 0.8m x 0.9m] */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.8, 1.0]} />
          {/* Deep dark brown chocolate leather texture */}
          <meshStandardMaterial
            color="#2a1813"
            roughness={0.7}
            metalness={0.15}
          />
        </mesh>

        {/* B. GOLD MARGINS ON THE BASE (Luxury golden edges) */}
        <group>
          {/* Top border gold trim */}
          <mesh position={[0, 0.402, 0]} castShadow>
            <boxGeometry args={[1.02, 0.02, 1.02]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Four corner golden pillars */}
          {[-0.51, 0.51].map((x, i) =>
            [-0.51, 0.51].map((z, j) => (
              <mesh key={`${i}-${j}`} position={[x, 0, z]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
              </mesh>
            ))
          )}
        </group>

        {/* C. RIBBONS (Cross overlay when box is closed) */}
        <group ref={ribbonRef}>
          {/* Horiz ribbon */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[1.04, 0.78, 0.16]} />
            <meshStandardMaterial color={ribbonColorHex} roughness={0.3} metalness={0.4} />
          </mesh>
          {/* Vert ribbon */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[0.16, 0.78, 1.04]} />
            <meshStandardMaterial color={ribbonColorHex} roughness={0.3} metalness={0.4} />
          </mesh>
        </group>

        {/* D. SHIELD GOLD LOCK ( buckles on front face of base ) */}
        <mesh ref={lockRef} position={[0, -0.05, 0.51]} castShadow>
          <boxGeometry args={[0.12, 0.14, 0.04]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* E. PIVOT-ANCHORED OPENING LID */}
        {/* Pivot hinge is positioned at [0, 0.4, -0.45] */}
        <group ref={lidRef} position={[0, 0.4, -0.45]}>
          <group position={[0, 0.1, 0.45]}>
            {/* Actual Lid Box */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.02, 0.2, 1.02]} />
              <meshStandardMaterial color="#22130f" roughness={0.65} metalness={0.1} />
            </mesh>

            {/* Lid Gold Trim Bottom */}
            <mesh position={[0, -0.102, 0]}>
              <boxGeometry args={[1.04, 0.02, 1.04]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>

            {/* Lid top engraved gold crown logo plate */}
            <mesh position={[0, 0.102, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.01, 32]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>

            {/* 3D simulated crown representation on top */}
            <group position={[0, 0.14, 0]}>
              <mesh castShadow>
                <torusGeometry args={[0.08, 0.015, 8, 24]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
              </mesh>
              <mesh position={[0, 0.03, 0]} castShadow>
                <coneGeometry args={[0.04, 0.08, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
              </mesh>
            </group>

            {/* Ribbon on the Lid */}
            <group>
              <mesh position={[0, 0.005, 0]}>
                <boxGeometry args={[1.05, 0.205, 0.165]} />
                <meshStandardMaterial color={ribbonColorHex} roughness={0.3} metalness={0.4} />
              </mesh>
              <mesh position={[0, 0.005, 0]}>
                <boxGeometry args={[0.165, 0.205, 1.05]} />
                <meshStandardMaterial color={ribbonColorHex} roughness={0.3} metalness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

        {/* F. INTERNAL VOLUMETRIC GLOW LIGHT SOURCE */}
        <pointLight
          ref={glowLightRef}
          position={[0, 0.1, 0]}
          color={goldenGlowHex}
          intensity={0}
          distance={3}
        />

        {/* G. PRODUCT PEDESTAL & PRODUCT IMAGE FLOATING RENDER */}
        <group ref={pedestalRef} position={[0, -0.35, 0]}>
          {/* Glass pedestal cylinder */}
          <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.2, 32]} />
            {/* Semi-transparent shiny glass with golden edges */}
            <meshPhysicalMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              transmission={0.8}
              roughness={0.15}
              ior={1.5}
            />
          </mesh>
          <mesh position={[0, 0.201, 0]}>
            <cylinderGeometry args={[0.345, 0.345, 0.01, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Golden support frame pillars */}
          {[-0.24, 0.24].map((x, i) =>
            [-0.24, 0.24].map((z, j) => (
              <mesh key={`p-${i}-${j}`} position={[x, 0, z]} castShadow>
                <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
                <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
              </mesh>
            ))
          )}

          {/* Floating Product Image inside HTML space */}
          <group position={[0, 0.58, 0]}>
            <ThreeHtml transform distanceFactor={1.5} scale={1.2}>
              <div
                className="w-32 h-32 relative select-none pointer-events-none filter drop-shadow-[0_8px_16px_rgba(251,191,36,0.35)]"
                dir="rtl"
              >
                {/* Immersive glassmorphic shadow backing the floating image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/30 scale-90 -z-10 animate-pulse" />
                <img
                  src={productImg}
                  alt={product.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.45)]"
                />
              </div>
            </ThreeHtml>
          </group>
        </group>

        {/* H. GOLD SPARKLES PARTICLES SYSTEM */}
        <points ref={particlesRef}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(particleCount * 3), 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            attach="material"
            color={goldenGlowHex}
            size={0.06}
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
          />
        </points>

      </group>
    </>
  );
}
