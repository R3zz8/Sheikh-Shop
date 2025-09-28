'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Trophy, 
  Gift, 
  Target, 
  TrendingUp, 
  Award,
  Crown,
  Zap,
  Flame,
  Diamond
} from 'lucide-react';
import { createGamificationEngine, type UserProfile, type Achievement } from '@/lib/gamification/gamification-engine';

interface UserProfileProps {
  userId: string;
  className?: string;
}

export default function UserProfile({ userId, className = '' }: UserProfileProps) {
  const [gamificationEngine] = useState(() => createGamificationEngine());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId, gamificationEngine]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [userProfile, availableAchievements] = await Promise.all([
        gamificationEngine.getUserProfile(userId),
        Promise.resolve(gamificationEngine.getAvailableAchievements())
      ]);
      
      setProfile(userProfile);
      setAchievements(availableAchievements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (level >= 25) return <Diamond className="w-6 h-6 text-blue-500" />;
    if (level >= 10) return <Trophy className="w-6 h-6 text-amber-500" />;
    return <Star className="w-6 h-6 text-gray-500" />;
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Legend';
    if (level >= 25) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 5) return 'Advanced';
    return 'Beginner';
  };

  const getXPForNextLevel = (currentLevel: number) => {
    return gamificationEngine.calculateXPForNextLevel(currentLevel);
  };

  const getXPProgress = (currentXP: number, level: number) => {
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const progress = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const xpProgress = getXPProgress(profile.experiencePoints, profile.level);
  const xpForNextLevel = getXPForNextLevel(profile.level);

  return (
    <div className={`w-full ${className}`}>
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {getLevelIcon(profile.level)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {profile.level}</h2>
              <p className="text-amber-100">{getLevelTitle(profile.level)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{profile.experiencePoints.toLocaleString()}</div>
            <div className="text-amber-100">Experience Points</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to Level {profile.level + 1}</span>
            <span>{xpProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <motion.div
              className="bg-white rounded-full h-3"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-xs text-amber-100 mt-1">
            {xpForNextLevel - (profile.experiencePoints - Math.pow(profile.level - 1, 2) * 100)} XP to next level
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${profile.totalSpent.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {profile.totalOrders}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Login Streak</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {profile.loginStreak} days
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-4 shadow-sm border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Achievements</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {profile.achievements.length}
          </div>
        </motion.div>
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow-sm border"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Achievements
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => {
            const isUnlocked = profile.achievements.includes(achievement.id);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isUnlocked
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-amber-600 font-medium">
                        +{achievement.xpReward} XP
                      </span>
                    </div>
                  </div>
                  {isUnlocked && (
                    <div className="text-amber-500">
                      <Target className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
