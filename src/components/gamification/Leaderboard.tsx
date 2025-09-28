'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Award, 
  TrendingUp,
  Users,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { createGamificationEngine, type LeaderboardEntry } from '@/lib/gamification/gamification-engine';

interface LeaderboardProps {
  className?: string;
}

type LeaderboardCategory = 'TOTAL_SPENT' | 'ORDERS_COUNT' | 'REVIEWS_COUNT' | 'LOGIN_STREAK' | 'AR_SESSIONS' | 'VR_VISITS' | 'SOCIAL_SHARES';
type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

export default function Leaderboard({ className = '' }: LeaderboardProps) {
  const [gamificationEngine] = useState(() => createGamificationEngine());
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('TOTAL_SPENT');
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('ALL_TIME');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'TOTAL_SPENT', label: 'Total Spent', icon: '💰' },
    { value: 'ORDERS_COUNT', label: 'Orders', icon: '🛒' },
    { value: 'REVIEWS_COUNT', label: 'Reviews', icon: '⭐' },
    { value: 'LOGIN_STREAK', label: 'Login Streak', icon: '🔥' },
    { value: 'AR_SESSIONS', label: 'AR Sessions', icon: '📱' },
    { value: 'VR_VISITS', label: 'VR Visits', icon: '🥽' },
    { value: 'SOCIAL_SHARES', label: 'Social Shares', icon: '📢' },
  ];

  const periods = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
    { value: 'ALL_TIME', label: 'All Time' },
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [selectedCategory, selectedPeriod, gamificationEngine]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const leaderboardEntries = await gamificationEngine.getLeaderboard(
        selectedCategory,
        selectedPeriod,
        10
      );
      setEntries(leaderboardEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const formatScore = (score: number, category: LeaderboardCategory) => {
    switch (category) {
      case 'TOTAL_SPENT':
        return `$${score.toLocaleString()}`;
      case 'LOGIN_STREAK':
        return `${score} days`;
      default:
        return score.toLocaleString();
    }
  };

  const getUserDisplayName = (entry: LeaderboardEntry) => {
    const user = entry.user;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Anonymous User';
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
          <p className="text-red-600">Failed to load leaderboard</p>
          <button
            onClick={loadLeaderboard}
            className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Leaderboard
        </h2>
        <button
          onClick={loadLeaderboard}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as LeaderboardCategory)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as LeaderboardPeriod)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        <AnimatePresence>
          {entries.map((entry, index) => (
            <motion.div
              key={`${entry.userId}-${entry.category}-${entry.period}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                entry.rank && entry.rank <= 3
                  ? getRankColor(entry.rank)
                  : 'bg-white border-gray-200 hover:border-amber-300'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center gap-2">
                {getRankIcon(entry.rank || index + 1)}
                <span className="text-lg font-bold">
                  #{entry.rank || index + 1}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {getUserDisplayName(entry)}
                    </h3>
                    <p className="text-sm opacity-75">
                      Level 1
                    </p>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-xl font-bold">
                  {formatScore(entry.score, entry.category as any)}
                </div>
                <div className="text-sm opacity-75">
                  {entry.period.toLowerCase()}
                </div>
              </div>

              {/* Trend Indicator */}
              {entry.rank && entry.rank <= 3 && (
                <div className="text-2xl">
                  {entry.rank === 1 && '🥇'}
                  {entry.rank === 2 && '🥈'}
                  {entry.rank === 3 && '🥉'}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No entries yet
            </h3>
            <p className="text-gray-500">
              Be the first to appear on the leaderboard!
            </p>
          </motion.div>
        )}
      </div>

      {/* Stats Summary */}
      {entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {selectedPeriod.toLowerCase()} leaderboard
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>
                {entries.length} participants
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
