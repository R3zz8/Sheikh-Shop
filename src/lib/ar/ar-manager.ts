import type { ProductsWithImages } from '@/types';

export interface ARSessionData {
  id: string;
  userId?: string;
  productId?: string;
  sessionType: 'PRODUCT_PREVIEW' | 'TRY_ON' | 'ROOM_PLACEMENT' | 'QUICK_LOOK';
  duration: number;
  interactions: number;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  endedAt?: Date;
}

export interface ARProductData {
  id: string;
  name: string;
  modelUrl: string;
  modelType: 'GLTF' | 'GLB' | 'OBJ' | 'FBX' | 'USDZ';
  isARReady: boolean;
  isVRReady: boolean;
  scale: { x: number; y: number; z: number };
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

export class ARManager {
  private isSupported: boolean = false;
  private currentSession: ARSessionData | null = null;
  private sessionStartTime: number = 0;

  constructor() {
    this.checkARSupport();
  }

  // Check if AR is supported on the current device
  private checkARSupport(): void {
    if (typeof window === 'undefined') return;

    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
        this.isSupported = supported;
      });
    }

    // Check for iOS AR Quick Look support
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      this.isSupported = true;
    }

    // Check for Android Scene Viewer support
    if (/Android/.test(navigator.userAgent)) {
      this.isSupported = true;
    }
  }

  // Get AR support status
  isARSupported(): boolean {
    return this.isSupported;
  }

  // Start AR session
  async startARSession(
    productId: string,
    sessionType: ARSessionData['sessionType'],
    userId?: string
  ): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('AR is not supported on this device');
    }

    this.sessionStartTime = Date.now();
    this.currentSession = {
      id: `ar_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      productId,
      sessionType,
      duration: 0,
      interactions: 0,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      ipAddress: await this.getIPAddress(),
      createdAt: new Date(),
    };

    return true;
  }

  // End AR session
  endARSession(): ARSessionData | null {
    if (!this.currentSession) return null;

    const session = {
      ...this.currentSession,
      duration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      endedAt: new Date(),
    };

    this.currentSession = null;
    return session;
  }

  // Track AR interaction
  trackInteraction(): void {
    if (this.currentSession) {
      this.currentSession.interactions++;
    }
  }

  // Get device type
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    if (/Windows/.test(userAgent)) return 'windows';
    if (/Mac/.test(userAgent)) return 'mac';
    if (/Linux/.test(userAgent)) return 'linux';
    return 'unknown';
  }

  // Get IP address (simplified)
  private async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  // Generate AR product data
  generateARProductData(product: ProductsWithImages): ARProductData {
    // Default scale, position, and rotation for different product categories
    const categoryDefaults = {
      HONEY: {
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      SAFFRON: {
        scale: { x: 0.5, y: 0.5, z: 0.5 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      DATES: {
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
      OTHERS: {
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
      },
    };

    const defaults = categoryDefaults[product.category] || categoryDefaults.OTHERS;

    return {
      id: product.id,
      name: product.name,
      modelUrl: this.generateModelUrl(product),
      modelType: 'GLTF', // Default to GLTF, can be overridden
      isARReady: true,
      isVRReady: true,
      ...defaults,
    };
  }

  // Generate model URL (placeholder - in real implementation, this would come from database)
  private generateModelUrl(product: ProductsWithImages): string {
    // For now, return a placeholder URL
    // In real implementation, this would be stored in Product3DModel table
    return `/models/${product.id}.gltf`;
  }

  // Get AR Quick Look URL for iOS
  getARQuickLookUrl(modelUrl: string): string {
    return `https://developer.apple.com/ar/quick-look/3d/${encodeURIComponent(modelUrl)}`;
  }

  // Get Scene Viewer URL for Android
  getSceneViewerUrl(modelUrl: string, productName: string): string {
    const intent = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrl)}&mode=ar_only&title=${encodeURIComponent(productName)}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end;`;
    return intent;
  }

  // Check if device supports AR Quick Look
  supportsARQuickLook(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // Check if device supports Scene Viewer
  supportsSceneViewer(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  }

  // Get AR implementation method for current device
  getARImplementation(): 'webxr' | 'quicklook' | 'sceneviewer' | 'unsupported' {
    if (typeof window === 'undefined') return 'unsupported';

    if (this.supportsARQuickLook()) return 'quicklook';
    if (this.supportsSceneViewer()) return 'sceneviewer';
    if ('xr' in navigator) return 'webxr';
    
    return 'unsupported';
  }

  // Get current session
  getCurrentSession(): ARSessionData | null {
    return this.currentSession;
  }

  // Reset AR manager
  reset(): void {
    this.currentSession = null;
    this.sessionStartTime = 0;
  }
}

// Factory function
export function createARManager(): ARManager {
  return new ARManager();
}
