import { NextRequest, NextResponse } from 'next/server';
import { logServerPerformance } from '@/hooks/useWebVitals';

export async function POST(request: NextRequest) {
    try {
        const startTime = Date.now();
        const data = await request.json();

        // Log the performance data
        console.log('Performance Data:', data);

        // In production, you would send this to your monitoring service
        // Example: DataDog, New Relic, etc.
        if (process.env.NODE_ENV === 'production') {
            // Send to your monitoring service
            // await sendToMonitoringService(data);
        }

        const duration = Date.now() - startTime;
        logServerPerformance('performance_processing', duration, { metric: data.metric });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing performance data:', error);
        return NextResponse.json({ error: 'Failed to process performance data' }, { status: 500 });
    }
} 