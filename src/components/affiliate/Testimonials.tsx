// src/components/affiliate/Testimonials.tsx
'use client';
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "The best affiliate program I've ever been a part of. The products are amazing and the commissions are great.",
    author: 'John Doe',
  },
  {
    quote: "I've been able to generate a significant income stream thanks to Sheikh Shop's affiliate program.",
    author: 'Jane Smith',
  },
  {
    quote: "My audience loves the products, which makes them easy to promote. Highly recommended!",
    author: 'Peter Jones',
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          What Our Partners Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="p-8 bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <p className="text-lg italic text-yellow-100 mb-4">"{testimonial.quote}"</p>
              <p className="text-right font-bold text-yellow-300">- {testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
