'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Target,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import type { 
  SalesPrediction, 
  CustomerSegment, 
  MarketInsight, 
  PerformanceMetrics 
} from '@/lib/ai/analytics';

interface SmartAnalyticsDashboardProps {
  className?: string;
}

export default function SmartAnalyticsDashboard({ className = "" }: SmartAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'segments' | 'insights'>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    predictions: SalesPrediction[];
    segments: CustomerSegment[];
    insights: MarketInsight[];
    metrics: PerformanceMetrics;
    timing: any;
  } | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/smart?type=all');
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: MarketInsight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="w-5 h-5" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'recommendation':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: MarketInsight['type']) => {
    switch (type) {
      case 'trend':
        return 'text-blue-600 bg-blue-100';
      case 'opportunity':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'recommendation':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: MarketInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Smart Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">AI-powered insights and predictions</p>
            </div>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp },
            { id: 'segments', label: 'Segments', icon: Users },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Revenue</p>
                      <p className="text-2xl font-bold text-green-700">
                        ${data.metrics.revenue.current.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {data.metrics.revenue.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.metrics.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.metrics.revenue.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Orders</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {data.metrics.orders.current.toLocaleString()}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {data.metrics.orders.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.metrics.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.metrics.orders.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Customers</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {data.metrics.customers.current.toLocaleString()}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {data.metrics.customers.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.metrics.customers.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.metrics.customers.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Conversion</p>
                      <p className="text-2xl font-bold text-orange-700">
                        {data.metrics.conversion.current.toFixed(1)}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {data.metrics.conversion.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      data.metrics.conversion.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.metrics.conversion.changePercentage.toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Top Insights */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.insights.slice(0, 4).map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        {insight.actions && insight.actions.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Actions: {insight.actions.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Predictions</h3>
            <div className="space-y-4">
              {data.predictions.slice(0, 10).map((prediction, index) => (
                <motion.div
                  key={prediction.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{prediction.productName}</h4>
                      <p className="text-sm text-gray-500">Predicted sales: {prediction.predictedSales} units</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {Math.round(prediction.confidence * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">confidence</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Trend</div>
                      <div className={`${prediction.factors.historicalTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(prediction.factors.historicalTrend * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Season</div>
                      <div className={`${prediction.factors.seasonality > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(prediction.factors.seasonality * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Price</div>
                      <div className={`${prediction.factors.priceImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(prediction.factors.priceImpact * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-700">Competition</div>
                      <div className="text-red-600">
                        -{(prediction.factors.competition * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.segments.map((segment, index) => (
                <motion.div
                  key={segment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                      <p className="text-sm text-gray-600">{segment.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{segment.size} customers</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Order Value:</span>
                      <span className="font-medium">${segment.characteristics.avgOrderValue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchase Frequency:</span>
                      <span className="font-medium">{segment.characteristics.purchaseFrequency}/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price Sensitivity:</span>
                      <span className={`font-medium capitalize ${
                        segment.characteristics.priceSensitivity === 'low' ? 'text-green-600' :
                        segment.characteristics.priceSensitivity === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {segment.characteristics.priceSensitivity}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                    <p className="text-xs text-gray-600">{segment.recommendations.marketingStrategy}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
            <div className="space-y-4">
              {data.insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Current Value</div>
                          <div className="font-medium">{insight.data.currentValue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Change</div>
                          <div className={`font-medium ${
                            insight.data.change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {insight.data.change > 0 ? '+' : ''}{insight.data.changePercentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {insight.actions && insight.actions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions:</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {insight.actions.map((action, actionIndex) => (
                              <li key={actionIndex} className="flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

