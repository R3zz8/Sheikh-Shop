// src/lib/cache/redis.ts
// REFACTORED: This file has been updated to use the resilient cache adapter
// instead of a direct Redis client. The class-based structure is preserved
// to maintain API compatibility with services that use it.

import { getCacheClient } from './adapter';

const cache = getCacheClient();

// Cache configuration (kept for reference, TTL is handled by the adapter's `set` method)
export const CACHE_TTL = {
    PRODUCTS: 300, // 5 minutes
    CATEGORIES: 600, // 10 minutes
    PRODUCT_DETAIL: 1800, // 30 minutes
    CATEGORY_PRODUCTS: 900, // 15 minutes
};

// Cache keys
export const CACHE_KEYS = {
    PRODUCTS: 'products:all',
    NEW_PRODUCTS: (limit: number = 12) => `new_products_limit_${limit}`,
    PRODUCT_DETAIL: (id: string) => `product:${id}`,
    CATEGORIES: 'categories:all',
    CATEGORY_PRODUCTS: (category: string) => `category:${category}:products`,
    PRODUCTS_BY_STATUS: (status: string) => `products:status:${status}`,
    PRODUCTS_BY_CATEGORY: (category: string) => `products:category:${category}`,
};

// Cache service class using the in-memory adapter
export class CacheService {
    // Set cache with TTL
    async set(key: string, value: any, ttl: number = 300): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            await cache.set(key, serializedValue, { ex: ttl });
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    // Get cache value
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await cache.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    // Delete cache key
    async del(key: string): Promise<void> {
        try {
            await cache.del(key);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    // Clear all cache (Note: This will clear the entire in-memory cache)
    async clear(): Promise<void> {
        try {
            await cache.clear();
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
                CACHE_KEYS.PRODUCTS_BY_STATUS('ACTIVE'),
                CACHE_KEYS.PRODUCTS_BY_STATUS('INACTIVE'),
                CACHE_KEYS.NEW_PRODUCTS(6),
                CACHE_KEYS.NEW_PRODUCTS(8),
                CACHE_KEYS.NEW_PRODUCTS(10),
                CACHE_KEYS.NEW_PRODUCTS(12),
                CACHE_KEYS.NEW_PRODUCTS(16),
                CACHE_KEYS.NEW_PRODUCTS(20),
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

    // Health check (always true for in-memory)
    async healthCheck(): Promise<boolean> {
        return true;
    }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export the raw client for direct access if needed
export const redis = getCacheClient();
