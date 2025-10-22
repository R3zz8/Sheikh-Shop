// src/components/affiliate/ProgressCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressCardProps {
  title: string;
  value: number;
  goal: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value, goal }) => {
  const percentage = (value / goal) * 100;

  return (
    <motion.div
      className="bg-gradient-to-br from-yellow-800 to-yellow-900 p-6 rounded-lg shadow-lg text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-yellow-300">{title}</h3>
        <p className="text-yellow-300">{`${value} / ${goal}`}</p>
      </div>
      <div className="w-full bg-yellow-950 rounded-full h-2.5">
        <motion.div
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

export default ProgressCard;
