import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Get database performance metrics
        const startTime = Date.now();

        // Get total counts for various entities
        const [productCount, categoryCount, userCount] = await Promise.all([
            prisma.product.count(),
            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true }
            }).then(result => result.length),
            prisma.user.count()
        ]);

        // Simulate some performance metrics (in a real app, you'd track these over time)
        const avgQueryTime = Math.random() * 200 + 50; // 50-250ms
        const slowQueries = Math.floor(Math.random() * 5); // 0-4 slow queries
        const totalQueries = productCount + categoryCount + userCount;

        // Get database size information
        const dbSize = await getDatabaseSize();

        const databaseMetrics = {
            avgQueryTime: Math.round(avgQueryTime),
            slowQueries,
            totalQueries,
            dbSize,
            entityCounts: {
                products: productCount,
                categories: categoryCount,
                users: userCount
            },
            performance: {
                responseTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            }
        };

        return NextResponse.json(databaseMetrics);
    } catch (error) {
        console.error('Failed to fetch database metrics:', error);

        return NextResponse.json({
            avgQueryTime: 0,
            slowQueries: 0,
            totalQueries: 0,
            dbSize: '0B',
            entityCounts: {
                products: 0,
                categories: 0,
                users: 0
            },
            error: 'Database metrics unavailable'
        });
    }
}

async function getDatabaseSize(): Promise<string> {
    try {
        // This is a simplified version - in production you'd get actual DB size
        // For now, return an estimated size based on entity counts
        const [productCount, categoryCount, userCount] = await Promise.all([
            prisma.product.count(),
            prisma.product.groupBy({
                by: ['category'],
                _count: { category: true }
            }).then(result => result.length),
            prisma.user.count()
        ]);

        // Rough estimation: products ~2KB each, categories ~1KB each, users ~500B each
        const estimatedSize = (productCount * 2 + categoryCount * 1 + userCount * 0.5);

        if (estimatedSize < 1024) {
            return `${Math.round(estimatedSize)}B`;
        } else if (estimatedSize < 1024 * 1024) {
            return `${(estimatedSize / 1024).toFixed(1)}KB`;
        } else {
            return `${(estimatedSize / (1024 * 1024)).toFixed(1)}MB`;
        }
    } catch (error) {
        return '0B';
    }
} 