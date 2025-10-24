'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

type ArticleAction =
  | 'article_created'
  | 'article_saved_draft'
  | 'article_published'
  | 'article_edited'
  | 'article_published_update'
  | 'article_updated_draft'
  | 'article_update_failed'
  | 'article_creation_failed'
  | 'ai_generation_requested'
  | 'ai_generation_completed';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return `server-${  Math.random().toString(36).slice(2)}`;
  const key = 'article_session_id';
  let existing = sessionStorage.getItem(key);
  if (!existing) {
    existing = crypto.randomUUID();
    sessionStorage.setItem(key, existing);
  }
  return existing;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number) {
  let timeout: any;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delayMs);
  };
  return debounced as T;
}

export function useArticleAnalytics(articleId?: string) {
  const sessionIdRef = useRef<string>('');
  if (!sessionIdRef.current) {
    sessionIdRef.current = getOrCreateSessionId();
  }

  const send = useCallback(async (payload: Record<string, any>) => {
    try {
      await fetch('/api/articles/track-engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // swallow errors; analytics should not break UX
    }
  }, []);

  const sendDebounced = useMemo(() => debounce(send, 800), [send]);

  const trackAction = useCallback(
    (action: ArticleAction, overrides?: { articleId?: string }) => {
      const id = overrides?.articleId ?? articleId;
      if (!id) return; // require article id for action events per API contract
      send({ action, articleId: id, sessionId: sessionIdRef.current, userAgent: navigator.userAgent, referrer: document.referrer });
    },
    [articleId, send]
  );

  const trackEngagementMetrics = useCallback(
    (metrics: { timeOnPage: number; scrollDepth: number; bounceRate?: boolean; readingSpeed?: number }, overrides?: { articleId?: string }) => {
      const id = overrides?.articleId ?? articleId;
      if (!id) return;
      sendDebounced({ ...metrics, articleId: id, sessionId: sessionIdRef.current, userAgent: navigator.userAgent, referrer: document.referrer });
    },
    [articleId, sendDebounced]
  );

  // example helper for scroll depth tracking (optional to call from component)
  const setupScrollTracking = useCallback(
    (opts?: { articleId?: string }) => {
      const id = opts?.articleId ?? articleId;
      if (!id || typeof window === 'undefined') return () => {};
      let maxScroll = 0;
      const onScroll = () => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        const depth = Math.min(100, Math.round((scrolled / total) * 100));
        if (depth > maxScroll) {
          maxScroll = depth;
          trackEngagementMetrics({ timeOnPage: Math.round(performance.now() / 1000), scrollDepth: maxScroll });
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    },
    [articleId, trackEngagementMetrics]
  );

  useEffect(() => {
    // ensure session id is initialized on mount
    sessionIdRef.current = getOrCreateSessionId();
  }, []);

  return { trackAction, trackEngagementMetrics, setupScrollTracking, sessionId: sessionIdRef.current };
}


