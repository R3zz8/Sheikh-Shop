import { prisma } from '@/lib/prisma';

export interface UserProfile {
  id: string;
  userId: string;
  level: number;
  experiencePoints: number;
  totalSpent: number;
  totalOrders: number;
  loginStreak: number;
  lastLoginDate?: Date | null;
  achievements: string[];
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reward {
  id: string;
  userId: string;
  type: 'DISCOUNT_COUPON' | 'FREE_SHIPPING' | 'POINTS_BONUS' | 'EXCLUSIVE_ACCESS' | 'BADGE' | 'ACHIEVEMENT';
  title: string;
  description?: string | null;
  value?: number | null;
  code?: string | null;
  isRedeemed: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  category: string;
  score: number;
  rank?: number;
  period: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    firstName: string | null;
    lastName: string | null;
    username: string | null;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  requirements: {
    type: 'spend' | 'orders' | 'login_streak' | 'ar_sessions' | 'vr_visits' | 'social_shares';
    value: number;
  };
  isUnlocked: boolean;
}

export class GamificationEngine {
  private achievements: Achievement[] = [];

  constructor() {
    this.initializeAchievements();
  }

  // Initialize available achievements
  private initializeAchievements(): void {
    this.achievements = [
      {
        id: 'first_purchase',
        name: 'First Purchase',
        description: 'Make your first purchase',
        icon: '🛒',
        xpReward: 100,
        requirements: { type: 'orders', value: 1 },
        isUnlocked: false,
      },
      {
        id: 'big_spender',
        name: 'Big Spender',
        description: 'Spend $500 or more',
        icon: '💰',
        xpReward: 500,
        requirements: { type: 'spend', value: 500 },
        isUnlocked: false,
      },
      {
        id: 'loyal_customer',
        name: 'Loyal Customer',
        description: 'Make 10 or more orders',
        icon: '⭐',
        xpReward: 300,
        requirements: { type: 'orders', value: 10 },
        isUnlocked: false,
      },
      {
        id: 'daily_visitor',
        name: 'Daily Visitor',
        description: 'Login for 7 consecutive days',
        icon: '📅',
        xpReward: 200,
        requirements: { type: 'login_streak', value: 7 },
        isUnlocked: false,
      },
      {
        id: 'ar_explorer',
        name: 'AR Explorer',
        description: 'Use AR features 5 times',
        icon: '📱',
        xpReward: 150,
        requirements: { type: 'ar_sessions', value: 5 },
        isUnlocked: false,
      },
      {
        id: 'vr_adventurer',
        name: 'VR Adventurer',
        description: 'Visit VR store 3 times',
        icon: '🥽',
        xpReward: 200,
        requirements: { type: 'vr_visits', value: 3 },
        isUnlocked: false,
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Share products 10 times',
        icon: '📢',
        xpReward: 100,
        requirements: { type: 'social_shares', value: 10 },
        isUnlocked: false,
      },
    ];
  }

  // Get or create user profile
  async getUserProfile(userId: string): Promise<UserProfile> {
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          userId,
          level: 1,
          experiencePoints: 0,
          totalSpent: 0,
          totalOrders: 0,
          loginStreak: 0,
          achievements: [],
          badges: [],
        },
      });
    }

    return profile;
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return await prisma.userProfile.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        level: 1,
        experiencePoints: 0,
        totalSpent: 0,
        totalOrders: 0,
        loginStreak: 0,
        achievements: [],
        badges: [],
        ...updates,
      },
    });
  }

  // Award experience points
  async awardXP(userId: string, xp: number, reason: string): Promise<{ newLevel: number; leveledUp: boolean }> {
    const profile = await this.getUserProfile(userId);
    const newXP = profile.experiencePoints + xp;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > profile.level;

    await this.updateUserProfile(userId, {
      experiencePoints: newXP,
      level: newLevel,
    });

    // Check for achievements
    await this.checkAchievements(userId);

    return { newLevel, leveledUp };
  }

  // Calculate level from XP
  private calculateLevel(xp: number): number {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  // Calculate XP required for next level
  calculateXPForNextLevel(currentLevel: number): number {
    const nextLevelXP = Math.pow(currentLevel, 2) * 100;
    const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
    return nextLevelXP - currentLevelXP;
  }

  // Track purchase
  async trackPurchase(userId: string, amount: number): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const newTotalSpent = profile.totalSpent + amount;
    const newTotalOrders = profile.totalOrders + 1;

    // Award XP for purchase
    const xpReward = Math.floor(amount / 10); // 1 XP per $10 spent
    await this.awardXP(userId, xpReward, 'Purchase made');

    // Update profile
    await this.updateUserProfile(userId, {
      totalSpent: newTotalSpent,
      totalOrders: newTotalOrders,
    });

    // Check for purchase-based achievements
    await this.checkAchievements(userId);
  }

  // Track login
  async trackLogin(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const today = new Date();
    const lastLogin = profile.lastLoginDate;

    let newStreak = profile.loginStreak;
    if (lastLogin) {
      const daysSinceLastLogin = Math.floor(
        (today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastLogin === 1) {
        newStreak += 1;
      } else if (daysSinceLastLogin > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Award XP for login streak
    const xpReward = Math.min(newStreak * 10, 100); // Max 100 XP per day
    await this.awardXP(userId, xpReward, 'Daily login');

    // Update profile
    await this.updateUserProfile(userId, {
      loginStreak: newStreak,
      lastLoginDate: today,
    });

    // Check for login-based achievements
    await this.checkAchievements(userId);
  }

  // Track AR session
  async trackARSession(userId: string): Promise<void> {
    // Award XP for AR usage
    await this.awardXP(userId, 25, 'AR session completed');
    
    // Check for AR-based achievements
    await this.checkAchievements(userId);
  }

  // Track VR visit
  async trackVRVisit(userId: string): Promise<void> {
    // Award XP for VR usage
    await this.awardXP(userId, 50, 'VR store visit');
    
    // Check for VR-based achievements
    await this.checkAchievements(userId);
  }

  // Track social share
  async trackSocialShare(userId: string): Promise<void> {
    // Award XP for social sharing
    await this.awardXP(userId, 10, 'Product shared');
    
    // Check for social-based achievements
    await this.checkAchievements(userId);
  }

  // Check and unlock achievements
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const profile = await this.getUserProfile(userId);
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (profile.achievements.includes(achievement.id)) continue;

      let isUnlocked = false;
      switch (achievement.requirements.type) {
        case 'spend':
          isUnlocked = profile.totalSpent >= achievement.requirements.value;
          break;
        case 'orders':
          isUnlocked = profile.totalOrders >= achievement.requirements.value;
          break;
        case 'login_streak':
          isUnlocked = profile.loginStreak >= achievement.requirements.value;
          break;
        case 'ar_sessions':
          // This would need to be tracked separately
          break;
        case 'vr_visits':
          // This would need to be tracked separately
          break;
        case 'social_shares':
          // This would need to be tracked separately
          break;
      }

      if (isUnlocked) {
        unlockedAchievements.push(achievement);
        
        // Award XP for achievement
        await this.awardXP(userId, achievement.xpReward, `Achievement: ${achievement.name}`);
        
        // Add to user's achievements
        await this.updateUserProfile(userId, {
          achievements: [...profile.achievements, achievement.id],
        });
      }
    }

    return unlockedAchievements;
  }

  // Create reward
  async createReward(
    userId: string,
    type: Reward['type'],
    title: string,
    description?: string,
    value?: number,
    expiresAt?: Date
  ): Promise<Reward> {
    const code = type === 'DISCOUNT_COUPON' ? this.generateCouponCode() : undefined;
    
    return await prisma.reward.create({
      data: {
        userId,
        type,
        title,
        description,
        value: value || 0,
        code,
        expiresAt,
      },
    });
  }

  // Generate coupon code
  private generateCouponCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Redeem reward
  async redeemReward(rewardId: string): Promise<boolean> {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || reward.isRedeemed) {
      return false;
    }

    if (reward.expiresAt && reward.expiresAt < new Date()) {
      return false;
    }

    await prisma.reward.update({
      where: { id: rewardId },
      data: { isRedeemed: true },
    });

    return true;
  }

  // Get user rewards
  async getUserRewards(userId: string): Promise<Reward[]> {
    return await prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Update leaderboard
  async updateLeaderboard(
    userId: string,
    category: LeaderboardEntry['category'],
    score: number,
    period: LeaderboardEntry['period'] = 'ALL_TIME'
  ): Promise<void> {
    await prisma.leaderboardEntry.upsert({
      where: {
        userId_category_period: {
          userId,
          category,
          period,
        },
      },
      update: { score },
      create: {
        userId,
        category,
        score,
        period,
      },
    });
  }

  // Get leaderboard
  async getLeaderboard(
    category: LeaderboardEntry['category'],
    period: LeaderboardEntry['period'] = 'ALL_TIME',
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    const entries = await prisma.leaderboardEntry.findMany({
      where: { category, period },
      orderBy: { score: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    // Update ranks
    const rankedEntries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return rankedEntries;
  }

  // Get available achievements
  getAvailableAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get user's progress for an achievement
  async getAchievementProgress(userId: string, achievementId: string): Promise<{
    current: number;
    required: number;
    progress: number;
  }> {
    const profile = await this.getUserProfile(userId);
    const achievement = this.achievements.find(a => a.id === achievementId);
    
    if (!achievement) {
      return { current: 0, required: 0, progress: 0 };
    }

    let current = 0;
    switch (achievement.requirements.type) {
      case 'spend':
        current = profile.totalSpent;
        break;
      case 'orders':
        current = profile.totalOrders;
        break;
      case 'login_streak':
        current = profile.loginStreak;
        break;
      // Other types would need separate tracking
    }

    const progress = Math.min((current / achievement.requirements.value) * 100, 100);
    
    return {
      current,
      required: achievement.requirements.value,
      progress,
    };
  }
}

// Factory function
export function createGamificationEngine(): GamificationEngine {
  return new GamificationEngine();
}
