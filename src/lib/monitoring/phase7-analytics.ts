import { prisma } from '@/lib/prisma';

export interface ARVRAnalytics {
  totalARSessions: number;
  totalVRSessions: number;
  averageARSessionDuration: number;
  averageVRSessionDuration: number;
  mostViewedARProducts: Array<{
    productId: string;
    productName: string;
    viewCount: number;
  }>;
  deviceBreakdown: {
    ios: number;
    android: number;
    desktop: number;
    vr: number;
  };
  sessionTypes: {
    PRODUCT_PREVIEW: number;
    TRY_ON: number;
    ROOM_PLACEMENT: number;
    QUICK_LOOK: number;
  };
}

export interface GamificationAnalytics {
  totalUsers: number;
  activeUsers: number;
  averageLevel: number;
  totalXP: number;
  totalRewards: number;
  redeemedRewards: number;
  topAchievements: Array<{
    achievementId: string;
    achievementName: string;
    unlockCount: number;
  }>;
  levelDistribution: Array<{
    level: number;
    userCount: number;
  }>;
  rewardTypes: {
    DISCOUNT_COUPON: number;
    FREE_SHIPPING: number;
    POINTS_BONUS: number;
    EXCLUSIVE_ACCESS: number;
    BADGE: number;
    ACHIEVEMENT: number;
  };
}

export interface SocialEngagementAnalytics {
  totalShares: number;
  totalClicks: number;
  platformBreakdown: Record<string, number>;
  topSharedProducts: Array<{
    productId: string;
    productName: string;
    shareCount: number;
  }>;
  liveEventStats: {
    totalEvents: number;
    activeEvents: number;
    totalParticipants: number;
    averageParticipants: number;
  };
  wishlistCompetitions: {
    totalCompetitions: number;
    activeCompetitions: number;
    totalParticipants: number;
  };
}

export interface Phase7KPIs {
  arVrEngagement: {
    dailyARSessions: number;
    dailyVRSessions: number;
    arConversionRate: number;
    vrConversionRate: number;
  };
  gamificationEngagement: {
    dailyActiveUsers: number;
    averageSessionTime: number;
    levelUpRate: number;
    rewardRedemptionRate: number;
  };
  socialEngagement: {
    dailyShares: number;
    socialConversionRate: number;
    liveEventAttendance: number;
  };
  overallEngagement: {
    totalEngagementScore: number;
    userRetentionRate: number;
    featureAdoptionRate: number;
  };
}

export class Phase7Analytics {
  // AR/VR Analytics
  async getARVRAnalytics(startDate?: Date, endDate?: Date): Promise<ARVRAnalytics> {
    const whereClause: any = {};
    if (startDate) whereClause.createdAt = { gte: startDate };
    if (endDate) whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };

    // Get AR sessions
    const arSessions = await prisma.aRSession.findMany({
      where: whereClause,
      include: { product: true },
    });

    // Get VR visits
    const vrVisits = await prisma.vRStoreVisit.findMany({
      where: whereClause,
    });

    // Calculate AR analytics
    const totalARSessions = arSessions.length;
    const averageARSessionDuration = arSessions.length > 0 
      ? arSessions.reduce((sum, session) => sum + session.duration, 0) / arSessions.length 
      : 0;

    // Calculate VR analytics
    const totalVRSessions = vrVisits.length;
    const averageVRSessionDuration = vrVisits.length > 0 
      ? vrVisits.reduce((sum, visit) => sum + visit.duration, 0) / vrVisits.length 
      : 0;

    // Most viewed AR products
    const productViews = arSessions.reduce((acc, session) => {
      if (session.productId) {
        acc[session.productId] = (acc[session.productId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostViewedARProducts = Object.entries(productViews)
      .map(([productId, viewCount]) => {
        const session = arSessions.find(s => s.productId === productId);
        return {
          productId,
          productName: session?.product?.name || 'Unknown Product',
          viewCount,
        };
      })
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // Device breakdown
    const deviceBreakdown = {
      ios: 0,
      android: 0,
      desktop: 0,
      vr: 0,
    };

    [...arSessions, ...vrVisits].forEach(session => {
      switch (session.deviceType) {
        case 'ios':
          deviceBreakdown.ios++;
          break;
        case 'android':
          deviceBreakdown.android++;
          break;
        case 'desktop':
        case 'windows':
        case 'mac':
        case 'linux':
          deviceBreakdown.desktop++;
          break;
        case 'vr':
          deviceBreakdown.vr++;
          break;
      }
    });

    // Session types
    const sessionTypes = {
      PRODUCT_PREVIEW: 0,
      TRY_ON: 0,
      ROOM_PLACEMENT: 0,
      QUICK_LOOK: 0,
    };

    arSessions.forEach(session => {
      sessionTypes[session.sessionType]++;
    });

    return {
      totalARSessions,
      totalVRSessions,
      averageARSessionDuration,
      averageVRSessionDuration,
      mostViewedARProducts,
      deviceBreakdown,
      sessionTypes,
    };
  }

  // Gamification Analytics
  async getGamificationAnalytics(startDate?: Date, endDate?: Date): Promise<GamificationAnalytics> {
    const whereClause: any = {};
    if (startDate) whereClause.createdAt = { gte: startDate };
    if (endDate) whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };

    // Get user profiles
    const userProfiles = await prisma.userProfile.findMany({
      where: whereClause,
    });

    // Get rewards
    const rewards = await prisma.reward.findMany({
      where: whereClause,
    });

    // Calculate basic stats
    const totalUsers = userProfiles.length;
    const activeUsers = userProfiles.filter(profile => 
      profile.lastLoginDate && 
      new Date(profile.lastLoginDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    const averageLevel = userProfiles.length > 0 
      ? userProfiles.reduce((sum, profile) => sum + profile.level, 0) / userProfiles.length 
      : 0;

    const totalXP = userProfiles.reduce((sum, profile) => sum + profile.experiencePoints, 0);
    const totalRewards = rewards.length;
    const redeemedRewards = rewards.filter(reward => reward.isRedeemed).length;

    // Top achievements
    const achievementCounts: Record<string, number> = {};
    userProfiles.forEach(profile => {
      profile.achievements.forEach(achievement => {
        achievementCounts[achievement] = (achievementCounts[achievement] || 0) + 1;
      });
    });

    const topAchievements = Object.entries(achievementCounts)
      .map(([achievementId, unlockCount]) => ({
        achievementId,
        achievementName: this.getAchievementName(achievementId),
        unlockCount,
      }))
      .sort((a, b) => b.unlockCount - a.unlockCount)
      .slice(0, 10);

    // Level distribution
    const levelDistribution: Record<number, number> = {};
    userProfiles.forEach(profile => {
      levelDistribution[profile.level] = (levelDistribution[profile.level] || 0) + 1;
    });

    const levelDistributionArray = Object.entries(levelDistribution)
      .map(([level, userCount]) => ({
        level: parseInt(level),
        userCount,
      }))
      .sort((a, b) => a.level - b.level);

    // Reward types
    const rewardTypes = {
      DISCOUNT_COUPON: 0,
      FREE_SHIPPING: 0,
      POINTS_BONUS: 0,
      EXCLUSIVE_ACCESS: 0,
      BADGE: 0,
      ACHIEVEMENT: 0,
    };

    rewards.forEach(reward => {
      rewardTypes[reward.type]++;
    });

    return {
      totalUsers,
      activeUsers,
      averageLevel,
      totalXP,
      totalRewards,
      redeemedRewards,
      topAchievements,
      levelDistribution: levelDistributionArray,
      rewardTypes,
    };
  }

  // Social Engagement Analytics
  async getSocialEngagementAnalytics(startDate?: Date, endDate?: Date): Promise<SocialEngagementAnalytics> {
    const whereClause: any = {};
    if (startDate) whereClause.createdAt = { gte: startDate };
    if (endDate) whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };

    // Get social shares
    const socialShares = await prisma.socialShare.findMany({
      where: whereClause,
      include: { product: true },
    });

    // Get live events
    const liveEvents = await prisma.liveEvent.findMany({
      where: whereClause,
    });

    // Get wishlist competitions
    const wishlistCompetitions = await prisma.wishlistCompetition.findMany({
      where: whereClause,
    });

    // Calculate share analytics
    const totalShares = socialShares.length;
    const totalClicks = socialShares.reduce((sum, share) => sum + share.clicks, 0);

    // Platform breakdown
    const platformBreakdown: Record<string, number> = {};
    socialShares.forEach(share => {
      platformBreakdown[share.platform] = (platformBreakdown[share.platform] || 0) + 1;
    });

    // Top shared products
    const productShares: Record<string, { count: number; name: string }> = {};
    socialShares.forEach(share => {
      if (share.productId) {
        if (!productShares[share.productId]) {
          productShares[share.productId] = {
            count: 0,
            name: share.product?.name || 'Unknown Product',
          };
        }
        productShares[share.productId].count++;
      }
    });

    const topSharedProducts = Object.entries(productShares)
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        shareCount: data.count,
      }))
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 10);

    // Live event stats
    const totalEvents = liveEvents.length;
    const activeEvents = liveEvents.filter(event => event.isActive).length;
    const totalParticipants = liveEvents.reduce((sum, event) => sum + event.currentParticipants, 0);
    const averageParticipants = totalEvents > 0 ? totalParticipants / totalEvents : 0;

    // Wishlist competition stats
    const totalCompetitions = wishlistCompetitions.length;
    const activeCompetitions = wishlistCompetitions.filter(comp => comp.isActive).length;
    const totalCompetitionParticipants = wishlistCompetitions.reduce(
      (sum, comp) => sum + comp.participants.length, 
      0
    );

    return {
      totalShares,
      totalClicks,
      platformBreakdown,
      topSharedProducts,
      liveEventStats: {
        totalEvents,
        activeEvents,
        totalParticipants,
        averageParticipants,
      },
      wishlistCompetitions: {
        totalCompetitions,
        activeCompetitions,
        totalParticipants: totalCompetitionParticipants,
      },
    };
  }

  // Get Phase 7 KPIs
  async getPhase7KPIs(startDate?: Date, endDate?: Date): Promise<Phase7KPIs> {
    const [arVrAnalytics, gamificationAnalytics, socialAnalytics] = await Promise.all([
      this.getARVRAnalytics(startDate, endDate),
      this.getGamificationAnalytics(startDate, endDate),
      this.getSocialEngagementAnalytics(startDate, endDate),
    ]);

    // Calculate daily metrics (simplified - in real implementation, you'd calculate based on actual daily data)
    const days = startDate && endDate 
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    const dailyARSessions = Math.round(arVrAnalytics.totalARSessions / days);
    const dailyVRSessions = Math.round(arVrAnalytics.totalVRSessions / days);
    const dailyShares = Math.round(socialAnalytics.totalShares / days);

    // Calculate conversion rates (simplified)
    const arConversionRate = arVrAnalytics.totalARSessions > 0 
      ? (arVrAnalytics.mostViewedARProducts.length / arVrAnalytics.totalARSessions) * 100 
      : 0;

    const vrConversionRate = arVrAnalytics.totalVRSessions > 0 
      ? (arVrAnalytics.totalVRSessions * 0.1) * 100 // Simplified calculation
      : 0;

    const socialConversionRate = socialAnalytics.totalShares > 0 
      ? (socialAnalytics.totalClicks / socialAnalytics.totalShares) * 100 
      : 0;

    const rewardRedemptionRate = gamificationAnalytics.totalRewards > 0 
      ? (gamificationAnalytics.redeemedRewards / gamificationAnalytics.totalRewards) * 100 
      : 0;

    const levelUpRate = gamificationAnalytics.totalUsers > 0 
      ? (gamificationAnalytics.averageLevel / gamificationAnalytics.totalUsers) * 100 
      : 0;

    // Calculate overall engagement score
    const totalEngagementScore = (
      (arVrAnalytics.totalARSessions + arVrAnalytics.totalVRSessions) * 0.3 +
      gamificationAnalytics.totalXP * 0.2 +
      socialAnalytics.totalShares * 0.2 +
      socialAnalytics.liveEventStats.totalParticipants * 0.3
    );

    return {
      arVrEngagement: {
        dailyARSessions,
        dailyVRSessions,
        arConversionRate,
        vrConversionRate,
      },
      gamificationEngagement: {
        dailyActiveUsers: Math.round(gamificationAnalytics.activeUsers / days),
        averageSessionTime: arVrAnalytics.averageARSessionDuration + arVrAnalytics.averageVRSessionDuration,
        levelUpRate,
        rewardRedemptionRate,
      },
      socialEngagement: {
        dailyShares,
        socialConversionRate,
        liveEventAttendance: socialAnalytics.liveEventStats.averageParticipants,
      },
      overallEngagement: {
        totalEngagementScore,
        userRetentionRate: gamificationAnalytics.activeUsers / gamificationAnalytics.totalUsers * 100,
        featureAdoptionRate: 75, // Simplified - would be calculated based on feature usage
      },
    };
  }

  // Helper method to get achievement name
  private getAchievementName(achievementId: string): string {
    const achievementNames: Record<string, string> = {
      'first_purchase': 'First Purchase',
      'big_spender': 'Big Spender',
      'loyal_customer': 'Loyal Customer',
      'daily_visitor': 'Daily Visitor',
      'ar_explorer': 'AR Explorer',
      'vr_adventurer': 'VR Adventurer',
      'social_butterfly': 'Social Butterfly',
    };
    return achievementNames[achievementId] || achievementId;
  }

  // Get real-time metrics
  async getRealTimeMetrics(): Promise<{
    activeARSessions: number;
    activeVRSessions: number;
    activeLiveEvents: number;
    onlineUsers: number;
  }> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [activeARSessions, activeVRSessions, activeLiveEvents] = await Promise.all([
      prisma.aRSession.count({
        where: {
          createdAt: { gte: oneHourAgo },
          endedAt: null,
        },
      }),
      prisma.vRStoreVisit.count({
        where: {
          createdAt: { gte: oneHourAgo },
          endedAt: null,
        },
      }),
      prisma.liveEvent.count({
        where: {
          isActive: true,
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),
    ]);

    // Estimate online users based on recent activity
    const recentUsers = await prisma.userProfile.count({
      where: {
        lastLoginDate: { gte: oneHourAgo },
      },
    });

    return {
      activeARSessions,
      activeVRSessions,
      activeLiveEvents,
      onlineUsers: recentUsers,
    };
  }
}

// Factory function
export function createPhase7Analytics(): Phase7Analytics {
  return new Phase7Analytics();
}
