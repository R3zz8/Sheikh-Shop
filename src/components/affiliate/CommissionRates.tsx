// src/components/affiliate/CommissionRates.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const CommissionRates = () => {
  return (
    <section className="py-20 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Our Commission Rates
        </motion.h2>
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg p-8"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center border-b border-yellow-700 pb-4 mb-4">
              <h3 className="text-xl font-bold text-yellow-300">Sales Volume</h3>
              <h3 className="text-xl font-bold text-yellow-300">Commission Rate</h3>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-yellow-100">$0 - $1,000</p>
              <p className="text-yellow-100 font-bold">15%</p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-yellow-100">$1,001 - $5,000</p>
              <p className="text-yellow-100 font-bold">20%</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-yellow-100">$5,001+</p>
              <p className="text-yellow-100 font-bold">25%</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommissionRates;
