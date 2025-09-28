'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Smartphone, 
  Monitor, 
  Loader2, 
  AlertTriangle, 
  CheckCircle,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import type { ProductsWithImages } from '@/types';
import { createARManager } from '@/lib/ar/ar-manager';

interface ModelViewerProps {
  product: ProductsWithImages;
  onClose?: () => void;
  className?: string;
}

export default function ModelViewer({ 
  product, 
  onClose, 
  className = '' 
}: ModelViewerProps) {
  const [arManager] = useState(() => createARManager());
  const [arSupported, setArSupported] = useState(false);
  const [arImplementation, setArImplementation] = useState<string>('unsupported');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'ar'>('3d');
  const [isARSessionActive, setIsARSessionActive] = useState(false);

  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    // Check AR support
    const supported = arManager.isARSupported();
    const implementation = arManager.getARImplementation();
    
    setArSupported(supported);
    setArImplementation(implementation);
    setIsLoading(false);
  }, [arManager]);

  const handleARStart = async () => {
    try {
      setIsLoading(true);
      await arManager.startARSession(product.id, 'PRODUCT_PREVIEW');
      setIsARSessionActive(true);
      
      // For iOS AR Quick Look
      if (arImplementation === 'quicklook') {
        const quickLookUrl = arManager.getARQuickLookUrl(`/models/${product.id}.usdz`);
        window.open(quickLookUrl, '_blank');
      }
      
      // For Android Scene Viewer
      if (arImplementation === 'sceneviewer') {
        const sceneViewerUrl = arManager.getSceneViewerUrl(
          `/models/${product.id}.glb`, 
          product.name
        );
        window.location.href = sceneViewerUrl;
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

  const handleModelLoad = () => {
    console.log('3D model loaded successfully');
  };

  const handleModelError = () => {
    setError('Failed to load 3D model');
  };

  if (isLoading) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
          <p className="text-gray-600">Loading 3D viewer...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="text-red-600 mb-2">3D Model Error</p>
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

      {/* 3D Model Viewer */}
      <div className="w-full h-full">
        {/* Fallback for devices without model-viewer support */}
        {typeof window !== 'undefined' && !window.customElements?.get('model-viewer') ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].image}
                    alt={product.name}
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
        ) : (
          <model-viewer
            ref={modelViewerRef}
            src={`/models/${product.id}.glb`}
            alt={product.name}
            auto-rotate
            camera-controls
            touch-action="pan-y"
            onload={handleModelLoad}
            onerror={handleModelError}
            style={{ width: '100%', height: '100%' }}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ios-src={`/models/${product.id}.usdz`}
            poster={`/models/${product.id}-poster.jpg`}
          >
            {/* Loading indicator */}
            <div slot="poster" className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-gray-600">Loading 3D model...</p>
              </div>
            </div>
          </model-viewer>
        )}
      </div>

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
            {arSupported && (
              <>
                <span>•</span>
                <span>Tap AR to view in space</span>
              </>
            )}
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

      {/* Device Support Info */}
      {!arSupported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-4 right-4 z-10"
        >
          <div className="bg-yellow-500/90 text-white p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>AR not supported on this device - 3D view available</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
