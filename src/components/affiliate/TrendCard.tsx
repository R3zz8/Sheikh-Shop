// src/components/affiliate/TrendCard.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TrendCardProps {
  title: string;
  value: string;
  trend: number;
}

const TrendCard: React.FC<TrendCardProps> = ({ title, value, trend }) => {
  const isPositive = trend >= 0;

  return (
    <motion.div
      className="p-4 rounded-lg bg-gray-800 bg-opacity-50 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span className="ml-1">{trend.toFixed(2)}%</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">vs. previous period</p>
    </motion.div>
  );
};

export default TrendCard;
