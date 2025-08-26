'use client';

import { useCallback } from 'react';

interface AnalyticsEvent {
    event: string;
    properties?: Record<string, any>;
    timestamp?: number;
}

interface PerformanceMetric {
    name: string;
    value: number;
    unit?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private isEnabled = process.env.NODE_ENV === 'production';

  trackEvent(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);

    if (this.isEnabled) {
      // Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
      // console.log('Analytics Event:', analyticsEvent);

      // Example: Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, properties);
      }
    }
  }

  trackPageView(page: string, properties?: Record<string, any>) {
    this.trackEvent('page_view', { page, ...properties });
  }

  trackUserAction(action: string, element: string, properties?: Record<string, any>) {
    this.trackEvent('user_action', { action, element, ...properties });
  }

  trackPerformance(metric: PerformanceMetric) {
    this.trackEvent('performance', { metric });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  trackConversion(conversionType: string, value?: number, properties?: Record<string, any>) {
    this.trackEvent('conversion', {
      type: conversionType,
      value,
      ...properties,
    });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

// Global analytics instance
const analytics = new Analytics();

export function useAnalytics() {
  const trackEvent = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.trackEvent(event, properties);
  }, []);

  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    analytics.trackPageView(page, properties);
  }, []);

  const trackUserAction = useCallback((action: string, element: string, properties?: Record<string, any>) => {
    analytics.trackUserAction(action, element, properties);
  }, []);

  const trackPerformance = useCallback((metric: PerformanceMetric) => {
    analytics.trackPerformance(metric);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, []);

  const trackConversion = useCallback((conversionType: string, value?: number, properties?: Record<string, any>) => {
    analytics.trackConversion(conversionType, value, properties);
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance,
    trackError,
    trackConversion,
  };
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;

    analytics.trackPerformance({
      name,
      value: duration,
      unit: 'ms',
    });

    return duration;
  }, []);

  const measureAsyncPerformance = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;

    analytics.trackPerformance({
      name,
      value: duration,
      unit: 'ms',
    });

    return { result, duration };
  }, []);

  return {
    measurePerformance,
    measureAsyncPerformance,
  };
}
