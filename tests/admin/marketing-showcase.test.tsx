import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LuxuryProductArchCarouselClient from '@/components/home/LuxuryProductArchCarouselClient';
import type { MarketingShowcaseSlideData } from '@/lib/services/getMarketingShowcase';

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Autoplay: jest.fn(),
  Keyboard: jest.fn(),
}));

jest.mock('swiper/css', () => ({}));

const mockSlides: MarketingShowcaseSlideData[] = [
  {
    id: 'mss_1',
    title: 'اسپیکر ایستاده لوکس شیخ شاپ',
    imageUrl: '/sheikhdigital.webp',
    imagePublicId: 'pub_1',
    productId: 'pd_speaker_1',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: {
      id: 'pd_speaker_1',
      name: 'اسپیکر ایستاده شیخ',
      slug: 'luxury-x9-speaker',
      status: 'ACTIVE',
    },
  },
  {
    id: 'mss_2',
    title: 'ساعت هوشمند سلطنتی شیخ',
    imageUrl: '/sheikhgajet.webp',
    imagePublicId: 'pub_2',
    productId: 'pd_smartwatch',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: {
      id: 'pd_smartwatch',
      name: 'ساعت هوشمند شیخ',
      slug: 'royal-watch-v2',
      status: 'ACTIVE',
    },
  },
];

describe('Marketing Showcase Visual Component (LuxuryProductArchCarouselClient)', () => {
  it('returns null when slides array is empty (0 slides)', () => {
    const { container } = render(<LuxuryProductArchCarouselClient slides={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single slide properly (1 slide)', () => {
    render(<LuxuryProductArchCarouselClient slides={[mockSlides[0]!]} />);
    expect(screen.getAllByText('اسپیکر ایستاده لوکس شیخ شاپ')[0]).toBeInTheDocument();

    const link = screen.getAllByRole('link')[0];
    expect(link).toHaveAttribute('href', '/products/luxury-x9-speaker');
  });

  it('renders multiple slides properly (2+ slides)', () => {
    render(<LuxuryProductArchCarouselClient slides={mockSlides} />);
    expect(screen.getAllByText('اسپیکر ایستاده لوکس شیخ شاپ')[0]).toBeInTheDocument();
    expect(screen.getAllByText('ساعت هوشمند سلطنتی شیخ')[0]).toBeInTheDocument();
  });
});
