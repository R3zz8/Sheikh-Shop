'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserBehaviorEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'view' | 'click' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search';
  productId?: string;
  categoryId?: string;
  unitId?: string;
  quantity?: number;
  price?: number;
  searchQuery?: string;
  pageUrl: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  preferredCategories: string[];
  priceRange: { min: number; max: number };
  preferredUnits: string[];
  browsingHistory: string[];
  cartHistory: string[];
  purchaseHistory: string[];
}

export interface RecommendationContext {
  currentProductId?: string;
  currentCategoryId?: string;
  userPreferences: UserPreferences;
  recentActivity: UserBehaviorEvent[];
}

class UserBehaviorTracker {
  private events: UserBehaviorEvent[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  track(event: Omit<UserBehaviorEvent, 'id' | 'sessionId' | 'userId' | 'timestamp'>) {
    const behaviorEvent: UserBehaviorEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date(),
    };

    this.events.push(behaviorEvent);
    
    // Send to analytics service
    this.sendToAnalytics(behaviorEvent);
    
    // Store in localStorage for offline persistence
    this.persistEvent(behaviorEvent);
  }

  private async sendToAnalytics(event: UserBehaviorEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  private persistEvent(event: UserBehaviorEvent) {
    try {
      const stored = localStorage.getItem('user_behavior_events');
      const events = stored ? JSON.parse(stored) : [];
      events.push(event);
      
      // Keep only last 100 events to prevent storage bloat
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem('user_behavior_events', JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to persist event:', error);
    }
  }

  getEvents(): UserBehaviorEvent[] {
    return [...this.events];
  }

  getUserPreferences(): UserPreferences {
    const events = this.getEvents();
    const categories = new Set<string>();
    const units = new Set<string>();
    const prices: number[] = [];
    const browsingHistory: string[] = [];
    const cartHistory: string[] = [];
    const purchaseHistory: string[] = [];

    events.forEach(event => {
      if (event.categoryId) categories.add(event.categoryId);
      if (event.unitId) units.add(event.unitId);
      if (event.price) prices.push(event.price);
      
      if (event.productId) {
        switch (event.eventType) {
          case 'view':
            browsingHistory.push(event.productId);
            break;
          case 'add_to_cart':
            cartHistory.push(event.productId);
            break;
          case 'purchase':
            purchaseHistory.push(event.productId);
            break;
        }
      }
    });

    return {
      preferredCategories: Array.from(categories),
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 1000,
      },
      preferredUnits: Array.from(units),
      browsingHistory: [...new Set(browsingHistory)],
      cartHistory: [...new Set(cartHistory)],
      purchaseHistory: [...new Set(purchaseHistory)],
    };
  }

  getRecommendationContext(currentProductId?: string, currentCategoryId?: string): RecommendationContext {
    return {
      currentProductId,
      currentCategoryId,
      userPreferences: this.getUserPreferences(),
      recentActivity: this.events.slice(-20), // Last 20 events
    };
  }
}

// Global tracker instance
const behaviorTracker = new UserBehaviorTracker();

export function useUserBehavior() {
  const { data: session } = useSession();
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      behaviorTracker.setUserId(session.user.id);
    }
  }, [session]);

  const trackEvent = useCallback((event: Omit<UserBehaviorEvent, 'id' | 'sessionId' | 'userId' | 'timestamp'>) => {
    behaviorTracker.track({
      ...event,
      pageUrl: window.location.href,
    });
  }, []);

  const trackProductView = useCallback((productId: string, categoryId?: string, unitId?: string) => {
    trackEvent({
      eventType: 'view',
      productId,
      categoryId,
      unitId,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const trackProductClick = useCallback((productId: string, categoryId?: string, unitId?: string) => {
    trackEvent({
      eventType: 'click',
      productId,
      categoryId,
      unitId,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((productId: string, unitId?: string, quantity?: number, price?: number) => {
    trackEvent({
      eventType: 'add_to_cart',
      productId,
      unitId,
      quantity,
      price,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const trackRemoveFromCart = useCallback((productId: string, unitId?: string, quantity?: number) => {
    trackEvent({
      eventType: 'remove_from_cart',
      productId,
      unitId,
      quantity,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const trackPurchase = useCallback((productId: string, unitId?: string, quantity?: number, price?: number) => {
    trackEvent({
      eventType: 'purchase',
      productId,
      unitId,
      quantity,
      price,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string) => {
    trackEvent({
      eventType: 'search',
      searchQuery: query,
      pageUrl: window.location.href,
    });
  }, [trackEvent]);

  const getUserPreferences = useCallback(() => {
    return behaviorTracker.getUserPreferences();
  }, []);

  const getRecommendationContext = useCallback((currentProductId?: string, currentCategoryId?: string) => {
    return behaviorTracker.getRecommendationContext(currentProductId, currentCategoryId);
  }, []);

  return {
    trackEvent,
    trackProductView,
    trackProductClick,
    trackAddToCart,
    trackRemoveFromCart,
    trackPurchase,
    trackSearch,
    getUserPreferences,
    getRecommendationContext,
    isTracking,
    setIsTracking,
  };
}

