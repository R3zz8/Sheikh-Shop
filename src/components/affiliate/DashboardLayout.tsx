
'use client';

import { motion } from 'framer-motion';
import StatsCard from './StatsCard';
import ReferralLink from './ReferralLink';
import PerformanceChart from './PerformanceChart';
import { DollarSign, MousePointerClick, ShoppingCart } from 'lucide-react';

interface AffiliateData {
  referralCode: string;
  totalClicks: number;
  totalSales: number;
  commissionEarned: number;
}

interface DashboardLayoutProps {
  data: AffiliateData;
}

export default function DashboardLayout({ data }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-yellow-500 mb-6">Affiliate Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard title="Total Clicks" value={data.totalClicks} icon={<MousePointerClick />} />
          <StatsCard title="Total Sales" value={data.totalSales} icon={<ShoppingCart />} />
          <StatsCard title="Commission Earned" value={`$${data.commissionEarned.toFixed(2)}`} icon={<DollarSign />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Your Referral Link</h2>
            <ReferralLink referralCode={data.referralCode} />
          </div>
          <PerformanceChart />
        </div>
      </motion.div>
    </div>
  );
}
