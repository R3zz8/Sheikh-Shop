'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Server, 
  Database, 
  Search, 
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  RefreshCw,
  Eye,
  Zap
} from 'lucide-react';
import { createMonitoringSystem, type PerformanceMetric, type AnomalyDetection, type SystemHealth } from '@/lib/ai/monitoring';

interface MonitoringDashboardProps {
  className?: string;
  refreshInterval?: number;
}

export default function MonitoringDashboard({ 
  className = '', 
  refreshInterval = 5000 
}: MonitoringDashboardProps) {
  const [monitoring] = useState(() => createMonitoringSystem());
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateData = () => {
      setMetrics(monitoring.getLatestMetrics());
      setAnomalies(monitoring.getAnomalies());
      setHealth(monitoring.getSystemHealth());
      setAlerts(monitoring.getAlerts());
      setLoading(false);
    };

    updateData();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(updateData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [monitoring, refreshInterval, autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'api':
        return <Server className="w-5 h-5" />;
      case 'search':
        return <Search className="w-5 h-5" />;
      case 'chatbot':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">System Monitoring</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Status</span>
                {getStatusIcon(health.overall)}
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(health.overall)}`}>
                {health.overall.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Uptime: {health.uptime}%
              </div>
            </motion.div>

            {Object.entries(health.services).map(([service, status], index) => (
              <motion.div
                key={service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getServiceIcon(service)}
                    <span className="text-sm text-gray-600 capitalize">{service}</span>
                  </div>
                  {getStatusIcon(status)}
                </div>
                <div className={`text-sm font-medium ${getStatusColor(status)}`}>
                  {status.toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{metric.name}</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
              </div>
              <div className="text-xs text-gray-500">
                {metric.timestamp.toLocaleTimeString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Active Alerts
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border-l-4 ${
                  alert.level === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {alert.level === 'critical' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : alert.level === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {alert.message}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Anomaly Detection
          </h3>
          <div className="space-y-3">
            {anomalies.slice(0, 5).map((anomaly, index) => (
              <motion.div
                key={anomaly.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        anomaly.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        anomaly.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                        anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {anomaly.severity.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)} Anomaly
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      Confidence: {Math.round(anomaly.confidence * 100)}% | 
                      Detected: {anomaly.detectedAt.toLocaleString()}
                    </div>
                    {anomaly.action && (
                      <p className="text-xs text-gray-600">
                        <strong>Recommended Action:</strong> {anomaly.action}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => monitoring.resolveAnomaly(anomaly.id)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Resolve anomaly"
                  >
                    <XCircle className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance charts would be displayed here</p>
            <p className="text-sm text-gray-400">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
