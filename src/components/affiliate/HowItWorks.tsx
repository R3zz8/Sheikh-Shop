// src/components/affiliate/HowItWorks.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaLink, FaHandHoldingUsd } from 'react-icons/fa';

const steps = [
  {
    icon: <FaUserPlus className="w-12 h-12 text-yellow-400" />,
    title: 'Sign Up',
    description: 'Create an account in just a few minutes. It\'s free and easy to get started.',
  },
  {
    icon: <FaLink className="w-12 h-12 text-yellow-400" />,
    title: 'Promote',
    description: 'Share your unique affiliate link on your website, blog, or social media.',
  },
  {
    icon: <FaHandHoldingUsd className="w-12 h-12 text-yellow-400" />,
    title: 'Earn',
    description: 'Get paid for every sale that comes through your link. Track your earnings in your dashboard.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="text-center p-8 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <div className="flex justify-center mb-4">{step.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-yellow-300">{step.title}</h3>
              <p className="text-yellow-100">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
