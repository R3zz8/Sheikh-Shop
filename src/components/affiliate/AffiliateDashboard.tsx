// src/components/affiliate/AffiliateDashboard.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from './StatsCard';
import ReferralLink from './ReferralLink';
import TransactionHistory from './TransactionHistory';
import { motion } from 'framer-motion';
import AnalyticsChart from './AnalyticsChart';
import TrendCard from './TrendCard';

// Data types based on our new API
interface AffiliateData {
  totalClicks: number;
  totalSales: number;
  commissionEarned: number;
  referralCode: string;
}

interface DailyStat {
  date: string;
  clicks: number;
  sales: number;
  commission: number;
}

interface AnalyticsData {
  range: string;
  totals: {
    clicks: number;
    sales: number;
    commission: number;
  };
  trends: {
    clicks: number;
    sales: number;
    commission: number;
  };
  dailyStats: DailyStat[];
}

const AffiliateDashboard = () => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [affiliateRes, analyticsRes] = await Promise.all([
        fetch('/api/affiliate/me'),
        fetch(`/api/affiliate/analytics?range=${range}`),
      ]);
      if (!affiliateRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const affiliateData = await affiliateRes.json();
      const analyticsData = await analyticsRes.json();
      setAffiliateData(affiliateData);
      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExportCSV = async () => {
    try {
      const res = await fetch(`/api/affiliate/analytics?range=${range}&format=csv`);
      if (!res.ok) throw new Error('Failed to export CSV');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affiliate_analytics_${range}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  if (loading) {
    return <div className="text-white text-center p-10">Loading Dashboard...</div>;
  }

  if (!affiliateData) {
    return <div className="text-white text-center p-10">Could not load affiliate data.</div>;
  }

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-yellow-950 via-yellow-900 to-black min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Affiliate Dashboard
        </motion.h1>

        {/* General Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Clicks" value={affiliateData.totalClicks} />
          <StatsCard title="Total Sales" value={affiliateData.totalSales} />
          <StatsCard title="Lifetime Commission" value={`$${affiliateData.commissionEarned.toFixed(2)}`} />
        </div>

        <div className="mb-8">
          <ReferralLink referralCode={affiliateData.referralCode} />
        </div>

        {/* Analytics Section */}
        <div className="bg-gray-900 bg-opacity-40 p-6 rounded-xl shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-300">Performance Analytics</h2>
            <div className="flex items-center gap-4">
              {/* Range Selector */}
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as any)}
                className="bg-gray-800 text-white rounded-md px-3 py-2 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                aria-label="Select date range"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded-md transition-colors duration-300"
              >
                Export CSV
              </button>
            </div>
          </div>

          {analyticsData && (
            <>
              {/* Trend Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <TrendCard title="Clicks" value={analyticsData.totals.clicks.toLocaleString()} trend={analyticsData.trends.clicks} />
                <TrendCard title="Sales" value={analyticsData.totals.sales.toLocaleString()} trend={analyticsData.trends.sales} />
                <TrendCard title="Commission" value={`$${analyticsData.totals.commission.toFixed(2)}`} trend={analyticsData.trends.commission} />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <AnalyticsChart data={analyticsData.dailyStats} dataKey="clicks" title="Clicks Over Time" color="#FFC107" />
                <AnalyticsChart data={analyticsData.dailyStats} dataKey="sales" title="Sales Over Time" color="#FF9800" />
              </div>
               <div className="grid grid-cols-1 gap-8 mb-8">
                <AnalyticsChart data={analyticsData.dailyStats} dataKey="commission" title="Commission Over Time" color="#F57C00" />
              </div>
            </>
          )}
        </div>

        <div className="mt-12">
          <TransactionHistory />
        </div>
      </div>
    </motion.div>
  );
};

export default AffiliateDashboard;
