'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Copy, 
  Check, 
  Clock, 
  Star,
  Tag,
  Truck,
  Zap,
  Crown,
  AlertCircle
} from 'lucide-react';
import { createGamificationEngine, type Reward } from '@/lib/gamification/gamification-engine';

interface RewardsProps {
  userId: string;
  className?: string;
}

export default function Rewards({ userId, className = '' }: RewardsProps) {
  const [gamificationEngine] = useState(() => createGamificationEngine());
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [userId, gamificationEngine]);

  const loadRewards = async () => {
    try {
      setIsLoading(true);
      const userRewards = await gamificationEngine.getUserRewards(userId);
      setRewards(userRewards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'DISCOUNT_COUPON':
        return <Tag className="w-5 h-5 text-green-500" />;
      case 'FREE_SHIPPING':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'POINTS_BONUS':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'EXCLUSIVE_ACCESS':
        return <Crown className="w-5 h-5 text-purple-500" />;
      case 'BADGE':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'ACHIEVEMENT':
        return <Gift className="w-5 h-5 text-orange-500" />;
      default:
        return <Gift className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRewardColor = (type: Reward['type']) => {
    switch (type) {
      case 'DISCOUNT_COUPON':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'FREE_SHIPPING':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'POINTS_BONUS':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'EXCLUSIVE_ACCESS':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'BADGE':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'ACHIEVEMENT':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatRewardValue = (reward: Reward) => {
    switch (reward.type) {
      case 'DISCOUNT_COUPON':
        return reward.value ? `${reward.value}% OFF` : 'Discount';
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      case 'POINTS_BONUS':
        return reward.value ? `+${reward.value} XP` : 'Bonus Points';
      case 'EXCLUSIVE_ACCESS':
        return 'Exclusive Access';
      case 'BADGE':
        return 'Badge Unlocked';
      case 'ACHIEVEMENT':
        return 'Achievement';
      default:
        return 'Reward';
    }
  };

  const isExpired = (expiresAt?: Date | null) => {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load rewards</p>
          <button
            onClick={loadRewards}
            className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeRewards = rewards.filter(r => !r.isRedeemed && !isExpired(r.expiresAt));
  const redeemedRewards = rewards.filter(r => r.isRedeemed);
  const expiredRewards = rewards.filter(r => !r.isRedeemed && isExpired(r.expiresAt));

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-amber-500" />
          My Rewards
        </h2>
        <button
          onClick={loadRewards}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
          >
            <Gift className="w-5 h-5" />
          </motion.div>
        </button>
      </div>

      {/* Active Rewards */}
      {activeRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Rewards ({activeRewards.length})
          </h3>
          <div className="space-y-3">
            <AnimatePresence>
              {activeRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${getRewardColor(reward.type)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRewardIcon(reward.type)}
                      <div>
                        <h4 className="font-semibold">{reward.title}</h4>
                        {reward.description && (
                          <p className="text-sm opacity-75">{reward.description}</p>
                        )}
                        <div className="text-sm font-medium">
                          {formatRewardValue(reward)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {reward.code && (
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-white/50 rounded text-sm font-mono">
                            {reward.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(reward.code!)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                          >
                            {copiedCode === reward.code ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}
                      
                      {reward.expiresAt && (
                        <div className="text-xs opacity-75 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            Expires {new Date(reward.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Redeemed Rewards */}
      {redeemedRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Redeemed Rewards ({redeemedRewards.length})
          </h3>
          <div className="space-y-3">
            {redeemedRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-lg border-2 bg-gray-100 border-gray-300 opacity-75"
              >
                <div className="flex items-center gap-3">
                  {getRewardIcon(reward.type)}
                  <div>
                    <h4 className="font-semibold text-gray-600">{reward.title}</h4>
                    {reward.description && (
                      <p className="text-sm text-gray-500">{reward.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      Redeemed on {new Date(reward.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Expired Rewards */}
      {expiredRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expired Rewards ({expiredRewards.length})
          </h3>
          <div className="space-y-3">
            {expiredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-4 rounded-lg border-2 bg-red-50 border-red-200 opacity-60"
              >
                <div className="flex items-center gap-3">
                  {getRewardIcon(reward.type)}
                  <div>
                    <h4 className="font-semibold text-red-600">{reward.title}</h4>
                    {reward.description && (
                      <p className="text-sm text-red-500">{reward.description}</p>
                    )}
                    <div className="text-sm text-red-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expired on {reward.expiresAt && new Date(reward.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {rewards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No rewards yet
          </h3>
          <p className="text-gray-500">
            Start shopping and earning to unlock rewards!
          </p>
        </motion.div>
      )}
    </div>
  );
}
