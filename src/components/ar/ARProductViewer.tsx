'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  X, 
  Smartphone,
  Monitor,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html } from '@react-three/drei';
import type { ProductsWithImages } from '@/types';
import { createARManager, type ARProductData } from '@/lib/ar/ar-manager';

interface ARProductViewerProps {
  product: ProductsWithImages;
  onClose?: () => void;
  className?: string;
}

// 3D Model Component
function ProductModel({ productData }: { productData: ARProductData }) {
  const { scene } = useGLTF(productData.modelUrl);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (scene) {
      setIsLoaded(true);
    }
  }, [scene]);

  if (!isLoaded) {
    return (
      <Html center>
        <div className="flex items-center gap-2 text-white">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading 3D model...</span>
        </div>
      </Html>
    );
  }

  return (
    <primitive
      object={scene}
      scale={[productData.scale.x, productData.scale.y, productData.scale.z]}
      position={[productData.position.x, productData.position.y, productData.position.z]}
      rotation={[productData.rotation.x, productData.rotation.y, productData.rotation.z]}
    />
  );
}

// Fallback 2D Product View
function FallbackProductView({ product }: { product: ProductsWithImages }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]?.image || ''}
              alt={product.name || 'Product'}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-gray-400">No Image</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600">{product.description}</p>
      </div>
    </div>
  );
}

export default function ARProductViewer({ 
  product, 
  onClose, 
  className = '' 
}: ARProductViewerProps) {
  const [arManager] = useState(() => createARManager());
  const [arSupported, setArSupported] = useState(false);
  const [arImplementation, setArImplementation] = useState<string>('unsupported');
  const [isARSessionActive, setIsARSessionActive] = useState(false);
  const [arProductData, setArProductData] = useState<ARProductData | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'ar'>('3d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check AR support
    const supported = arManager.isARSupported();
    const implementation = arManager.getARImplementation();
    
    setArSupported(supported);
    setArImplementation(implementation);

    // Generate AR product data
    const productData = arManager.generateARProductData(product);
    setArProductData(productData);

    setIsLoading(false);
  }, [product, arManager]);

  const handleARStart = async () => {
    try {
      setIsLoading(true);
      await arManager.startARSession(product.id, 'PRODUCT_PREVIEW');
      setIsARSessionActive(true);
      
      // For iOS AR Quick Look
      if (arImplementation === 'quicklook') {
        const quickLookUrl = arManager.getARQuickLookUrl(arProductData?.modelUrl || '');
        window.open(quickLookUrl, '_blank');
      }
      
      // For Android Scene Viewer
      if (arImplementation === 'sceneviewer') {
        const sceneViewerUrl = arManager.getSceneViewerUrl(
          arProductData?.modelUrl || '', 
          product.name
        );
        window.location.href = sceneViewerUrl;
      }
      
      // For WebXR (desktop/VR headsets)
      if (arImplementation === 'webxr') {
        // WebXR implementation would go here
        console.log('WebXR AR session started');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start AR session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAREnd = () => {
    const session = arManager.endARSession();
    setIsARSessionActive(false);
    
    if (session) {
      // Send session data to backend
      console.log('AR session ended:', session);
    }
  };

  const handleInteraction = () => {
    arManager.trackInteraction();
  };

  if (isLoading) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
          <p className="text-gray-600">Loading AR viewer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 mb-2">AR Error</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{product.name}</h3>
            {arSupported && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className="flex items-center gap-2">
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

      {/* 3D Canvas */}
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      }>
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 0, 5], fov: 50 }}
          onPointerDown={handleInteraction}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="studio" />
          
          {arProductData && (
            <ProductModel productData={arProductData} />
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
      </Suspense>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === '3d' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            
            {arSupported && (
              <button
                onClick={handleARStart}
                disabled={isLoading || isARSessionActive}
                className={`p-2 rounded-lg transition-colors ${
                  isARSessionActive
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30 disabled:opacity-50'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-white text-sm">
            <span>Drag to rotate</span>
            <span>•</span>
            <span>Scroll to zoom</span>
          </div>
        </div>
      </div>

      {/* AR Status */}
      {isARSessionActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-4 right-4 z-10"
        >
          <div className="bg-green-500/90 text-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>AR session active - Point your camera at a flat surface</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fallback for unsupported devices */}
      {!arSupported && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FallbackProductView product={product} />
        </div>
      )}
    </div>
  );
}
