// src/components/affiliate/WhyPartnerWithUs.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaDollarSign, FaStar, FaGlobe } from 'react-icons/fa';

const features = [
  {
    icon: <FaDollarSign className="w-12 h-12 text-yellow-400" />,
    title: 'Generous Commissions',
    description: 'Earn up to 25% on every sale you refer. The more you sell, the more you earn.',
  },
  {
    icon: <FaStar className="w-12 h-12 text-yellow-400" />,
    title: 'Premium Products',
    description: 'Promote our high-quality, organic saffron, dates, and honey that customers love.',
  },
  {
    icon: <FaGlobe className="w-12 h-12 text-yellow-400" />,
    title: 'Global Reach',
    description: 'We ship worldwide, so you can promote our products to a global audience.',
  },
];

const WhyPartnerWithUs = () => {
  return (
    <section className="py-20 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Why Partner With Us?
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-8 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-yellow-300">{feature.title}</h3>
              <p className="text-yellow-100">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyPartnerWithUs;
