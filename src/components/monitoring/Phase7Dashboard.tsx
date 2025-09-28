'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Eye, 
  Headphones, 
  Smartphone,
  Trophy,
  Share2,
  Calendar,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { createPhase7Analytics, type Phase7KPIs, type ARVRAnalytics, type GamificationAnalytics, type SocialEngagementAnalytics } from '@/lib/monitoring/phase7-analytics';

interface Phase7DashboardProps {
  className?: string;
}

export default function Phase7Dashboard({ className = '' }: Phase7DashboardProps) {
  const [analytics] = useState(() => createPhase7Analytics());
  const [kpis, setKpis] = useState<Phase7KPIs | null>(null);
  const [arVrData, setArVrData] = useState<ARVRAnalytics | null>(null);
  const [gamificationData, setGamificationData] = useState<GamificationAnalytics | null>(null);
  const [socialData, setSocialData] = useState<SocialEngagementAnalytics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [timeRange, analytics]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const [kpisData, arVrData, gamificationData, socialData] = await Promise.all([
        analytics.getPhase7KPIs(startDate, endDate),
        analytics.getARVRAnalytics(startDate, endDate),
        analytics.getGamificationAnalytics(startDate, endDate),
        analytics.getSocialEngagementAnalytics(startDate, endDate),
      ]);

      setKpis(kpisData);
      setArVrData(arVrData);
      setGamificationData(gamificationData);
      setSocialData(socialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const metrics = await analytics.getRealTimeMetrics();
      setRealTimeMetrics(metrics);
    } catch (err) {
      console.error('Error loading real-time metrics:', err);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-500" />
            Phase 7 Analytics Dashboard
          </h2>
          <p className="text-gray-600">AR/VR, Gamification & Social Engagement Metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realTimeMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Active AR Sessions</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {realTimeMetrics.activeARSessions}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Active VR Sessions</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {realTimeMetrics.activeVRSessions}
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Live Events</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {realTimeMetrics.activeLiveEvents}
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Online Users</span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {realTimeMetrics.onlineUsers}
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* AR/VR Engagement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">AR/VR Engagement</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily AR Sessions</span>
                <span className="font-semibold">{formatNumber(kpis.arVrEngagement.dailyARSessions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily VR Sessions</span>
                <span className="font-semibold">{formatNumber(kpis.arVrEngagement.dailyVRSessions)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">AR Conversion</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(kpis.arVrEngagement.arConversionRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Gamification Engagement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900">Gamification</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Active Users</span>
                <span className="font-semibold">{formatNumber(kpis.gamificationEngagement.dailyActiveUsers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Session Time</span>
                <span className="font-semibold">{Math.round(kpis.gamificationEngagement.averageSessionTime)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reward Redemption</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(kpis.gamificationEngagement.rewardRedemptionRate)}
                </span>
              </div>
            </div>
          </div>

          {/* Social Engagement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900">Social Engagement</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily Shares</span>
                <span className="font-semibold">{formatNumber(kpis.socialEngagement.dailyShares)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Social Conversion</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(kpis.socialEngagement.socialConversionRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Event Attendance</span>
                <span className="font-semibold">{Math.round(kpis.socialEngagement.liveEventAttendance)}</span>
              </div>
            </div>
          </div>

          {/* Overall Engagement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Overall</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Engagement Score</span>
                <span className="font-semibold">{formatNumber(kpis.overallEngagement.totalEngagementScore)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">User Retention</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(kpis.overallEngagement.userRetentionRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Feature Adoption</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(kpis.overallEngagement.featureAdoptionRate)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AR/VR Analytics */}
        {arVrData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              AR/VR Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {formatNumber(arVrData.totalARSessions)}
                  </div>
                  <div className="text-sm text-blue-700">Total AR Sessions</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {formatNumber(arVrData.totalVRSessions)}
                  </div>
                  <div className="text-sm text-purple-700">Total VR Sessions</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Average AR Session Duration</span>
                  <span className="font-medium">{Math.round(arVrData.averageARSessionDuration)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Average VR Session Duration</span>
                  <span className="font-medium">{Math.round(arVrData.averageVRSessionDuration)}s</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gamification Analytics */}
        {gamificationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-500" />
              Gamification Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-900">
                    {formatNumber(gamificationData.totalUsers)}
                  </div>
                  <div className="text-sm text-amber-700">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {formatNumber(gamificationData.totalXP)}
                  </div>
                  <div className="text-sm text-green-700">Total XP</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Average Level</span>
                  <span className="font-medium">{gamificationData.averageLevel.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <span className="font-medium">{formatNumber(gamificationData.activeUsers)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
