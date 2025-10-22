// src/components/affiliate/StatsCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-yellow-800 to-yellow-900 p-6 rounded-lg shadow-lg text-white"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <h3 className="text-lg font-semibold text-yellow-300">{title}</h3>
      <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">{value}</p>
    </motion.div>
  );
};

export default StatsCard;
