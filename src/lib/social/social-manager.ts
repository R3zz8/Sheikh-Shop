import { prisma } from '@/lib/prisma';

export interface SocialShare {
  id: string;
  userId?: string | null;
  productId?: string | null;
  platform: string;
  shareUrl: string;
  clicks: number;
  createdAt: Date;
}

export interface WishlistCompetition {
  id: string;
  title: string;
  description?: string | null;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  rewardValue: number;
  participants: string[];
  winnerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'VR_TASTING' | 'AR_DEMO' | 'LIVE_STREAM' | 'Q_AND_A';
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  meetingUrl?: string | null;
  vrEnvironmentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class SocialManager {
  // Social Sharing
  async createSocialShare(
    userId: string | undefined,
    productId: string | undefined,
    platform: string,
    shareUrl: string
  ): Promise<SocialShare> {
    return await prisma.socialShare.create({
      data: {
        userId: userId || undefined,
        productId: productId || undefined,
        platform,
        shareUrl: shareUrl || null,
        clicks: 0,
      },
    });
  }

  async trackShareClick(shareId: string): Promise<void> {
    await prisma.socialShare.update({
      where: { id: shareId },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  async getProductShares(productId: string): Promise<SocialShare[]> {
    return await prisma.socialShare.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserShares(userId: string): Promise<SocialShare[]> {
    return await prisma.socialShare.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Wishlist Competitions
  async createWishlistCompetition(
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    rewardValue: number
  ): Promise<WishlistCompetition> {
    return await prisma.wishlistCompetition.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        rewardValue,
        participants: 0,
        isActive: true,
      },
    });
  }

  async joinWishlistCompetition(
    competitionId: string,
    userId: string
  ): Promise<boolean> {
    const competition = await prisma.wishlistCompetition.findUnique({
      where: { id: competitionId },
    });

    if (!competition || !competition.isActive) {
      return false;
    }

    if (competition.participants > 0) {
      return false; // Already has participants
    }

    await prisma.wishlistCompetition.update({
      where: { id: competitionId },
      data: {
        participants: {
          increment: 1,
        },
      },
    });

    return true;
  }

  async getActiveWishlistCompetitions(): Promise<WishlistCompetition[]> {
    return await prisma.wishlistCompetition.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserWishlistCompetitions(userId: string): Promise<WishlistCompetition[]> {
    return await prisma.wishlistCompetition.findMany({
      where: {
        participants: {
          gt: 0,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Live Events
  async createLiveEvent(
    title: string,
    description: string,
    eventType: LiveEvent['eventType'],
    startTime: Date,
    endTime: Date,
    maxParticipants: number,
    meetingUrl?: string,
    vrEnvironmentId?: string
  ): Promise<LiveEvent> {
    return await prisma.liveEvent.create({
      data: {
        title,
        description: description || null,
        eventType,
        startTime,
        endTime,
        maxParticipants,
        currentParticipants: 0,
        isActive: true,
        meetingUrl,
        vrEnvironmentId,
      },
    });
  }

  async joinLiveEvent(eventId: string, userId: string): Promise<boolean> {
    const event = await prisma.liveEvent.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.isActive) {
      return false;
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return false; // Event is full
    }

    if (event.startTime > new Date()) {
      return false; // Event hasn't started yet
    }

    if (event.endTime && event.endTime < new Date()) {
      return false; // Event has ended
    }

    await prisma.liveEvent.update({
      where: { id: eventId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    return true;
  }

  async getUpcomingLiveEvents(): Promise<LiveEvent[]> {
    return await prisma.liveEvent.findMany({
      where: {
        isActive: true,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getActiveLiveEvents(): Promise<LiveEvent[]> {
    const now = new Date();
    return await prisma.liveEvent.findMany({
      where: {
        isActive: true,
        startTime: { lte: now },
        endTime: { gte: now },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Generate share URLs
  generateShareUrl(productId: string, platform: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const productUrl = `${baseUrl}/products/${productId}`;
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=Check out this amazing product from Sheikh Shop!`;
      case 'instagram':
        return `https://www.instagram.com/`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(productUrl)}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(`Check out this product: ${productUrl}`)}`;
      case 'telegram':
        return `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=Check out this amazing product from Sheikh Shop!`;
      default:
        return productUrl;
    }
  }

  // Generate deep links for mobile apps
  generateDeepLink(productId: string, platform: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const productUrl = `${baseUrl}/products/${productId}`;
    
    switch (platform.toLowerCase()) {
      case 'facebook':
        return `fb://share?link=${encodeURIComponent(productUrl)}`;
      case 'twitter':
        return `twitter://post?message=${encodeURIComponent(`Check out this product: ${productUrl}`)}`;
      case 'instagram':
        return `instagram://camera`;
      case 'whatsapp':
        return `whatsapp://send?text=${encodeURIComponent(`Check out this product: ${productUrl}`)}`;
      default:
        return productUrl;
    }
  }

  // Get social sharing statistics
  async getSocialStats(productId?: string, userId?: string): Promise<{
    totalShares: number;
    totalClicks: number;
    platformBreakdown: Record<string, number>;
    topSharedProducts: Array<{ productId: string; shareCount: number }>;
  }> {
    const whereClause: any = {};
    if (productId) whereClause.productId = productId;
    if (userId) whereClause.userId = userId;

    const shares = await prisma.socialShare.findMany({
      where: whereClause,
    });

    const totalShares = shares.length;
    const totalClicks = shares.reduce((sum, share) => sum + share.clicks, 0);
    
    const platformBreakdown = shares.reduce((acc, share) => {
      acc[share.platform] = (acc[share.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top shared products
    const productShares = await prisma.socialShare.groupBy({
      by: ['productId'],
      _count: {
        productId: true,
      },
      where: productId ? { productId } : {},
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 10,
    });

    const topSharedProducts = productShares.map(item => ({
      productId: item.productId || 'unknown',
      shareCount: item._count.productId,
    }));

    return {
      totalShares,
      totalClicks,
      platformBreakdown,
      topSharedProducts,
    };
  }

  // Check if user is eligible for wishlist competition reward
  async checkWishlistCompetitionEligibility(
    userId: string,
    productId: string
  ): Promise<{ isEligible: boolean; competitionId?: string; rewardValue?: number }> {
    const activeCompetitions = await this.getActiveWishlistCompetitions();
    
    for (const competition of activeCompetitions) {
      if (competition.participants.includes(userId)) {
        // Check if the product is in user's wishlist and goes on discount
        // This would need to be implemented with actual wishlist and discount tracking
        return {
          isEligible: true,
          competitionId: competition.id,
          rewardValue: competition.rewardValue,
        };
      }
    }

    return { isEligible: false };
  }

  // Award wishlist competition reward
  async awardWishlistCompetitionReward(
    competitionId: string,
    userId: string,
    rewardValue: number
  ): Promise<void> {
    // This would integrate with the gamification system
    // For now, we'll just mark the competition as having a winner
    await prisma.wishlistCompetition.update({
      where: { id: competitionId },
      data: {
        winnerId: userId,
        isActive: false,
      },
    });
  }
}

// Factory function
export function createSocialManager(): SocialManager {
  return new SocialManager();
}
