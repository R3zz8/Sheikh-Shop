import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
    try {
        // Get cache statistics from Redis
        const info = await redis.info('stats');

        // Parse Redis info output to extract metrics
        const lines = info.split('\r\n');
        const metrics: { [key: string]: number } = {};

        lines.forEach((line: string) => {
            const [key, value] = line.split(':');
            if (key && value && !isNaN(Number(value))) {
                metrics[key] = Number(value);
            }
        });

        // Calculate cache hit rate
        const hits = metrics['keyspace_hits'] || 0;
        const misses = metrics['keyspace_misses'] || 0;
        const totalRequests = hits + misses;
        const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0;

        // Get current database size
        const dbSize = await redis.dbsize();

        const cacheMetrics = {
            hitRate: Math.round(hitRate * 100) / 100,
            totalRequests,
            cacheHits: hits,
            cacheMisses: misses,
            dbSize,
            memoryUsage: metrics['used_memory_human'] || '0B',
            connectedClients: metrics['connected_clients'] || 0,
            totalCommandsProcessed: metrics['total_commands_processed'] || 0,
            uptime: metrics['uptime_in_seconds'] || 0
        };

        return NextResponse.json(cacheMetrics);
    } catch (error) {
        console.error('Failed to fetch cache metrics:', error);

        // Return fallback metrics if Redis is unavailable
        return NextResponse.json({
            hitRate: 0,
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            dbSize: 0,
            memoryUsage: '0B',
            connectedClients: 0,
            totalCommandsProcessed: 0,
            uptime: 0,
            error: 'Cache service unavailable'
        });
    }
} 