
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check } from 'lucide-react';

interface ReferralLinkProps {
  referralCode: string;
}

export default function ReferralLink({ referralCode }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://sheikhshops.com/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="bg-gray-800 p-4 rounded-lg shadow-inner flex items-center justify-between border border-yellow-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <span className="text-gray-300 font-mono">{referralLink}</span>
      <button
        onClick={handleCopy}
        className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
      >
        {copied ? <Check size={20} /> : <Clipboard size={20} />}
      </button>
    </motion.div>
  );
}
