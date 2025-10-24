
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/affiliate/DashboardLayout';
import { motion } from 'framer-motion';

type AffiliateData = {
  referralCode: string;
  totalClicks: number;
  totalSales: number;
  commissionEarned: number;
};

export default function AffiliateDashboard() {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/affiliate/dashboard');
        if (!res.ok) {
          throw new Error('Failed to fetch affiliate data');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <motion.div
            className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"
            animate={{ rotate: 360 }}
            transition={{ loop: Infinity, ease: "linear", duration: 1 }}
            />
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 bg-gray-900 flex items-center justify-center min-h-screen'>Error: {error}</div>;
  }

  return data ? <DashboardLayout data={data} /> : <div className="text-white bg-gray-900 flex items-center justify-center min-h-screen">No affiliate data found.</div>;
}
