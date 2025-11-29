'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import MobileCarouselTable from '../components/MobileCarouselTable';

export type CarouselSlide = {
  id: string;
  title: string;
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

export default function MobileCarouselDashboardView() {
  const { data: slides, isLoading, isError, error } = useQuery<CarouselSlide[]>({
    queryKey: ['carouselSlides'],
    queryFn: fetchCarouselSlides
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (isError) return <div className="p-6">Error: {error instanceof Error ? error.message : 'An unknown error occurred'}</div>;

  return (
    <div className="p-6">
      <MobileCarouselTable slides={slides || []} />
    </div>
  );
}
