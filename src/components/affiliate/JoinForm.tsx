// src/components/affiliate/JoinForm.tsx
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JoinForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="py-20 sm:py-32 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Join Our Affiliate Program Today
        </motion.h2>
        <div className="max-w-xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-yellow-800 to-yellow-900 rounded-lg p-8 space-y-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <label htmlFor="name" className="block text-yellow-300 font-semibold mb-2">Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-yellow-950 text-white rounded-md px-4 py-2 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
            </div>
            <div>
              <label htmlFor="email" className="block text-yellow-300 font-semibold mb-2">Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full bg-yellow-950 text-white rounded-md px-4 py-2 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-yellow-300 font-semibold mb-2">Password</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} className="w-full bg-yellow-950 text-white rounded-md px-4 py-2 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition-colors">
              Join Now
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default JoinForm;
