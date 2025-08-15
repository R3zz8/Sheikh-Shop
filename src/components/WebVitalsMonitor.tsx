'use client';

import { useWebVitals, usePerformanceMonitoring } from '@/hooks/useWebVitals';
import { useEffect } from 'react';

export function WebVitalsMonitor() {
    // Initialize Web Vitals monitoring
    useWebVitals();

    const { measurePageLoad } = usePerformanceMonitoring();

    useEffect(() => {
        // Measure page load performance
        measurePageLoad();
    }, [measurePageLoad]);

    // This component doesn't render anything
    return null;
} 