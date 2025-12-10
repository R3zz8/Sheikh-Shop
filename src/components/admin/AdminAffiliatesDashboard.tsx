// src/components/admin/AdminAffiliatesDashboard.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Affiliate {
  id: string;
  balance: number;
  commissionEarned: number;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface PayoutLog {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    affiliate: Affiliate;
}

interface AdminDashboardData {
  totalAffiliates: number;
  totalUnpaidBalances: number;
  topPerformers: Affiliate[];
  payoutLogs: PayoutLog[];
}

const AdminAffiliatesDashboard = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [affiliatesRes, dashboardRes] = await Promise.all([
          fetch('/api/admin/affiliates'),
          fetch('/api/admin/dashboard'),
        ]);
        const affiliatesData = await affiliatesRes.json();
        const dashboardData = await dashboardRes.json();
        setAffiliates(affiliatesData);
        setDashboardData(dashboardData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAdminData();
  }, []);

  const handlePayout = async (affiliateId: string, amount: number) => {
    try {
      await fetch('/api/affiliate/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateId, amount }),
      });
      // Refresh the data after payout
      const [affiliatesRes, dashboardRes] = await Promise.all([
        fetch('/api/admin/affiliates'),
        fetch('/api/admin/dashboard'),
      ]);
      const affiliatesData = await affiliatesRes.json();
      const dashboardData = await dashboardRes.json();
      setAffiliates(affiliatesData);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">Admin - Affiliates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-300">Total Affiliates</h2>
            <p className="text-4xl font-bold text-white">{dashboardData?.totalAffiliates}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-300">Total Unpaid Balances</h2>
            <p className="text-4xl font-bold text-white">${dashboardData?.totalUnpaidBalances?.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-300">Top Performers</h2>
                <ul>
                    {dashboardData?.topPerformers?.map((affiliate) => (
                        <li key={affiliate.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span>{affiliate.user.firstName} {affiliate.user.lastName}</span>
                            <span>${affiliate.commissionEarned}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-300">Recent Payouts</h2>
                <ul>
                    {dashboardData?.payoutLogs?.map((log) => (
                        <li key={log.id} className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span>{log.affiliate.user.firstName} {log.affiliate.user.lastName}</span>
                            <span>${log.amount}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">All Affiliates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700">Name</th>
                  <th className="py-2 px-4 border-b border-gray-700">Email</th>
                  <th className="py-2 px-4 border-b border-gray-700">Balance</th>
                  <th className="py-2 px-4 border-b border-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(affiliates) && affiliates.map((affiliate) => (
                  <tr key={affiliate.id}>
                    <td className="py-2 px-4 border-b border-gray-700">{affiliate.user.firstName} {affiliate.user.lastName}</td>
                    <td className="py-2 px-4 border-b border-gray-700">{affiliate.user.email}</td>
                    <td className="py-2 px-4 border-b border-gray-700">${affiliate.balance}</td>
                    <td className="py-2 px-4 border-b border-gray-700">
                      <button
                        onClick={() => handlePayout(affiliate.id, affiliate.balance)}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        disabled={affiliate.balance <= 0}
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAffiliatesDashboard;
