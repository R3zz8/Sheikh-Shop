// src/components/affiliate/Hero.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="relative text-white py-20 sm:py-32 bg-gradient-to-br from-yellow-950 via-yellow-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Join Sheikh Shop Affiliate Program
        </motion.h1>
        <motion.p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-yellow-200"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Partner with Sheikh Shop and earn commissions promoting premium saffron, dates, and honey worldwide.
        </motion.p>
        <motion.div
          className="flex justify-center space-x-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button className="bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition-colors">
            Join Now
          </button>
          <button className="border border-yellow-500 text-yellow-500 font-bold py-3 px-8 rounded-full hover:bg-yellow-500 hover:text-gray-900 transition-colors">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
