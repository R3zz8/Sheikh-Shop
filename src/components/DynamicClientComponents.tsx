'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically imported components for the Root Layout
export const ShoppingChatbot = dynamic(() => import('@/components/ai/ShoppingChatbot'), {
  ssr: false,
  loading: () => null,
});

export const EnhancedAISearch = dynamic(() => import('@/components/ai/EnhancedAISearch'), {
  ssr: false,
  loading: () => <div className="h-[98px] w-full bg-stone-900/60 rounded-xl animate-pulse border border-amber-500/10" />,
});

// Dynamically imported components for the Homepage
export const SheikhScene = dynamic(() => import('@/components/sheikhui/SheikhScene'), {
  ssr: false,
  loading: () => <div className="w-full h-[336px] md:h-[520px] bg-stone-900/60 rounded-3xl animate-pulse" />,
});

export const AmazingDeals = dynamic(() => import('@/components/AmazingDeals'), {
  ssr: false,
  loading: () => <div className="w-full h-[450px] bg-stone-900/60 rounded-3xl animate-pulse" />,
});

export const RoyalShowcase = dynamic(() => import('@/components/royal-showcase/RoyalShowcase'), {
  ssr: false,
  loading: () => <div className="w-full h-[360px] md:h-[560px] bg-stone-900/60 rounded-[2.5rem] animate-pulse" />,
});

export const CarouselMobile = dynamic(() => import('@/components/CarouselMobile'), {
  ssr: false,
  loading: () => <div className="w-full h-[220px] sm:h-[280px] bg-stone-900/60 rounded-2xl animate-pulse md:hidden" />,
});

export const PremiumSpeakerShowcase = dynamic(() => import('@/components/home/PremiumSpeakerShowcase'), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] md:h-[500px] bg-stone-900/60 rounded-[2.5rem] animate-pulse" />,
});

export const BMWCarousel = dynamic(() => import('@/components/BMWCarousel'), {
  ssr: false,
  loading: () => <div className="hidden lg:flex min-h-[400px] bg-[#3E1F0F] rounded-2xl animate-pulse" />,
});
