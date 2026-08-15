'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import MobileCarouselTable from '../components/MobileCarouselTable';

export type CarouselSlide = {
  id: string;
  topTitle?: string;
  subtitle?: string;
  title: string;
  ctaText?: string;
  image: string;
  link: string;
  order: number;
};

const fetchCarouselSlides = async (): Promise<CarouselSlide[]> => {
  const res = await fetch('/api/admin/mobile-carousel');
  if (!res.ok) {
    throw new Error('Failed to fetch carousel slides');
  }
  return res.json();
};

function MobileCarouselContent() {
  const { data: slides, isLoading, isError, error } = useQuery<CarouselSlide[]>({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides
  });

  if (isLoading) {
    return (
      <div className="p-6 text-amber-200/80 font-vazirmatn text-center">
        در حال بارگذاری اطلاعات اسلایدر...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-rose-400 font-vazirmatn text-center">
        خطا در دریافت اسلایدر: {error instanceof Error ? error.message : 'خطای نا مشخص'}
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <MobileCarouselTable slides={slides || []} />
    </div>
  );
}

export default function MobileCarouselDashboardView() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MobileCarouselContent />
    </QueryClientProvider>
  );
}
