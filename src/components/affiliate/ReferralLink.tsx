// src/components/affiliate/ReferralLink.tsx
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ReferralLinkProps {
  referralCode: string;
}

const ReferralLink: React.FC<ReferralLinkProps> = ({ referralCode }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://sheikhshops.com/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-800 to-yellow-900 p-6 rounded-lg shadow-lg text-white">
      <h3 className="text-lg font-semibold text-yellow-300 mb-4">Your Referral Link</h3>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          readOnly
          value={referralLink}
          className="w-full bg-yellow-950 text-white rounded-md px-4 py-2 border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <motion.button
          onClick={handleCopy}
          className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>
    </div>
  );
};

export default ReferralLink;
