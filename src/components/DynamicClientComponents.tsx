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
  loading: () => <div className="h-10 w-full bg-gray-800 rounded-md animate-pulse" />,
});

// Dynamically imported components for the Homepage
export const OptimizedPalmTree = dynamic(() => import('@/components/3d/OptimizedPalmTree'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-900 rounded-lg animate-pulse" />,
});

export const SheikhScene = dynamic(() => import('@/components/sheikhui/SheikhScene'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-900 animate-pulse" />,
});

export const AmazingDeals = dynamic(() => import('@/components/AmazingDeals'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-900 animate-pulse" />,
});

export const RoyalShowcase = dynamic(() => import('@/components/royal-showcase/RoyalShowcase'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-stone-900/60 rounded-[2.5rem] animate-pulse" />,
});

export const CarouselMobile = dynamic(() => import('@/components/CarouselMobile'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-900 animate-pulse md:hidden" />,
});

export const PremiumSpeakerShowcase = dynamic(() => import('@/components/home/PremiumSpeakerShowcase'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-900 animate-pulse" />,
});

export const BMWCarousel = dynamic(() => import('@/components/BMWCarousel'), {
  ssr: false,
  loading: () => <div className="hidden lg:flex min-h-[400px] bg-[#3E1F0F] rounded-2xl animate-pulse" />,
});
