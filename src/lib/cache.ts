import { NextRequest, NextResponse } from 'next/server';

interface CacheConfig {
  maxAge: number; // Cache duration in seconds
  staleWhileRevalidate?: number; // Stale-while-revalidate duration in seconds
  tags?: string[]; // Cache tags for invalidation
  vary?: string[]; // Vary headers
}

interface CacheEntry {
  data: any;
  timestamp: number;
  maxAge: number;
  tags: string[];
  etag: string;
}

// In-memory cache (in production, use Redis or similar)
const cache = new Map<string, CacheEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.maxAge * 1000) {
      cache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class CacheManager {
  private static instance: CacheManager;

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Generate cache key
  generateKey(prefix: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${prefix}:${sortedParams}`;
  }

  // Get cached data
  get(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if expired
    if (age > entry.maxAge * 1000) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Set cached data
  set(key: string, data: any, config: CacheConfig): void {
    const etag = this.generateETag(data);
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge: config.maxAge,
      tags: config.tags || [],
      etag,
    });
  }

  // Invalidate cache by tags
  invalidateByTags(tags: string[]): void {
    for (const [key, entry] of cache.entries()) {
      if (entry.tags.some(tag => tags.includes(tag))) {
        cache.delete(key);
      }
    }
  }

  // Invalidate cache by key pattern
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  }

  // Generate ETag
  private generateETag(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `"${Math.abs(hash).toString(16)}"`;
  }

  // Check if request has valid ETag
  checkETag(request: NextRequest, etag: string): boolean {
    const ifNoneMatch = request.headers.get('if-none-match');
    return ifNoneMatch === etag;
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Cache middleware for API routes
export function withCache(config: CacheConfig) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest): Promise<NextResponse> => {
      const url = new URL(req.url);
      const cacheKey = cacheManager.generateKey(
        `${req.method}:${url.pathname}`,
        Object.fromEntries(url.searchParams)
      );

      // Try to get from cache
      const cachedData = cacheManager.get(cacheKey);
      if (cachedData) {
        const entry = cache.get(cacheKey)!;
        
        // Check ETag
        if (cacheManager.checkETag(req, entry.etag)) {
          return new NextResponse(null, {
            status: 304,
            headers: {
              'ETag': entry.etag,
              'Cache-Control': `public, max-age=${config.maxAge}`,
            },
          });
        }

        // Return cached data
        return NextResponse.json(cachedData, {
          headers: {
            'ETag': entry.etag,
            'Cache-Control': `public, max-age=${config.maxAge}`,
            'X-Cache': 'HIT',
          },
        });
      }

      // Execute handler
      const response = await handler(req);
      
      // Cache successful responses
      if (response.status === 200) {
        const data = await response.json();
        cacheManager.set(cacheKey, data, config);
        
        const entry = cache.get(cacheKey)!;
        return NextResponse.json(data, {
          ...response,
          headers: {
            ...response.headers,
            'ETag': entry.etag,
            'Cache-Control': `public, max-age=${config.maxAge}`,
            'X-Cache': 'MISS',
          },
        });
      }

      return response;
    };
  };
}

// Predefined cache configurations
export const cacheConfigs = {
  // Product data cache (5 minutes)
  products: {
    maxAge: 300,
    staleWhileRevalidate: 600,
    tags: ['products'],
  },

  // User data cache (1 minute)
  users: {
    maxAge: 60,
    staleWhileRevalidate: 120,
    tags: ['users'],
  },

  // Analytics cache (30 seconds)
  analytics: {
    maxAge: 30,
    staleWhileRevalidate: 60,
    tags: ['analytics'],
  },

  // Static content cache (1 hour)
  static: {
    maxAge: 3600,
    staleWhileRevalidate: 7200,
    tags: ['static'],
  },
};

// Cache invalidation utilities
export function invalidateProductCache(productId?: string) {
  if (productId) {
    cacheManager.invalidateByPattern(`.*product.*${productId}.*`);
  } else {
    cacheManager.invalidateByTags(['products']);
  }
}

export function invalidateUserCache(userId?: string) {
  if (userId) {
    cacheManager.invalidateByPattern(`.*user.*${userId}.*`);
  } else {
    cacheManager.invalidateByTags(['users']);
  }
}

export function invalidateAnalyticsCache() {
  cacheManager.invalidateByTags(['analytics']);
}

