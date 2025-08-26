import { NextRequest, NextResponse } from 'next/server';

// In a real application, this would come from a database or analytics service
// For now, we'll simulate some web vitals data
const mockWebVitals = [
    {
        name: 'FCP',
        value: 1200,
        rating: 'good',
        timestamp: Date.now() - 300000, // 5 minutes ago
        unit: 'ms'
    },
    {
        name: 'LCP',
        value: 2800,
        rating: 'needs-improvement',
        timestamp: Date.now() - 240000, // 4 minutes ago
        unit: 'ms'
    },
    {
        name: 'CLS',
        value: 0.08,
        rating: 'good',
        timestamp: Date.now() - 180000, // 3 minutes ago
        unit: ''
    },
    {
        name: 'FID',
        value: 85,
        rating: 'good',
        timestamp: Date.now() - 120000, // 2 minutes ago
        unit: 'ms'
    },
    {
        name: 'TTFB',
        value: 650,
        rating: 'good',
        timestamp: Date.now() - 60000, // 1 minute ago
        unit: 'ms'
    },
    {
        name: 'DOM_CONTENT_LOADED',
        value: 950,
        rating: 'good',
        timestamp: Date.now() - 30000, // 30 seconds ago
        unit: 'ms'
    },
    {
        name: 'PAGE_LOAD_TIME',
        value: 1800,
        rating: 'good',
        timestamp: Date.now() - 15000, // 15 seconds ago
        unit: 'ms'
    }
];

export async function GET(request: NextRequest) {
    try {
        // In a real application, you would:
        // 1. Query your analytics database
        // 2. Filter by time range if provided
        // 3. Aggregate metrics if needed

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const timeRange = searchParams.get('timeRange') || '1h'; // 1h, 24h, 7d

        // Filter data based on time range
        let filteredData = [...mockWebVitals];

        if (timeRange === '1h') {
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            filteredData = filteredData.filter(metric => metric.timestamp > oneHourAgo);
        } else if (timeRange === '24h') {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            filteredData = filteredData.filter(metric => metric.timestamp > oneDayAgo);
        }

        // Limit results
        filteredData = filteredData.slice(-limit);

        // Add some real-time variation to simulate live data
        const now = Date.now();
        const liveData = filteredData.map(metric => ({
            ...metric,
            timestamp: now - Math.random() * 300000, // Random time within last 5 minutes
            value: metric.value + (Math.random() - 0.5) * 200 // Add some variation
        }));

        return NextResponse.json(liveData);
    } catch (error) {
        console.error('Failed to fetch web vitals:', error);

        return NextResponse.json(
            { error: 'Failed to fetch web vitals' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // In a real application, you would:
        // 1. Validate the incoming data
        // 2. Store it in your analytics database
        // 3. Trigger alerts if metrics are poor

        const { name, value, rating, delta, id } = body;

        // Validate required fields
        if (!name || typeof value !== 'number' || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Log the metric (in production, store in database)
        console.log('Web Vital recorded:', { name, value, rating, delta, id, timestamp: new Date().toISOString() });

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Web vital recorded successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to record web vital:', error);

        return NextResponse.json(
            { error: 'Failed to record web vital' },
            { status: 500 }
        );
    }
} 