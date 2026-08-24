'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import BmwCarouselTable from '../components/BmwCarouselTable';

export type BmwCarouselSlide = {
  id: string;
  title?: string | null;
  imageUrl: string;
  imagePublicId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const fetchBmwCarouselSlides = async (): Promise<BmwCarouselSlide[]> => {
  const res = await fetch('/api/admin/bmw-carousel');
  if (!res.ok) {
    throw new Error('Failed to fetch 3D carousel items');
  }
  return res.json();
};

function BmwCarouselContent() {
  const { data: slides, isLoading, isError, error } = useQuery<BmwCarouselSlide[]>({
    queryKey: ['bmwCarouselSlides'],
    queryFn: fetchBmwCarouselSlides,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-amber-200/80 font-vazirmatn text-center">
        در حال بارگذاری اطلاعات کروسل ۳بعدی...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-rose-400 font-vazirmatn text-center">
        خطا در دریافت اطلاعات کروسل ۳بعدی: {error instanceof Error ? error.message : 'خطای نا مشخص'}
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <BmwCarouselTable slides={slides || []} />
    </div>
  );
}

export default function BmwCarouselDashboardView() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <BmwCarouselContent />
    </QueryClientProvider>
  );
}
