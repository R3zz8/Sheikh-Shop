#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Identifies large dependencies and suggests optimizations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
    constructor() {
        this.largeDependencies = [
            'three',
            '@react-three/fiber',
            '@react-three/drei',
            'framer-motion',
            'lodash',
            'moment',
            'date-fns',
            'react-query',
            '@tanstack/react-query'
        ];

        this.analysis = {
            totalSize: 0,
            largeDeps: [],
            optimizationSuggestions: [],
            performanceScore: 0
        };
    }

    async analyzeBundle() {
        console.log('📊 Analyzing bundle size...\n');

        try {
            // Run bundle analyzer
            const buildOutput = execSync('npm run build', { encoding: 'utf8' });

            // Extract bundle information
            this.extractBundleInfo(buildOutput);

            // Analyze dependencies
            this.analyzeDependencies();

            // Generate optimization suggestions
            this.generateOptimizationSuggestions();

            // Calculate performance score
            this.calculatePerformanceScore();

            // Generate report
            this.generateReport();

            // Generate detailed bundle report
            await this.generateDetailedReport();

        } catch (error) {
            console.error('❌ Bundle analysis failed:', error.message);
        }
    }

    extractBundleInfo(buildOutput) {
        // Extract total bundle size
        const sizeMatch = buildOutput.match(/Bundle Size: (.*)/);
        if (sizeMatch) {
            this.analysis.totalSize = sizeMatch[1];
        }

        // Check for large dependencies
        this.largeDependencies.forEach(dep => {
            if (buildOutput.includes(dep)) {
                this.analysis.largeDeps.push(dep);
            }
        });
    }

    analyzeDependencies() {
        console.log('🔍 Analyzing dependencies...');

        this.analysis.largeDeps.forEach(dep => {
            console.log(`   ⚠️  Large dependency: ${dep}`);
        });

        // Check for unused dependencies
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        console.log('\n📦 Dependency Analysis:');
        Object.entries(dependencies).forEach(([name, version]) => {
            if (this.largeDependencies.includes(name)) {
                console.log(`   🔴 ${name}@${version} - Large dependency`);
            }
        });
    }

    generateOptimizationSuggestions() {
        console.log('\n💡 Optimization Suggestions:');

        if (this.analysis.largeDeps.includes('three')) {
            this.analysis.optimizationSuggestions.push({
                type: 'critical',
                dependency: 'three',
                suggestion: 'Use dynamic imports for 3D components',
                impact: 'high'
            });
        }

        if (this.analysis.largeDeps.includes('framer-motion')) {
            this.analysis.optimizationSuggestions.push({
                type: 'critical',
                dependency: 'framer-motion',
                suggestion: 'Consider replacing with CSS animations for simple animations',
                impact: 'medium'
            });
        }

        if (this.analysis.largeDeps.includes('lodash')) {
            this.analysis.optimizationSuggestions.push({
                type: 'critical',
                dependency: 'lodash',
                suggestion: 'Use individual lodash functions instead of full library',
                impact: 'high'
            });
        }

        this.analysis.optimizationSuggestions.forEach(suggestion => {
            const icon = suggestion.impact === 'high' ? '🔴' : suggestion.impact === 'medium' ? '🟡' : '🟢';
            console.log(`   ${icon} ${suggestion.dependency}: ${suggestion.suggestion}`);
        });
    }

    calculatePerformanceScore() {
        let score = 100;

        // Deduct points for large dependencies
        this.analysis.largeDeps.forEach(dep => {
            if (dep === 'three') score -= 20;
            else if (dep === 'framer-motion') score -= 15;
            else if (dep === 'lodash') score -= 10;
            else score -= 5;
        });

        // Deduct points for bundle size
        if (this.analysis.totalSize > 30) score -= 20;
        else if (this.analysis.totalSize > 20) score -= 10;
        else if (this.analysis.totalSize > 10) score -= 5;

        this.analysis.performanceScore = Math.max(0, score);
    }

    generateReport() {
        console.log('\n📊 Bundle Analysis Report');
        console.log('========================\n');

        console.log('📏 Bundle Size:');
        console.log(`   Total: ${this.analysis.totalSize}`);

        console.log('\n🔴 Large Dependencies:');
        this.analysis.largeDeps.forEach(dep => {
            console.log(`   - ${dep}`);
        });

        console.log('\n💡 Optimization Suggestions:');
        this.analysis.optimizationSuggestions.forEach(suggestion => {
            console.log(`   - ${suggestion.dependency}: ${suggestion.suggestion}`);
        });

        console.log('\n📈 Performance Score:');
        const score = this.analysis.performanceScore;
        const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';
        console.log(`   Score: ${score}/100 (${grade})`);

        if (score < 70) {
            console.log('   ⚠️  Bundle needs optimization');
        } else {
            console.log('   ✅ Bundle is well optimized');
        }

        // Save analysis to file
        const reportPath = path.join(process.cwd(), 'bundle-analysis.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.analysis, null, 2));
        console.log(`\n📄 Analysis saved to: ${reportPath}`);
    }

    async generateDetailedReport() {
        console.log('\n📊 Generating detailed bundle report...');

        try {
            // Create detailed report directory
            const reportDir = 'bundle-analysis-reports';
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir);
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(reportDir, `bundle-analysis-${timestamp}.json`);

            const detailedReport = {
                timestamp: new Date().toISOString(),
                analysis: this.analysis,
                recommendations: this.generateDetailedRecommendations(),
                nextSteps: this.generateNextSteps(),
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch
                }
            };

            fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
            console.log(`   ✅ Detailed report saved to: ${reportPath}`);

            // Generate HTML report
            await this.generateHTMLReport(detailedReport, reportDir, timestamp);

        } catch (error) {
            console.error('   ❌ Failed to generate detailed report:', error.message);
        }
    }

    generateDetailedRecommendations() {
        const recommendations = [];

        if (this.analysis.largeDeps.includes('three')) {
            recommendations.push({
                priority: 'high',
                category: '3D Libraries',
                action: 'Implement dynamic imports for Three.js components',
                impact: 'Reduce mobile bundle by 40-60%',
                effort: 'medium',
                code: `
// Example dynamic import
const ThreeComponent = dynamic(() => import('./ThreeComponent'), {
    ssr: false,
    loading: () => <div>Loading 3D...</div>
});
                `
            });
        }

        if (this.analysis.largeDeps.includes('framer-motion')) {
            recommendations.push({
                priority: 'medium',
                category: 'Animation Libraries',
                action: 'Use CSS transitions for simple animations',
                impact: 'Reduce bundle by 15-25%',
                effort: 'low',
                code: `
// Replace framer-motion with CSS
<div className="transition-all duration-300 hover:scale-105">
    Content
</div>
                `
            });
        }

        return recommendations;
    }

    generateNextSteps() {
        return [
            {
                phase: 'Immediate (Week 1)',
                tasks: [
                    'Deploy Redis cache to production',
                    'Set up performance monitoring alerts',
                    'Configure CDN for static assets'
                ]
            },
            {
                phase: 'Short-term (Month 1)',
                tasks: [
                    'Implement image optimization with next/image',
                    'Add font loading optimization',
                    'Set up service worker for caching'
                ]
            },
            {
                phase: 'Long-term (Month 2-3)',
                tasks: [
                    'Consider microservices architecture',
                    'Implement database sharding',
                    'Deploy to edge locations'
                ]
            }
        ];
    }

    async generateHTMLReport(data, reportDir, timestamp) {
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Bundle Analysis Report - ${timestamp}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .metric { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .good { background: #d4edda; border: 1px solid #c3e6cb; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; }
        .critical { background: #f8d7da; border: 1px solid #f5c6cb; }
        .recommendation { margin: 15px 0; padding: 10px; background: #f8f9fa; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚀 Bundle Analysis Report</h1>
    <p><strong>Generated:</strong> ${data.timestamp}</p>
    
    <div class="metric ${data.analysis.performanceScore >= 80 ? 'good' : data.analysis.performanceScore >= 60 ? 'warning' : 'critical'}">
        <h2>Performance Score: ${data.analysis.performanceScore}/100</h2>
    </div>
    
    <h2>📊 Analysis Summary</h2>
    <ul>
        <li>Total Bundle Size: ${data.analysis.totalSize}</li>
        <li>Large Dependencies: ${data.analysis.largeDeps.length}</li>
        <li>Optimization Suggestions: ${data.analysis.optimizationSuggestions.length}</li>
    </ul>
    
    <h2>🔧 Recommendations</h2>
    ${data.recommendations.map(rec => `
        <div class="recommendation">
            <h3>${rec.action}</h3>
            <p><strong>Priority:</strong> ${rec.priority}</p>
            <p><strong>Impact:</strong> ${rec.impact}</p>
            <p><strong>Effort:</strong> ${rec.effort}</p>
            <pre><code>${rec.code}</code></pre>
        </div>
    `).join('')}
    
    <h2>📅 Next Steps</h2>
    ${data.nextSteps.map(phase => `
        <h3>${phase.phase}</h3>
        <ul>
            ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
        </ul>
    `).join('')}
</body>
</html>
        `;

        const htmlPath = path.join(reportDir, `bundle-analysis-${timestamp}.html`);
        fs.writeFileSync(htmlPath, htmlTemplate);
        console.log(`   ✅ HTML report saved to: ${htmlPath}`);
    }

    async run() {
        console.log('🚀 Starting Bundle Analysis...\n');
        await this.analyzeBundle();
        console.log('\n✅ Bundle analysis complete!');
    }
}

// Run the bundle analyzer
const analyzer = new BundleAnalyzer();
analyzer.run().catch(console.error); 