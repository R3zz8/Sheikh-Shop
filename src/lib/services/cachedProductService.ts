import { prisma } from '@/lib/prisma';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/lib/cache/redis';

export class CachedProductService {
    // Get all products with caching
    async getAllProducts() {
        const cacheKey = CACHE_KEYS.PRODUCTS;

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const products = await prisma.product.findMany({
            where: { status: 'ACTIVE' },
            include: {
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Cache the result
        await cacheService.set(cacheKey, products, CACHE_TTL.PRODUCTS);

        return products;
    }

    // Get product by ID with caching
    async getProductById(id: string) {
        const cacheKey = CACHE_KEYS.PRODUCT_DETAIL(id);

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
            },
        });

        if (product) {
            // Cache the result
            await cacheService.set(cacheKey, product, CACHE_TTL.PRODUCT_DETAIL);
        }

        return product;
    }

    // Get products by category with caching
    async getProductsByCategory(category: string) {
        const cacheKey = CACHE_KEYS.CATEGORY_PRODUCTS(category);

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const products = await prisma.product.findMany({
            where: {
                category: category as any,
                status: 'ACTIVE'
            },
            include: {
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Cache the result
        await cacheService.set(cacheKey, products, CACHE_TTL.CATEGORY_PRODUCTS);

        return products;
    }

    // Get products by status with caching
    async getProductsByStatus(status: string) {
        const cacheKey = CACHE_KEYS.PRODUCTS_BY_STATUS(status);

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const products = await prisma.product.findMany({
            where: { status: status as any },
            include: {
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Cache the result
        await cacheService.set(cacheKey, products, CACHE_TTL.PRODUCTS);

        return products;
    }

    // Search products with caching
    async searchProducts(query: string) {
        const cacheKey = `search:${query.toLowerCase()}`;

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
                status: 'ACTIVE',
            },
            include: {
                images: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Cache the result for a shorter time
        await cacheService.set(cacheKey, products, 300); // 5 minutes

        return products;
    }

    // Get categories with caching
    async getCategories() {
        const cacheKey = CACHE_KEYS.CATEGORIES;

        // Try to get from cache first
        const cached = await cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }

        // If not in cache, fetch from database
        const categories = await prisma.product.groupBy({
            by: ['category'],
            where: { status: 'ACTIVE' },
            _count: {
                category: true,
            },
        });

        // Cache the result
        await cacheService.set(cacheKey, categories, CACHE_TTL.CATEGORIES);

        return categories;
    }

    // Invalidate cache when product is updated
    async invalidateProductCache(productId?: string) {
        await cacheService.invalidateProductCache(productId);
    }

    // Invalidate cache when category is updated
    async invalidateCategoryCache(category?: string) {
        await cacheService.invalidateCategoryCache(category);
    }
}

// Export singleton instance
export const cachedProductService = new CachedProductService(); 