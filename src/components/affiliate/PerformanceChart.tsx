
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

// TODO: Replace with dynamic data from the API
const data = [];

export default function PerformanceChart() {
  return (
    <motion.div
      className="bg-gray-800 p-6 rounded-lg shadow-lg border border-yellow-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-xl font-bold text-white mb-4">Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="name" stroke="#a0aec0" />
          <YAxis stroke="#a0aec0" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a202c',
              borderColor: '#4a5568',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="clicks" stroke="#f6e05e" strokeWidth={2} />
          <Line type="monotone" dataKey="sales" stroke="#a0aec0" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
