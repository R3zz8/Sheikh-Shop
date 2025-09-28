import type { ProductsWithImages } from '@/types';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  timestamp: Date;
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
}

export interface AnomalyDetection {
  id: string;
  type: 'traffic' | 'sales' | 'performance' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  confidence: number;
  metrics: {
    current: number;
    expected: number;
    deviation: number;
  };
  action?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: {
    database: 'healthy' | 'degraded' | 'critical';
    api: 'healthy' | 'degraded' | 'critical';
    search: 'healthy' | 'degraded' | 'critical';
    chatbot: 'healthy' | 'degraded' | 'critical';
  };
  uptime: number;
  lastIncident?: Date;
}

export class MonitoringSystem {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private errors: ErrorLog[] = [];
  private anomalies: AnomalyDetection[] = [];
  private health: SystemHealth;
  private alertThresholds: Map<string, { warning: number; critical: number }> = new Map();

  constructor() {
    this.health = {
      overall: 'healthy',
      services: {
        database: 'healthy',
        api: 'healthy',
        search: 'healthy',
        chatbot: 'healthy'
      },
      uptime: 99.9,
      lastIncident: undefined
    };

    this.initializeThresholds();
    this.startMonitoring();
  }

  private initializeThresholds() {
    this.alertThresholds.set('response_time', { warning: 1000, critical: 3000 });
    this.alertThresholds.set('error_rate', { warning: 5, critical: 10 });
    this.alertThresholds.set('cpu_usage', { warning: 80, critical: 95 });
    this.alertThresholds.set('memory_usage', { warning: 85, critical: 95 });
    this.alertThresholds.set('database_connections', { warning: 80, critical: 95 });
  }

  private startMonitoring() {
    // Simulate real-time monitoring
    setInterval(() => {
      this.collectMetrics();
      this.detectAnomalies();
      this.updateSystemHealth();
    }, 5000); // Every 5 seconds
  }

  private collectMetrics() {
    const now = new Date();
    
    // Simulate metric collection
    const metrics = [
      {
        id: 'response_time',
        name: 'API Response Time',
        value: Math.random() * 2000 + 100,
        unit: 'ms',
        threshold: this.alertThresholds.get('response_time')!,
        timestamp: now
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        value: Math.random() * 10,
        unit: '%',
        threshold: this.alertThresholds.get('error_rate')!,
        timestamp: now
      },
      {
        id: 'cpu_usage',
        name: 'CPU Usage',
        value: Math.random() * 100,
        unit: '%',
        threshold: this.alertThresholds.get('cpu_usage')!,
        timestamp: now
      },
      {
        id: 'memory_usage',
        name: 'Memory Usage',
        value: Math.random() * 100,
        unit: '%',
        threshold: this.alertThresholds.get('memory_usage')!,
        timestamp: now
      },
      {
        id: 'active_users',
        name: 'Active Users',
        value: Math.floor(Math.random() * 1000) + 100,
        unit: 'users',
        threshold: { warning: 800, critical: 1000 },
        timestamp: now
      },
      {
        id: 'requests_per_second',
        name: 'Requests/sec',
        value: Math.random() * 100 + 10,
        unit: 'req/s',
        threshold: { warning: 80, critical: 100 },
        timestamp: now
      }
    ];

    metrics.forEach(metric => {
      const status = this.determineStatus(metric.value, metric.threshold);
      const trend = this.calculateTrend(metric.id, metric.value);
      
      const performanceMetric: PerformanceMetric = {
        ...metric,
        status,
        trend
      };

      if (!this.metrics.has(metric.id)) {
        this.metrics.set(metric.id, []);
      }
      
      const metricHistory = this.metrics.get(metric.id)!;
      metricHistory.push(performanceMetric);
      
      // Keep only last 100 entries
      if (metricHistory.length > 100) {
        metricHistory.shift();
      }
    });
  }

  private determineStatus(value: number, threshold: { warning: number; critical: number }): 'healthy' | 'warning' | 'critical' {
    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'healthy';
  }

  private calculateTrend(metricId: string, currentValue: number): 'up' | 'down' | 'stable' {
    const history = this.metrics.get(metricId) || [];
    if (history.length < 2) return 'stable';
    
    const previousValue = history[history.length - 1].value;
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  }

  private detectAnomalies() {
    const now = new Date();
    
    // Check for traffic anomalies
    const activeUsers = this.getLatestMetric('active_users')?.value || 0;
    const expectedUsers = 500; // Expected baseline
    const deviation = Math.abs(activeUsers - expectedUsers) / expectedUsers;
    
    if (deviation > 0.5) { // 50% deviation
      this.anomalies.push({
        id: `traffic_${now.getTime()}`,
        type: 'traffic',
        severity: deviation > 1 ? 'high' : 'medium',
        description: `Unusual traffic pattern detected. ${activeUsers} active users vs expected ${expectedUsers}`,
        detectedAt: now,
        confidence: Math.min(0.95, deviation),
        metrics: {
          current: activeUsers,
          expected: expectedUsers,
          deviation: deviation
        },
        action: 'Investigate traffic sources and server capacity'
      });
    }

    // Check for error rate anomalies
    const errorRate = this.getLatestMetric('error_rate')?.value || 0;
    if (errorRate > 5) {
      this.anomalies.push({
        id: `error_${now.getTime()}`,
        type: 'error',
        severity: errorRate > 10 ? 'critical' : 'high',
        description: `High error rate detected: ${errorRate.toFixed(2)}%`,
        detectedAt: now,
        confidence: 0.9,
        metrics: {
          current: errorRate,
          expected: 2,
          deviation: errorRate / 2
        },
        action: 'Check error logs and system stability'
      });
    }

    // Check for performance anomalies
    const responseTime = this.getLatestMetric('response_time')?.value || 0;
    if (responseTime > 2000) {
      this.anomalies.push({
        id: `performance_${now.getTime()}`,
        type: 'performance',
        severity: responseTime > 5000 ? 'critical' : 'high',
        description: `Slow response time detected: ${responseTime.toFixed(0)}ms`,
        detectedAt: now,
        confidence: 0.85,
        metrics: {
          current: responseTime,
          expected: 500,
          deviation: responseTime / 500
        },
        action: 'Optimize database queries and check server resources'
      });
    }
  }

  private updateSystemHealth() {
    const criticalMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(metric => metric.status === 'critical');
    
    const warningMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(metric => metric.status === 'warning');

    if (criticalMetrics.length > 0) {
      this.health.overall = 'critical';
    } else if (warningMetrics.length > 2) {
      this.health.overall = 'degraded';
    } else {
      this.health.overall = 'healthy';
    }

    // Update individual service health
    this.health.services.database = this.getServiceHealth('database');
    this.health.services.api = this.getServiceHealth('api');
    this.health.services.search = this.getServiceHealth('search');
    this.health.services.chatbot = this.getServiceHealth('chatbot');
  }

  private getServiceHealth(service: string): 'healthy' | 'degraded' | 'critical' {
    // Simplified service health check
    const errorRate = this.getLatestMetric('error_rate')?.value || 0;
    const responseTime = this.getLatestMetric('response_time')?.value || 0;
    
    if (errorRate > 10 || responseTime > 5000) return 'critical';
    if (errorRate > 5 || responseTime > 2000) return 'degraded';
    return 'healthy';
  }

  private getLatestMetric(metricId: string): PerformanceMetric | undefined {
    const history = this.metrics.get(metricId) || [];
    return history[history.length - 1];
  }

  // Public methods
  getMetrics(): Map<string, PerformanceMetric[]> {
    return this.metrics;
  }

  getLatestMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
      .map(history => history[history.length - 1])
      .filter(Boolean);
  }

  getErrors(): ErrorLog[] {
    return this.errors.slice(-50); // Last 50 errors
  }

  getAnomalies(): AnomalyDetection[] {
    return this.anomalies.slice(-20); // Last 20 anomalies
  }

  getSystemHealth(): SystemHealth {
    return this.health;
  }

  logError(level: 'error' | 'warning' | 'info', message: string, context: Record<string, any> = {}) {
    const error: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      context,
      timestamp: new Date(),
      resolved: false
    };
    
    this.errors.push(error);
    
    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors.shift();
    }
  }

  resolveAnomaly(anomalyId: string) {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (anomaly) {
      this.anomalies = this.anomalies.filter(a => a.id !== anomalyId);
    }
  }

  getHealthScore(): number {
    const metrics = this.getLatestMetrics();
    if (metrics.length === 0) return 100;
    
    const healthyCount = metrics.filter(m => m.status === 'healthy').length;
    return Math.round((healthyCount / metrics.length) * 100);
  }

  getUptime(): number {
    // Simplified uptime calculation
    return this.health.uptime;
  }

  getAlerts(): { level: 'info' | 'warning' | 'critical'; message: string; timestamp: Date }[] {
    const alerts: { level: 'info' | 'warning' | 'critical'; message: string; timestamp: Date }[] = [];
    
    // Check for critical metrics
    const criticalMetrics = this.getLatestMetrics().filter(m => m.status === 'critical');
    criticalMetrics.forEach(metric => {
      alerts.push({
        level: 'critical',
        message: `${metric.name} is at critical level: ${metric.value}${metric.unit}`,
        timestamp: metric.timestamp
      });
    });

    // Check for recent anomalies
    const recentAnomalies = this.anomalies.filter(a => 
      Date.now() - a.detectedAt.getTime() < 300000 // Last 5 minutes
    );
    
    recentAnomalies.forEach(anomaly => {
      alerts.push({
        level: anomaly.severity === 'critical' ? 'critical' : 
               anomaly.severity === 'high' ? 'warning' : 'info',
        message: anomaly.description,
        timestamp: anomaly.detectedAt
      });
    });

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

// Factory function
export function createMonitoringSystem(): MonitoringSystem {
  return new MonitoringSystem();
}
