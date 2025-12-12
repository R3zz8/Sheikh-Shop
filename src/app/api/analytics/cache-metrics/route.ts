// src/app/api/analytics/cache-metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // REFACTORED: The Redis-specific cache metrics are no longer available
    // since the application has been migrated to an in-memory cache.
    // This endpoint now returns a static response. A future implementation
    // could potentially expose basic metrics from the in-memory adapter.

    return NextResponse.json({
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        dbSize: 0,
        memoryUsage: 'N/A',
        connectedClients: 0,
        totalCommandsProcessed: 0,
        uptime: 0,
        status: 'In-memory cache does not provide these metrics'
    });
}
