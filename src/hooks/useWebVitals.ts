'use client';

import { useEffect, useCallback } from 'react';

interface WebVitalsData {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

export function useWebVitals() {
    const sendToAnalytics = useCallback((metric: WebVitalsData) => {
        // console.log('Web Vitals:', { /* ... */ }); // Commented out
        if (typeof window !== 'undefined' && (window as any).va) {
            (window as any).va('web-vitals', metric);
        }
        fetch('/api/analytics/web-vitals', { /* ... */ }).catch(console.error);
    }, []);

    useEffect(() => {
        // Measure Core Web Vitals using native APIs
        if (typeof window !== 'undefined') {
            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsEntries: any[] = [];

            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                        clsEntries.push(entry);
                    }
                }

                // Send CLS metric
                sendToAnalytics({
                    name: 'CLS',
                    value: clsValue,
                    rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
                    delta: 0,
                    id: 'cls-metric'
                });
            });

            observer.observe({ entryTypes: ['layout-shift'] });

            // First Contentful Paint (FCP)
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries[entries.length - 1];
                if (fcpEntry) {
                    const fcpValue = fcpEntry.startTime;

                    sendToAnalytics({
                        name: 'FCP',
                        value: fcpValue,
                        rating: fcpValue < 1800 ? 'good' : fcpValue < 3000 ? 'needs-improvement' : 'poor',
                        delta: 0,
                        id: 'fcp-metric'
                    });
                }
            });

            fcpObserver.observe({ entryTypes: ['paint'] });

            // Largest Contentful Paint (LCP)
            let lcpValue = 0;
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    lcpValue = lastEntry.startTime;

                    sendToAnalytics({
                        name: 'LCP',
                        value: lcpValue,
                        rating: lcpValue < 2500 ? 'good' : lcpValue < 4000 ? 'needs-improvement' : 'poor',
                        delta: 0,
                        id: 'lcp-metric'
                    });
                }
            });

            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            let firstInputTime = 0;
            let firstInputDelay = 0;

            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                for (const entry of entries) {
                    if (entry.entryType === 'first-input' && !firstInputTime) {
                        firstInputTime = entry.startTime;
                        firstInputDelay = (entry as any).processingStart - entry.startTime;

                        sendToAnalytics({
                            name: 'FID',
                            value: firstInputDelay,
                            rating: firstInputDelay < 100 ? 'good' : firstInputDelay < 300 ? 'needs-improvement' : 'poor',
                            delta: 0,
                            id: 'fid-metric'
                        });
                        break;
                    }
                }
            });

            fidObserver.observe({ entryTypes: ['first-input'] });

            // Time to First Byte (TTFB)
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
                const ttfb = navigation.responseStart - navigation.requestStart;

                sendToAnalytics({
                    name: 'TTFB',
                    value: ttfb,
                    rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
                    delta: 0,
                    id: 'ttfb-metric'
                });

                // Additional navigation timing metrics
                const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
                const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

                sendToAnalytics({
                    name: 'DOM_CONTENT_LOADED',
                    value: domContentLoaded,
                    rating: domContentLoaded < 1000 ? 'good' : domContentLoaded < 2500 ? 'needs-improvement' : 'poor',
                    delta: 0,
                    id: 'dom-content-loaded'
                });

                sendToAnalytics({
                    name: 'PAGE_LOAD_TIME',
                    value: loadTime,
                    rating: loadTime < 2000 ? 'good' : loadTime < 4000 ? 'needs-improvement' : 'poor',
                    delta: 0,
                    id: 'page-load-time'
                });
            }

            // Cleanup function
            return () => {
                observer.disconnect();
                fcpObserver.disconnect();
                lcpObserver.disconnect();
                fidObserver.disconnect();
            };
        }
        // Return empty cleanup function if window is not available
        return () => { };
    }, [sendToAnalytics]);

    return null;
}

export function usePerformanceMonitoring() {
    const logPerformance = useCallback((metric: string, value: number, context?: any) => {
        const performanceData = { /* ... */ };
        // console.log('Performance Metric:', performanceData); // Commented out
        fetch('/api/analytics/performance', { /* ... */ }).catch(console.error);
    }, []);

    const measurePageLoad = useCallback(() => {
        // Implementation for page load measurement
    }, []);

    const measureApiCall = useCallback(() => {
        // Implementation for API call measurement
    }, []);

    const measureComponentRender = useCallback(() => {
        // Implementation for component render measurement
    }, []);

    return {
        logPerformance,
        measurePageLoad,
        measureApiCall,
        measureComponentRender,
    };
}

export function logServerPerformance(operation: string, duration: number, context?: any) {
    const performanceData = { /* ... */ };
    // console.log('Server Performance:', performanceData); // Commented out
    if (process.env.NODE_ENV === 'production') {
        // logToService(performanceData);
    }
} 