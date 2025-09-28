'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  Send,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { createSocialManager } from '@/lib/social/social-manager';
import type { ProductsWithImages } from '@/types';

interface SocialShareProps {
  product: ProductsWithImages;
  userId?: string;
  className?: string;
}

const platforms = [
  { 
    name: 'Facebook', 
    icon: Facebook, 
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white'
  },
  { 
    name: 'Twitter', 
    icon: Twitter, 
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white'
  },
  { 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    textColor: 'text-white'
  },
  { 
    name: 'LinkedIn', 
    icon: Linkedin, 
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-white'
  },
  { 
    name: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white'
  },
  { 
    name: 'Telegram', 
    icon: Send, 
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white'
  },
];

export default function SocialShare({ 
  product, 
  userId, 
  className = '' 
}: SocialShareProps) {
  const [socialManager] = useState(() => createSocialManager());
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const handleShare = async (platform: string) => {
    try {
      setIsSharing(true);
      
      // Generate share URL
      const shareUrl = socialManager.generateShareUrl(product.id, platform);
      
      // Create social share record
      await socialManager.createSocialShare(userId, product.id, platform, shareUrl);
      
      // Open share URL
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Update share count
      setShareCount(prev => prev + 1);
      
      // Close modal
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const productUrl = `${window.location.origin}/products/${product.id}`;
      await navigator.clipboard.writeText(productUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleDeepLink = (platform: string) => {
    const deepLink = socialManager.generateDeepLink(product.id, platform);
    window.location.href = deepLink;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
        {shareCount > 0 && (
          <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
            {shareCount}
          </span>
        )}
      </button>

      {/* Share Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share {product.name}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Product Preview */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    ${product.basePrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Platform Buttons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {platforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleShare(platform.name)}
                    disabled={isSharing}
                    className={`p-3 rounded-lg transition-all ${platform.color} ${platform.textColor} disabled:opacity-50 hover:scale-105`}
                  >
                    <platform.icon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>

              {/* Copy Link */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={`${window.location.origin}/products/${product.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      copiedUrl
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {copiedUrl ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {copiedUrl && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 text-sm mt-2"
                  >
                    Link copied to clipboard!
                  </motion.p>
                )}
              </div>

              {/* Mobile Deep Links */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  On mobile? Try these direct links:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeepLink('whatsapp')}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleDeepLink('telegram')}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    <Send className="w-3 h-3" />
                    Telegram
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
