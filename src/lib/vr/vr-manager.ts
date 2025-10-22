
import type { ProductsWithImages } from '@/types';

export interface VRStoreVisit {
  id: string;
  userId?: string;
  duration: number;
  categoriesVisited: string[];
  productsViewed: string[];
  interactions: number;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  endedAt?: Date;
}

export interface VRStoreData {
  id: string;
  name: string;
  description: string;
  categories: VRCategory[];
  products: VRProduct[];
  environment: VREnvironment;
}

export interface VRCategory {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  hotspot: {
    position: { x: number; y: number; z: number };
    radius: number;
  };
  products: string[]; // Product IDs
}

export interface VRProduct {
  id: string;
  name: string;
  category: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  modelUrl: string;
  price: number;
  isARReady: boolean;
  isVRReady: boolean;
}

export interface VREnvironment {
  skybox: string;
  lighting: {
    ambient: { r: number; g: number; b: number };
    directional: { r: number; g: number; b: number; intensity: number };
  };
  floor: {
    texture: string;
    size: { x: number; z: number };
  };
  walls: {
    texture: string;
    height: number;
  };
}

export class VRManager {
  private isSupported: boolean = false;
  private currentVisit: VRStoreVisit | null = null;
  private visitStartTime: number = 0;
  private visitedCategories: Set<string> = new Set();
  private viewedProducts: Set<string> = new Set();
  private interactions: number = 0;

  constructor() {
    this.checkVRSupport();
  }

  // Check if VR is supported on the current device
  private checkVRSupport(): void {
    if (typeof window === 'undefined') return;

    // Check for WebXR support
    if ('xr' in navigator) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        this.isSupported = supported;
      });
    }

    // Check for A-Frame support
    if (typeof window !== 'undefined' && window.AFRAME) {
      this.isSupported = true;
    }
  }

  // Get VR support status
  isVRSupported(): boolean {
    return this.isSupported;
  }

  // Start VR store visit
  async startVRVisit(userId?: string): Promise<boolean> {
    if (!this.isSupported) {
      throw new Error('VR is not supported on this device');
    }

    this.visitStartTime = Date.now();
    this.visitedCategories.clear();
    this.viewedProducts.clear();
    this.interactions = 0;

    this.currentVisit = {
      id: `vr_visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      duration: 0,
      categoriesVisited: [],
      productsViewed: [],
      interactions: 0,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      ipAddress: await this.getIPAddress(),
      createdAt: new Date(),
    };

    return true;
  }

  // End VR store visit
  endVRVisit(): VRStoreVisit | null {
    if (!this.currentVisit) return null;

    const visit = {
      ...this.currentVisit,
      duration: Math.floor((Date.now() - this.visitStartTime) / 1000),
      categoriesVisited: Array.from(this.visitedCategories),
      productsViewed: Array.from(this.viewedProducts),
      interactions: this.interactions,
      endedAt: new Date(),
    };

    this.currentVisit = null;
    this.visitedCategories.clear();
    this.viewedProducts.clear();
    this.interactions = 0;

    return visit;
  }

  // Track category visit
  trackCategoryVisit(categoryId: string): void {
    this.visitedCategories.add(categoryId);
    this.trackInteraction();
  }

  // Track product view
  trackProductView(productId: string): void {
    this.viewedProducts.add(productId);
    this.trackInteraction();
  }

  // Track interaction
  trackInteraction(): void {
    this.interactions++;
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

  // Generate VR store data from products
  generateVRStoreData(products: ProductsWithImages[]): VRStoreData {
    const categories = this.generateVRCategories(products);
    const vrProducts = this.generateVRProducts(products);
    
    return {
      id: 'sheikh_shop_vr',
      name: 'Sheikh Shop VR Store',
      description: 'Immersive VR shopping experience for premium products',
      categories,
      products: vrProducts,
      environment: this.generateVREnvironment(),
    };
  }

  // Generate VR categories
  private generateVRCategories(products: ProductsWithImages[]): VRCategory[] {
    const categoryMap = new Map<string, ProductsWithImages[]>();
    
    // Group products by category
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, []);
      }
      categoryMap.get(product.category)!.push(product);
    });

    const categories: VRCategory[] = [];
    const positions = [
      { x: -5, y: 0, z: 0 },   // Left
      { x: 0, y: 0, z: -5 },   // Front
      { x: 5, y: 0, z: 0 },    // Right
      { x: 0, y: 0, z: 5 },    // Back
    ];

    let index = 0;
    categoryMap.forEach((categoryProducts, categoryName) => {
      const position = positions[index % positions.length];
      
      categories.push({
        id: `category_${categoryName.toLowerCase()}`,
        name: categoryName,
        position: position || { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        hotspot: {
          position: { x: position?.x || 0, y: 1.5, z: position?.z || 0 },
          radius: 2,
        },
        products: categoryProducts.map(p => p.id),
      });
      
      index++;
    });

    return categories;
  }

  // Generate VR products
  private generateVRProducts(products: ProductsWithImages[]): VRProduct[] {
    return products.map((product, index) => {
      // Distribute products in a grid around the store
      const gridSize = Math.ceil(Math.sqrt(products.length));
      const x = (index % gridSize) * 2 - (gridSize - 1);
      const z = Math.floor(index / gridSize) * 2 - (gridSize - 1);

      return {
        id: product.id,
        name: product.name,
        category: product.category,
        position: { x, y: 1, z },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        modelUrl: `/models/${product.id}.glb`,
        price: product.basePrice,
        isARReady: true,
        isVRReady: true,
      };
    });
  }

  // Generate VR environment
  private generateVREnvironment(): VREnvironment {
    return {
      skybox: '/textures/skybox.jpg',
      lighting: {
        ambient: { r: 0.4, g: 0.4, b: 0.4 },
        directional: { r: 1, g: 1, b: 1, intensity: 0.8 },
      },
      floor: {
        texture: '/textures/floor.jpg',
        size: { x: 20, z: 20 },
      },
      walls: {
        texture: '/textures/wall.jpg',
        height: 4,
      },
    };
  }

  // Get current visit
  getCurrentVisit(): VRStoreVisit | null {
    return this.currentVisit;
  }

  // Get visit statistics
  getVisitStats(): {
    duration: number;
    categoriesVisited: number;
    productsViewed: number;
    interactions: number;
  } {
    const duration = this.currentVisit 
      ? Math.floor((Date.now() - this.visitStartTime) / 1000)
      : 0;

    return {
      duration,
      categoriesVisited: this.visitedCategories.size,
      productsViewed: this.viewedProducts.size,
      interactions: this.interactions,
    };
  }

  // Reset VR manager
  reset(): void {
    this.currentVisit = null;
    this.visitStartTime = 0;
    this.visitedCategories.clear();
    this.viewedProducts.clear();
    this.interactions = 0;
  }
}

// Factory function
export function createVRManager(): VRManager {
  return new VRManager();
}
