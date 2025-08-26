import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
});

// Cache configuration
export const CACHE_TTL = {
    PRODUCTS: 300, // 5 minutes
    CATEGORIES: 600, // 10 minutes
    PRODUCT_DETAIL: 1800, // 30 minutes
    CATEGORY_PRODUCTS: 900, // 15 minutes
};

// Cache keys
export const CACHE_KEYS = {
    PRODUCTS: 'products:all',
    PRODUCT_DETAIL: (id: string) => `product:${id}`,
    CATEGORIES: 'categories:all',
    CATEGORY_PRODUCTS: (category: string) => `category:${category}:products`,
    PRODUCTS_BY_STATUS: (status: string) => `products:status:${status}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `products:category:${category}`,
};

// Cache service class
export class CacheService {
    private redis: Redis;

    constructor() {
        this.redis = redis;
    }

    // Set cache with TTL
    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            await this.redis.setex(key, ttl, serializedValue);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    // Get cache value
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    // Delete cache key
    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    // Clear all cache
    async clear(): Promise<void> {
        try {
            await this.redis.flushdb();
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }

    // Invalidate product-related cache
    async invalidateProductCache(productId?: string): Promise<void> {
        try {
            const keys = [
                CACHE_KEYS.PRODUCTS,
                CACHE_KEYS.CATEGORIES,
                ...Object.values(CACHE_KEYS.PRODUCTS_BY_STATUS('ACTIVE')),
                ...Object.values(CACHE_KEYS.PRODUCTS_BY_STATUS('INACTIVE')),
            ];

            if (productId) {
                keys.push(CACHE_KEYS.PRODUCT_DETAIL(productId));
            }

            await Promise.all(keys.map(key => this.del(key)));
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }

    // Invalidate category-related cache
    async invalidateCategoryCache(category?: string): Promise<void> {
        try {
            const keys = [
                CACHE_KEYS.CATEGORIES,
                CACHE_KEYS.PRODUCTS,
            ];

            if (category) {
                keys.push(CACHE_KEYS.CATEGORY_PRODUCTS(category));
                keys.push(CACHE_KEYS.PRODUCTS_BY_CATEGORY(category));
            }

            await Promise.all(keys.map(key => this.del(key)));
        } catch (error) {
            console.error('Cache invalidation error:', error);
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            await this.redis.ping();
            return true;
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export Redis instance for direct access if needed
export { redis }; 