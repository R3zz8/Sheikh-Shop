'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
    unit?: string;
}

interface CacheMetrics {
    hitRate: number;
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
}

interface DatabaseMetrics {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
}

export function PerformanceDashboard() {
    const [webVitals, setWebVitals] = useState<PerformanceMetric[]>([]);
    const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics>({
        hitRate: 0,
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0
    });
    const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics>({
        avgQueryTime: 0,
        slowQueries: 0,
        totalQueries: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch initial performance data
        fetchPerformanceData();

        // Set up real-time updates every 30 seconds
        const interval = setInterval(fetchPerformanceData, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchPerformanceData = async () => {
        try {
            // Fetch cache metrics
            const cacheResponse = await fetch('/api/analytics/cache-metrics');
            if (cacheResponse.ok) {
                const cacheData = await cacheResponse.json();
                setCacheMetrics(cacheData);
            }

            // Fetch database metrics
            const dbResponse = await fetch('/api/analytics/database-metrics');
            if (dbResponse.ok) {
                const dbData = await dbResponse.json();
                setDatabaseMetrics(dbData);
            }

            // Fetch recent Web Vitals
            const vitalsResponse = await fetch('/api/analytics/web-vitals');
            if (vitalsResponse.ok) {
                const vitalsData = await vitalsResponse.json();
                setWebVitals(vitalsData.slice(-10)); // Last 10 metrics
            }
        } catch (error) {
            console.error('Failed to fetch performance data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'bg-green-100 text-green-800';
            case 'needs-improvement': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatValue = (value: number, unit?: string) => {
        if (unit === 'ms') {
            return `${value.toFixed(0)}ms`;
        }
        if (unit === '%') {
            return `${value.toFixed(1)}%`;
        }
        return value.toFixed(2);
    };

    const getPerformanceScore = () => {
        if (webVitals.length === 0) return 0;

        const goodMetrics = webVitals.filter(m => m.rating === 'good').length;
        const totalMetrics = webVitals.length;

        return Math.round((goodMetrics / totalMetrics) * 100);
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Performance Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Last updated:</span>
                    <span className="text-sm font-medium">
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Performance Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <span>Overall Performance Score</span>
                        <Badge className={getPerformanceScore() >= 80 ? 'bg-green-100 text-green-800' :
                            getPerformanceScore() >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}>
                            {getPerformanceScore()}/100
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={getPerformanceScore()} className="h-3" />
                    <p className="text-sm text-gray-600 mt-2">
                        Based on {webVitals.length} recent performance metrics
                    </p>
                </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cache Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cache Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Hit Rate</span>
                                <span>{cacheMetrics.hitRate.toFixed(1)}%</span>
                            </div>
                            <Progress
                                value={cacheMetrics.hitRate}
                                className="h-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Hits:</span>
                                <span className="ml-2 font-medium">{cacheMetrics.cacheHits}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Misses:</span>
                                <span className="ml-2 font-medium">{cacheMetrics.cacheMisses}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Database Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Avg Query Time</span>
                                <span>{formatValue(databaseMetrics.avgQueryTime, 'ms')}</span>
                            </div>
                            <Progress
                                value={Math.min(databaseMetrics.avgQueryTime / 1000 * 100, 100)}
                                className="h-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Total Queries:</span>
                                <span className="ml-2 font-medium">{databaseMetrics.totalQueries}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Slow Queries:</span>
                                <span className="ml-2 font-medium text-red-600">{databaseMetrics.slowQueries}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Redis Cache</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">Database</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">API Endpoints</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Web Vitals Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Metric</th>
                                    <th className="text-left py-2">Value</th>
                                    <th className="text-left py-2">Rating</th>
                                    <th className="text-left py-2">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webVitals.map((metric, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 font-medium">{metric.name}</td>
                                        <td className="py-2">{formatValue(metric.value, metric.unit)}</td>
                                        <td className="py-2">
                                            <Badge className={getRatingColor(metric.rating)}>
                                                {metric.rating}
                                            </Badge>
                                        </td>
                                        <td className="py-2 text-sm text-gray-500">
                                            {new Date(metric.timestamp).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-4">
                        <button
                            onClick={fetchPerformanceData}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Refresh Data
                        </button>
                        <button
                            onClick={() => window.open('/api/analytics/performance', '_blank')}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                            View Raw Data
                        </button>
                        <button
                            onClick={() => window.open('/bundle-analysis-reports', '_blank')}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                            Bundle Analysis
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 