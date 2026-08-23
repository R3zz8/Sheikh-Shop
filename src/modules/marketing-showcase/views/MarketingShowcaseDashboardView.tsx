'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import MarketingShowcaseTable from '../components/MarketingShowcaseTable';

export type MarketingShowcaseSlide = {
  id: string;
  title: string;
  imageUrl: string;
  imagePublicId?: string | null;
  productId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  product?: {
    id: string;
    name: string;
    slug: string | null;
    status: string;
  };
};

const fetchShowcaseSlides = async (): Promise<MarketingShowcaseSlide[]> => {
  const res = await fetch('/api/admin/marketing-showcase');
  if (!res.ok) {
    throw new Error('Failed to fetch marketing showcase slides');
  }
  return res.json();
};

function MarketingShowcaseContent() {
  const { data: slides, isLoading, isError, error } = useQuery<MarketingShowcaseSlide[]>({
    queryKey: ['marketingShowcaseSlides'],
    queryFn: fetchShowcaseSlides,
  });

  if (isLoading) {
    return (
      <div className="p-6 text-amber-200/80 font-vazirmatn text-center">
        در حال بارگذاری اطلاعات ویترین تبلیغاتی...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-rose-400 font-vazirmatn text-center">
        خطا در دریافت اطلاعات ویترین: {error instanceof Error ? error.message : 'خطای نا مشخص'}
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <MarketingShowcaseTable slides={slides || []} />
    </div>
  );
}

export default function MarketingShowcaseDashboardView() {
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
      <MarketingShowcaseContent />
    </QueryClientProvider>
  );
}
