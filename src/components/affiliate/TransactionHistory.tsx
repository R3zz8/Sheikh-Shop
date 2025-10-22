// src/components/affiliate/TransactionHistory.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/affiliate/transactions');
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <motion.div
      className="bg-gradient-to-br from-yellow-800 to-yellow-900 p-6 rounded-lg shadow-lg text-white mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-yellow-300 mb-4">Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-yellow-700">Date</th>
              <th className="py-2 px-4 border-b border-yellow-700">Amount</th>
              <th className="py-2 px-4 border-b border-yellow-700">Status</th>
              <th className="py-2 px-4 border-b border-yellow-700">Transaction ID</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="py-2 px-4 border-b border-yellow-700">{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 border-b border-yellow-700">${transaction.amount}</td>
                <td className="py-2 px-4 border-b border-yellow-700">{transaction.status}</td>
                <td className="py-2 px-4 border-b border-yellow-700">{transaction.transactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
