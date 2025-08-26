#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Collects and reports on various performance metrics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            timestamp: new Date().toISOString(),
            webVitals: {},
            cache: {},
            database: {},
            system: {},
            recommendations: []
        };

        this.reportsDir = 'performance-reports';
    }

    async run() {
        console.log('🚀 Starting Performance Monitoring...\n');

        try {
            // Collect all metrics
            await this.collectWebVitals();
            await this.collectCacheMetrics();
            await this.collectDatabaseMetrics();
            await this.collectSystemMetrics();

            // Generate recommendations
            this.generateRecommendations();

            // Save report
            await this.saveReport();

            // Display summary
            this.displaySummary();

        } catch (error) {
            console.error('❌ Performance monitoring failed:', error.message);
        }
    }

    async collectWebVitals() {
        console.log('📊 Collecting Web Vitals...');

        try {
            // Simulate Web Vitals collection (in real app, this would come from actual measurements)
            this.metrics.webVitals = {
                FCP: { value: 1200, rating: 'good', target: 1800 },
                LCP: { value: 2800, rating: 'needs-improvement', target: 2500 },
                CLS: { value: 0.08, rating: 'good', target: 0.1 },
                FID: { value: 85, rating: 'good', target: 100 },
                TTFB: { value: 650, rating: 'good', target: 800 }
            };

            console.log('   ✅ Web Vitals collected');
        } catch (error) {
            console.error('   ❌ Failed to collect Web Vitals:', error.message);
        }
    }

    async collectCacheMetrics() {
        console.log('💾 Collecting Cache Metrics...');

        try {
            // Simulate cache metrics (in real app, this would come from Redis)
            this.metrics.cache = {
                hitRate: 78.5,
                totalRequests: 1250,
                cacheHits: 982,
                cacheMisses: 268,
                memoryUsage: '45.2MB',
                connectedClients: 3,
                uptime: 86400 // 24 hours in seconds
            };

            console.log('   ✅ Cache metrics collected');
        } catch (error) {
            console.error('   ❌ Failed to collect cache metrics:', error.message);
        }
    }

    async collectDatabaseMetrics() {
        console.log('🗄️  Collecting Database Metrics...');

        try {
            // Simulate database metrics (in real app, this would come from Prisma/DB)
            this.metrics.database = {
                avgQueryTime: 125,
                slowQueries: 2,
                totalQueries: 450,
                dbSize: '2.3MB',
                entityCounts: {
                    products: 156,
                    categories: 12,
                    users: 89
                }
            };

            console.log('   ✅ Database metrics collected');
        } catch (error) {
            console.error('   ❌ Failed to collect database metrics:', error.message);
        }
    }

    async collectSystemMetrics() {
        console.log('🖥️  Collecting System Metrics...');

        try {
            // Get system information
            const platform = process.platform;
            const nodeVersion = process.version;
            const memoryUsage = process.memoryUsage();

            this.metrics.system = {
                platform,
                nodeVersion,
                memoryUsage: {
                    rss: this.formatBytes(memoryUsage.rss),
                    heapUsed: this.formatBytes(memoryUsage.heapUsed),
                    heapTotal: this.formatBytes(memoryUsage.heapTotal),
                    external: this.formatBytes(memoryUsage.external)
                },
                uptime: process.uptime(),
                pid: process.pid
            };

            console.log('   ✅ System metrics collected');
        } catch (error) {
            console.error('   ❌ Failed to collect system metrics:', error.message);
        }
    }

    generateRecommendations() {
        console.log('💡 Generating Recommendations...');

        const recommendations = [];

        // Web Vitals recommendations
        if (this.metrics.webVitals.LCP.rating === 'needs-improvement') {
            recommendations.push({
                category: 'Web Vitals',
                priority: 'high',
                issue: 'LCP is above target (2.8s > 2.5s)',
                action: 'Optimize image loading and reduce render-blocking resources',
                impact: 'Improve user perceived performance'
            });
        }

        // Cache recommendations
        if (this.metrics.cache.hitRate < 80) {
            recommendations.push({
                category: 'Cache',
                priority: 'medium',
                issue: 'Cache hit rate is below 80%',
                action: 'Review cache invalidation strategy and TTL settings',
                impact: 'Reduce database load and improve response times'
            });
        }

        // Database recommendations
        if (this.metrics.database.avgQueryTime > 100) {
            recommendations.push({
                category: 'Database',
                priority: 'medium',
                issue: 'Average query time is above 100ms',
                action: 'Review database indexes and query optimization',
                impact: 'Improve API response times'
            });
        }

        this.metrics.recommendations = recommendations;
        console.log(`   ✅ Generated ${recommendations.length} recommendations`);
    }

    async saveReport() {
        console.log('💾 Saving Performance Report...');

        try {
            // Create reports directory if it doesn't exist
            if (!fs.existsSync(this.reportsDir)) {
                fs.mkdirSync(this.reportsDir);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(this.reportsDir, `performance-report-${timestamp}.json`);

            // Save JSON report
            fs.writeFileSync(reportPath, JSON.stringify(this.metrics, null, 2));

            // Generate HTML report
            await this.generateHTMLReport(timestamp);

            console.log(`   ✅ Report saved to: ${reportPath}`);

        } catch (error) {
            console.error('   ❌ Failed to save report:', error.message);
        }
    }

    async generateHTMLReport(timestamp) {
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric-card { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .metric-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #495057; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .metric-item { background: #f8f9fa; padding: 10px; border-radius: 4px; }
        .metric-label { font-weight: bold; color: #6c757d; }
        .metric-value { font-size: 16px; color: #212529; }
        .rating-good { color: #28a745; }
        .rating-warning { color: #ffc107; }
        .rating-poor { color: #dc3545; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; }
        .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
        .priority-high { border-left-color: #dc3545; }
        .priority-medium { border-left-color: #ffc107; }
        .priority-low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Performance Monitoring Report</h1>
        <p><strong>Generated:</strong> ${this.metrics.timestamp}</p>
    </div>
    
    <div class="metric-card">
        <div class="metric-title">📊 Web Vitals</div>
        <div class="metric-grid">
            ${Object.entries(this.metrics.webVitals).map(([key, metric]) => `
                <div class="metric-item">
                    <div class="metric-label">${key}</div>
                    <div class="metric-value ${this.getRatingClass(metric.rating)}">
                        ${metric.value}${this.getUnit(key)} (${metric.rating})
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="metric-card">
        <div class="metric-title">💾 Cache Performance</div>
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-label">Hit Rate</div>
                <div class="metric-value">${this.metrics.cache.hitRate}%</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Requests</div>
                <div class="metric-value">${this.metrics.cache.totalRequests}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Memory Usage</div>
                <div class="metric-value">${this.metrics.cache.memoryUsage}</div>
            </div>
        </div>
    </div>
    
    <div class="metric-card">
        <div class="metric-title">🗄️ Database Performance</div>
        <div class="metric-grid">
            <div class="metric-item">
                <div class="metric-label">Avg Query Time</div>
                <div class="metric-value">${this.metrics.database.avgQueryTime}ms</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Total Queries</div>
                <div class="metric-value">${this.metrics.database.totalQueries}</div>
            </div>
            <div class="metric-item">
                <div class="metric-label">Database Size</div>
                <div class="metric-value">${this.metrics.database.dbSize}</div>
            </div>
        </div>
    </div>
    
    ${this.metrics.recommendations.length > 0 ? `
        <div class="recommendations">
            <h2>🔧 Recommendations</h2>
            ${this.metrics.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority}">
                    <h3>${rec.issue}</h3>
                    <p><strong>Action:</strong> ${rec.action}</p>
                    <p><strong>Impact:</strong> ${rec.impact}</p>
                    <p><strong>Priority:</strong> <span class="priority-${rec.priority}">${rec.priority}</span></p>
                </div>
            `).join('')}
        </div>
    ` : ''}
</body>
</html>
        `;

        const htmlPath = path.join(this.reportsDir, `performance-report-${timestamp}.html`);
        fs.writeFileSync(htmlPath, htmlTemplate);
        console.log(`   ✅ HTML report generated: ${htmlPath}`);
    }

    getRatingClass(rating) {
        switch (rating) {
            case 'good': return 'rating-good';
            case 'needs-improvement': return 'rating-warning';
            case 'poor': return 'rating-poor';
            default: return '';
        }
    }

    getUnit(metric) {
        switch (metric) {
            case 'FCP':
            case 'LCP':
            case 'FID':
            case 'TTFB': return 'ms';
            case 'CLS': return '';
            default: return '';
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i];
    }

    displaySummary() {
        console.log('\n📋 Performance Summary');
        console.log('=====================\n');

        // Web Vitals summary
        const goodVitals = Object.values(this.metrics.webVitals).filter(v => v.rating === 'good').length;
        const totalVitals = Object.keys(this.metrics.webVitals).length;
        console.log(`📊 Web Vitals: ${goodVitals}/${totalVitals} metrics are good`);

        // Cache summary
        console.log(`💾 Cache Hit Rate: ${this.metrics.cache.hitRate}%`);

        // Database summary
        console.log(`🗄️  Database: ${this.metrics.database.avgQueryTime}ms avg query time`);

        // Recommendations
        if (this.metrics.recommendations.length > 0) {
            console.log(`\n🔧 ${this.metrics.recommendations.length} recommendations generated`);
            this.metrics.recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
            });
        } else {
            console.log('\n✅ No critical issues found');
        }

        console.log(`\n📄 Detailed report saved to: ${this.reportsDir}/`);
    }
}

// Run the performance monitor
const monitor = new PerformanceMonitor();
monitor.run().catch(console.error); 