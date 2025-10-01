// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Headphones, 
  X, 
  RotateCcw, 
  Move, 
  Eye, 
  ShoppingCart,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Home,
  Star
} from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { createVRManager, type VRStoreData, type VRCategory, type VRProduct } from '@/lib/vr/vr-manager';

interface VRStoreProps {
  products: ProductsWithImages[];
  onClose?: () => void;
  onProductClick?: (product: ProductsWithImages) => void;
  className?: string;
}

// A-Frame Scene Component
function VRScene({ 
  storeData, 
  onCategoryClick, 
  onProductClick 
}: { 
  storeData: VRStoreData;
  onCategoryClick: (category: VRCategory) => void;
  onProductClick: (product: VRProduct) => void;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize A-Frame if not already loaded
    if (typeof window !== 'undefined' && !window.AFRAME) {
      const script = document.createElement('script');
      script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
      script.onload = () => {
        console.log('A-Frame loaded');
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div ref={sceneRef} className="w-full h-full">
      <a-scene
        vr-mode-ui="enabled: true"
        embedded
        style={{ width: '100%', height: '100%' }}
        background="color: #87CEEB"
        loading-screen="enabled: false"
      >
        {/* Assets */}
        <a-assets>
          <a-asset-item id="saffron-model" src="/models/saffron.glb"></a-asset-item>
          <a-asset-item id="honey-model" src="/models/honey.glb"></a-asset-item>
          <a-asset-item id="dates-model" src="/models/dates.glb"></a-asset-item>
          <a-asset-item id="other-model" src="/models/other.glb"></a-asset-item>
        </a-assets>

        {/* Camera */}
        <a-camera position="0 1.6 3" wasd-controls="enabled: true">
          <a-cursor></a-cursor>
        </a-camera>

        {/* Lighting */}
        <a-light type="ambient" color="#404040" intensity="0.4"></a-light>
        <a-light type="directional" position="2 4 2" color="#ffffff" intensity="0.8"></a-light>

        {/* Floor */}
        <a-plane
          position="0 0 0"
          rotation="-90 0 0"
          width="20"
          height="20"
          color="#8B4513"
          repeat="10 10"
        ></a-plane>

        {/* Category Hotspots */}
        {storeData.categories.map((category, index) => (
          <a-entity
            key={category.id}
            position={`${category.position.x} ${category.position.y} ${category.position.z}`}
            rotation={`${category.rotation.x} ${category.rotation.y} ${category.rotation.z}`}
            scale={`${category.scale.x} ${category.scale.y} ${category.scale.z}`}
          >
            {/* Category Display */}
            <a-box
              position="0 0 0"
              width="2"
              height="2"
              depth="0.2"
              color="#4A90E2"
              opacity="0.8"
              clickable
              onClick={() => onCategoryClick(category)}
            ></a-box>
            
            {/* Category Label */}
            <a-text
              position="0 1.5 0.1"
              value={category.name}
              align="center"
              color="#ffffff"
              width="4"
            ></a-text>

            {/* Hotspot Indicator */}
            <a-ring
              position="0 0.1 0"
              radius-inner="1.8"
              radius-outer="2"
              color="#FFD700"
              opacity="0.6"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 4000"
            ></a-ring>
          </a-entity>
        ))}

        {/* Product Displays */}
        {storeData.products.map((product, index) => (
          <a-entity
            key={product.id}
            position={`${product.position.x} ${product.position.y} ${product.position.z}`}
            rotation={`${product.rotation.x} ${product.rotation.y} ${product.rotation.z}`}
            scale={`${product.scale.x} ${product.scale.y} ${product.scale.z}`}
          >
            {/* Product Model */}
            <a-gltf-model
              src={`#${product.category.toLowerCase()}-model`}
              position="0 0 0"
              scale="0.5 0.5 0.5"
              clickable
              onClick={() => onProductClick(product)}
            ></a-gltf-model>

            {/* Product Info Panel */}
            <a-plane
              position="0 1.5 0"
              width="2"
              height="1"
              color="#000000"
              opacity="0.7"
            ></a-plane>
            
            <a-text
              position="0 1.5 0.01"
              value={product.name}
              align="center"
              color="#ffffff"
              width="2"
            ></a-text>
            
            <a-text
              position="0 1.2 0.01"
              value={`$${product.price}`}
              align="center"
              color="#FFD700"
              width="2"
            ></a-text>

            {/* Interaction Indicator */}
            <a-ring
              position="0 0 0"
              radius-inner="0.8"
              radius-outer="1"
              color="#00FF00"
              opacity="0.4"
              visible="false"
              className="interaction-indicator"
            ></a-ring>
          </a-entity>
        ))}

        {/* Store Welcome Sign */}
        <a-entity position="0 2 -8">
          <a-plane
            position="0 0 0"
            width="6"
            height="2"
            color="#2C3E50"
            opacity="0.9"
          ></a-plane>
          <a-text
            position="0 0.3 0.01"
            value="Sheikh Shop VR"
            align="center"
            color="#FFD700"
            width="6"
          ></a-text>
          <a-text
            position="0 -0.3 0.01"
            value="Premium Products"
            align="center"
            color="#ffffff"
            width="6"
          ></a-text>
        </a-entity>
      </a-scene>
    </div>
  );
}

export default function VRStore({ 
  products, 
  onClose, 
  onProductClick,
  className = '' 
}: VRStoreProps) {
  const [vrManager] = useState(() => createVRManager());
  const [vrSupported, setVrSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeData, setStoreData] = useState<VRStoreData | null>(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [visitStats, setVisitStats] = useState({
    duration: 0,
    categoriesVisited: 0,
    productsViewed: 0,
    interactions: 0,
  });

  useEffect(() => {
    // Check VR support
    const supported = vrManager.isVRSupported();
    setVrSupported(supported);

    // Generate store data
    const data = vrManager.generateVRStoreData(products);
    setStoreData(data);

    setIsLoading(false);
  }, [products, vrManager]);

  useEffect(() => {
    // Start VR visit
    if (isVRMode) {
      vrManager.startVRVisit();
    }

    // Update stats periodically
    const interval = setInterval(() => {
      const stats = vrManager.getVisitStats();
      setVisitStats(stats);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (isVRMode) {
        const visit = vrManager.endVRVisit();
        console.log('VR visit ended:', visit);
      }
    };
  }, [isVRMode, vrManager]);

  const handleCategoryClick = (category: VRCategory) => {
    vrManager.trackCategoryVisit(category.id);
    console.log('Category clicked:', category.name);
  };

  const handleProductClick = (product: VRProduct) => {
    vrManager.trackProductView(product.id);
    
    // Find the actual product data
    const actualProduct = products.find(p => p.id === product.id);
    if (actualProduct && onProductClick) {
      onProductClick(actualProduct);
    }
  };

  const handleVRToggle = () => {
    setIsVRMode(!isVRMode);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
          <p className="text-gray-600">Loading VR Store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 mb-2">VR Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-screen bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-6 h-6 text-amber-500" />
            <h2 className="text-white font-semibold">Sheikh Shop VR Store</h2>
            {vrSupported && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVRToggle}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isVRMode
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {isVRMode ? 'Exit VR' : 'Enter VR'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VR Scene */}
      {storeData && (
        <VRScene
          storeData={storeData}
          onCategoryClick={handleCategoryClick}
          onProductClick={handleProductClick}
        />
      )}

      {/* Stats Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-16 left-4 z-10 bg-black/50 text-white p-4 rounded-lg"
      >
        <h3 className="text-sm font-semibold mb-2">Visit Stats</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Duration:</span>
            <span>{formatDuration(visitStats.duration)}</span>
          </div>
          <div className="flex justify-between">
            <span>Categories:</span>
            <span>{visitStats.categoriesVisited}</span>
          </div>
          <div className="flex justify-between">
            <span>Products:</span>
            <span>{visitStats.productsViewed}</span>
          </div>
          <div className="flex justify-between">
            <span>Interactions:</span>
            <span>{visitStats.interactions}</span>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 right-4 z-10"
      >
        <div className="bg-black/50 text-white p-4 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Move className="w-4 h-4" />
              <span>WASD to move</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>Mouse to look</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              <span>Click to interact</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* VR Not Supported Message */}
      {!vrSupported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="bg-yellow-500/90 text-white p-6 rounded-lg text-center max-w-md">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">VR Not Supported</h3>
            <p className="text-sm">
              Your device doesn't support VR. You can still explore the 3D store using mouse and keyboard controls.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
