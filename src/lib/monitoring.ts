import { NextRequest } from 'next/server';

export interface MonitoringEvent {
  id: string;
  type: 'error' | 'warning' | 'info' | 'performance' | 'security' | 'business';
  level: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
  metadata: {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    url?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    userAgent?: string;
    ip?: string;
    [key: string]: any;
  };
  resolved?: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface AnomalyDetection {
  id: string;
  type: 'traffic' | 'sales' | 'error' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  baseline: number;
  current: number;
  deviation: number;
  confidence: number;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  metadata: Record<string, any>;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  throughput: number;
  lastChecked: Date;
  components: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    api: 'healthy' | 'degraded' | 'unhealthy';
    cache: 'healthy' | 'degraded' | 'unhealthy';
    search: 'healthy' | 'degraded' | 'unhealthy';
  };
}

export class MonitoringSystem {
  private static instance: MonitoringSystem;
  private events: MonitoringEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private anomalies: AnomalyDetection[] = [];
  private healthChecks: Map<string, Date> = new Map();

  private constructor() {
    this.startHealthMonitoring();
    this.startAnomalyDetection();
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem();
    }
    return MonitoringSystem.instance;
  }

  // Log monitoring event
  logEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): void {
    const monitoringEvent: MonitoringEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.events.push(monitoringEvent);

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Check for anomalies
    this.checkForAnomalies(monitoringEvent);

    // Send alerts for critical events
    if (event.level === 'critical') {
      this.sendAlert(monitoringEvent);
    }
  }

  // Record performance metric
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const performanceMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.metrics.push(performanceMetric);

    // Keep only last 10000 metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000);
    }
  }

  // Get system health
  getSystemHealth(): SystemHealth {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Calculate response time metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp > lastHour);
    const responseTimeMetrics = recentMetrics.filter(m => m.name === 'response_time');
    
    const responseTimes = responseTimeMetrics.map(m => m.value);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;
    
    const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p99Index = Math.floor(sortedResponseTimes.length * 0.99);
    
    const p95ResponseTime = sortedResponseTimes[p95Index] || 0;
    const p99ResponseTime = sortedResponseTimes[p99Index] || 0;

    // Calculate error rate
    const recentEvents = this.events.filter(e => e.timestamp > lastHour);
    const errorEvents = recentEvents.filter(e => e.type === 'error');
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

    // Calculate throughput
    const throughput = recentEvents.filter(e => e.type === 'info').length;

    // Determine overall status
    let status: SystemHealth['status'] = 'healthy';
    if (errorRate > 5 || averageResponseTime > 2000) {
      status = 'unhealthy';
    } else if (errorRate > 2 || averageResponseTime > 1000) {
      status = 'degraded';
    }

    // Check component health
    const components = this.checkComponentHealth();

    return {
      status,
      uptime: this.calculateUptime(),
      responseTime: {
        average: averageResponseTime,
        p95: p95ResponseTime,
        p99: p99ResponseTime,
      },
      errorRate,
      throughput,
      lastChecked: now,
      components,
    };
  }

  // Get recent events
  getRecentEvents(limit: number = 50, type?: MonitoringEvent['type']): MonitoringEvent[] {
    let filteredEvents = this.events;
    
    if (type) {
      filteredEvents = filteredEvents.filter(e => e.type === type);
    }
    
    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get performance metrics
  getPerformanceMetrics(name?: string, timeRange?: { start: Date; end: Date }): PerformanceMetric[] {
    let filteredMetrics = this.metrics;
    
    if (name) {
      filteredMetrics = filteredMetrics.filter(m => m.name === name);
    }
    
    if (timeRange) {
      filteredMetrics = filteredMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return filteredMetrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Get anomalies
  getAnomalies(status?: AnomalyDetection['status']): AnomalyDetection[] {
    let filteredAnomalies = this.anomalies;
    
    if (status) {
      filteredAnomalies = filteredAnomalies.filter(a => a.status === status);
    }
    
    return filteredAnomalies.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  // Resolve anomaly
  resolveAnomaly(anomalyId: string, resolvedBy: string): boolean {
    const anomaly = this.anomalies.find(a => a.id === anomalyId);
    if (anomaly) {
      anomaly.status = 'resolved';
      anomaly.resolvedAt = new Date();
      anomaly.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  // Mark event as resolved
  resolveEvent(eventId: string, resolvedBy: string): boolean {
    const event = this.events.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = new Date();
      event.resolvedBy = resolvedBy;
      return true;
    }
    return false;
  }

  // Start health monitoring
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  // Start anomaly detection
  private startAnomalyDetection(): void {
    setInterval(() => {
      this.detectAnomalies();
    }, 60000); // Check every minute
  }

  // Perform health check
  private performHealthCheck(): void {
    const components = ['database', 'api', 'cache', 'search'];
    
    components.forEach(component => {
      // Simulate health check
      const isHealthy = Math.random() > 0.1; // 90% chance of being healthy
      
      if (isHealthy) {
        this.healthChecks.set(component, new Date());
      } else {
        this.logEvent({
          type: 'error',
          level: 'high',
          message: `${component} health check failed`,
          source: 'health_monitor',
          metadata: { component },
        });
      }
    });
  }

  // Detect anomalies
  private detectAnomalies(): void {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Traffic anomaly detection
    const recentEvents = this.events.filter(e => e.timestamp > lastHour);
    const trafficEvents = recentEvents.filter(e => e.type === 'info');
    const baselineTraffic = 100; // Expected traffic per hour
    
    if (trafficEvents.length > baselineTraffic * 2) {
      this.createAnomaly({
        type: 'traffic',
        severity: 'high',
        description: `Traffic spike detected: ${trafficEvents.length} events vs baseline ${baselineTraffic}`,
        baseline: baselineTraffic,
        current: trafficEvents.length,
        deviation: trafficEvents.length - baselineTraffic,
        confidence: 0.8,
        metadata: { timeRange: '1 hour' },
      });
    }
    
    // Error rate anomaly detection
    const errorEvents = recentEvents.filter(e => e.type === 'error');
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;
    const baselineErrorRate = 2; // 2% baseline error rate
    
    if (errorRate > baselineErrorRate * 3) {
      this.createAnomaly({
        type: 'error',
        severity: 'critical',
        description: `High error rate detected: ${errorRate.toFixed(2)}% vs baseline ${baselineErrorRate}%`,
        baseline: baselineErrorRate,
        current: errorRate,
        deviation: errorRate - baselineErrorRate,
        confidence: 0.9,
        metadata: { timeRange: '1 hour' },
      });
    }
    
    // Performance anomaly detection
    const responseTimeMetrics = this.metrics.filter(m => 
      m.name === 'response_time' && m.timestamp > lastHour
    );
    
    if (responseTimeMetrics.length > 0) {
      const avgResponseTime = responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length;
      const baselineResponseTime = 500; // 500ms baseline
      
      if (avgResponseTime > baselineResponseTime * 2) {
        this.createAnomaly({
          type: 'performance',
          severity: 'medium',
          description: `Slow response time detected: ${avgResponseTime.toFixed(0)}ms vs baseline ${baselineResponseTime}ms`,
          baseline: baselineResponseTime,
          current: avgResponseTime,
          deviation: avgResponseTime - baselineResponseTime,
          confidence: 0.7,
          metadata: { timeRange: '1 hour' },
        });
      }
    }
  }

  // Create anomaly
  private createAnomaly(anomaly: Omit<AnomalyDetection, 'id' | 'detectedAt' | 'status'>): void {
    const newAnomaly: AnomalyDetection = {
      ...anomaly,
      id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: new Date(),
      status: 'active',
    };
    
    this.anomalies.push(newAnomaly);
    
    // Keep only last 100 anomalies
    if (this.anomalies.length > 100) {
      this.anomalies = this.anomalies.slice(-100);
    }
    
    // Send alert for high severity anomalies
    if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
      this.sendAnomalyAlert(newAnomaly);
    }
  }

  // Check for anomalies in new events
  private checkForAnomalies(event: MonitoringEvent): void {
    // Check for security anomalies
    if (event.type === 'security' && event.level === 'high') {
      this.createAnomaly({
        type: 'security',
        severity: 'critical',
        description: `Security event detected: ${event.message}`,
        baseline: 0,
        current: 1,
        deviation: 1,
        confidence: 0.95,
        metadata: event.metadata,
      });
    }
    
    // Check for business anomalies (sales spikes, etc.)
    if (event.type === 'business' && event.metadata.sales) {
      const sales = event.metadata.sales;
      const baseline = 1000; // Expected daily sales
      
      if (sales > baseline * 1.5) {
        this.createAnomaly({
          type: 'sales',
          severity: 'medium',
          description: `Sales spike detected: $${sales} vs baseline $${baseline}`,
          baseline,
          current: sales,
          deviation: sales - baseline,
          confidence: 0.8,
          metadata: event.metadata,
        });
      }
    }
  }

  // Check component health
  private checkComponentHealth(): SystemHealth['components'] {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const getComponentStatus = (component: string): 'healthy' | 'degraded' | 'unhealthy' => {
      const lastCheck = this.healthChecks.get(component);
      if (!lastCheck || lastCheck < fiveMinutesAgo) {
        return 'unhealthy';
      }
      
      // Check for recent errors
      const recentErrors = this.events.filter(e => 
        e.timestamp > fiveMinutesAgo && 
        e.metadata.component === component && 
        e.type === 'error'
      );
      
      if (recentErrors.length > 5) {
        return 'unhealthy';
      } else if (recentErrors.length > 2) {
        return 'degraded';
      }
      
      return 'healthy';
    };
    
    return {
      database: getComponentStatus('database'),
      api: getComponentStatus('api'),
      cache: getComponentStatus('cache'),
      search: getComponentStatus('search'),
    };
  }

  // Calculate system uptime
  private calculateUptime(): number {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > oneDayAgo);
    const errorEvents = recentEvents.filter(e => e.type === 'error' && e.level === 'critical');
    
    const downtime = errorEvents.length * 5; // Assume 5 minutes downtime per critical error
    const totalMinutes = 24 * 60;
    const uptimeMinutes = totalMinutes - downtime;
    
    return (uptimeMinutes / totalMinutes) * 100;
  }

  // Send alert
  private sendAlert(event: MonitoringEvent): void {
    console.log(`🚨 ALERT: ${event.level.toUpperCase()} - ${event.message}`, {
      type: event.type,
      source: event.source,
      timestamp: event.timestamp,
      metadata: event.metadata,
    });
    
    // In a real implementation, this would send alerts via:
    // - Email
    // - Slack
    // - PagerDuty
    // - SMS
    // - Webhook
  }

  // Send anomaly alert
  private sendAnomalyAlert(anomaly: AnomalyDetection): void {
    console.log(`🔍 ANOMALY DETECTED: ${anomaly.severity.toUpperCase()} - ${anomaly.description}`, {
      type: anomaly.type,
      confidence: anomaly.confidence,
      deviation: anomaly.deviation,
      detectedAt: anomaly.detectedAt,
      metadata: anomaly.metadata,
    });
  }
}

// Export singleton instance
export const monitoringSystem = MonitoringSystem.getInstance();

// Utility functions for common monitoring tasks
export function logError(error: Error, context?: Record<string, any>): void {
  monitoringSystem.logEvent({
    type: 'error',
    level: 'high',
    message: error.message,
    source: 'application',
    metadata: {
      stack: error.stack,
      ...context,
    },
  });
}

export function logPerformance(metric: string, value: number, tags?: Record<string, string>): void {
  monitoringSystem.recordMetric({
    name: metric,
    value,
    unit: 'ms',
    tags: tags || {},
  });
}

export function logSecurityEvent(event: string, level: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>): void {
  monitoringSystem.logEvent({
    type: 'security',
    level,
    message: event,
    source: 'security',
    metadata: metadata || {},
  });
}

export function logBusinessEvent(event: string, metadata?: Record<string, any>): void {
  monitoringSystem.logEvent({
    type: 'business',
    level: 'medium',
    message: event,
    source: 'business',
    metadata: metadata || {},
  });
}

// Middleware for request monitoring
export function withMonitoring(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const response = await handler(req);
      const responseTime = Date.now() - startTime;
      
      // Log successful request
      monitoringSystem.logEvent({
        type: 'info',
        level: 'low',
        message: `${req.method} ${req.url} - ${response.status}`,
        source: 'api',
        metadata: {
          requestId,
          method: req.method,
          url: req.url,
          statusCode: response.status,
          responseTime,
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        },
      });
      
      // Record performance metric
      monitoringSystem.recordMetric({
        name: 'response_time',
        value: responseTime,
        unit: 'ms',
        tags: {
          method: req.method,
          status: response.status.toString(),
          endpoint: req.url,
        },
      });
      
      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Log error
      logError(error as Error, {
        requestId,
        method: req.method,
        url: req.url,
        responseTime,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      });
      
      throw error;
    }
  };
}

