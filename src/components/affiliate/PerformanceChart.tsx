// src/components/affiliate/PerformanceChart.tsx
'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ChartData {
  name: string;
  sales: number;
  clicks: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-yellow-800 to-yellow-900 p-6 rounded-lg shadow-lg text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-yellow-300 mb-4">Performance Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#A16207" />
          <XAxis dataKey="name" stroke="#FDE68A" />
          <YAxis stroke="#FDE68A" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#422006',
              borderColor: '#A16207',
            }}
          />
          <Legend wrapperStyle={{ color: '#FDE68A' }} />
          <Line type="monotone" dataKey="sales" stroke="#FBBF24" strokeWidth={2} />
          <Line type="monotone" dataKey="clicks" stroke="#FDE68A" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default PerformanceChart;
