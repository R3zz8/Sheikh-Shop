// src/components/affiliate/AffiliateDashboard.tsx
'use client';
import React, { useState, useEffect } from 'react';
import StatsCard from './StatsCard';
import ReferralLink from './ReferralLink';
import PerformanceChart from './PerformanceChart';
import ProgressCard from './ProgressCard';
import TransactionHistory from './TransactionHistory';
import { motion } from 'framer-motion';

interface AffiliateData {
  totalClicks: number;
  totalSales: number;
  commissionEarned: number;
  referralCode: string;
}

interface PerformanceData {
  name: string;
  sales: number;
  clicks: number;
}

interface ProgressGoals {
  sales: { value: number; goal: number };
  clicks: { value: number; goal: number };
}

const AffiliateDashboard = () => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [progressGoals, setProgressGoals] = useState<ProgressGoals | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [affiliateRes, performanceRes] = await Promise.all([
          fetch('/api/affiliate/me'),
          fetch('/api/affiliate/performance'),
        ]);
        const affiliateData = await affiliateRes.json();
        const performanceData = await performanceRes.json();
        setAffiliateData(affiliateData);
        setPerformanceData(performanceData.performanceData);
        setProgressGoals(performanceData.progressGoals);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!affiliateData || !progressGoals) {
    return <div>Loading...</div>;
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Clicks" value={affiliateData.totalClicks} />
          <StatsCard title="Total Sales" value={affiliateData.totalSales} />
          <StatsCard title="Total Earned" value={`$${affiliateData.commissionEarned}`} />
        </div>

        <div className="mb-8">
          <ReferralLink referralCode={affiliateData.referralCode} />
        </div>

        <div className="mb-8">
          <PerformanceChart data={performanceData} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressCard title="Sales Goal" value={progressGoals.sales.value} goal={progressGoals.sales.goal} />
            <ProgressCard title="Clicks Goal" value={progressGoals.clicks.value} goal={progressGoals.clicks.goal} />
          </div>
        </div>

        <TransactionHistory />
      </div>
    </motion.div>
  );
};

export default AffiliateDashboard;
