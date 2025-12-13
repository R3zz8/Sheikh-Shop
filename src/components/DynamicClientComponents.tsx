'use client';

import dynamic from 'next/dynamic';

// Dynamically imported components for the Root Layout
export const ShoppingChatbot = dynamic(() => import('@/components/ai/ShoppingChatbot'), {
  ssr: false,
  preload: false,
} as any);

export const EnhancedAISearch = dynamic(() => import('@/components/ai/EnhancedAISearch'), {
  ssr: false,
  preload: false,
  loading: () => <div className="h-10 w-full bg-gray-800 rounded-md animate-pulse" />,
} as any);

// Dynamically imported components for the Homepage
export const OptimizedPalmTree = dynamic(() => import('@/components/3d/OptimizedPalmTree'), {
    ssr: false,
    preload: false,
    loading: () => <div className="w-full h-full bg-gray-900 rounded-lg animate-pulse" />,
} as any);

export const SheikhScene = dynamic(() => import('@/components/sheikhui/SheikhScene'), {
    ssr: false,
    preload: false,
    loading: () => <div className="w-full h-64 bg-gray-900 animate-pulse" />,
} as any);

export const AmazingDeals = dynamic(() => import('@/components/AmazingDeals'), {
    ssr: false,
    preload: false,
    loading: () => <div className="w-full h-96 bg-gray-900 animate-pulse" />,
} as any);

export const CarouselMobile = dynamic(() => import('@/components/CarouselMobile'), {
    ssr: false,
    loading: () => <div className="w-full h-64 bg-gray-900 animate-pulse md:hidden" />,
});
