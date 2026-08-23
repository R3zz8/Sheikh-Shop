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
  {
    id: 'mss_3',
    title: 'هدفون گیمینگ شیخ',
    imageUrl: '/sheikheadphone.webp',
    imagePublicId: 'pub_3',
    productId: 'pd_headphone',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: {
      id: 'pd_headphone',
      name: 'هدفون شیخ',
      slug: 'sheikh-headphone',
      status: 'ACTIVE',
    },
  },
  {
    id: 'mss_4',
    title: 'دوربین لوکس شیخ',
    imageUrl: '/sheikhcamera.webp',
    imagePublicId: 'pub_4',
    productId: 'pd_camera',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: {
      id: 'pd_camera',
      name: 'دوربین شیخ',
      slug: 'sheikh-camera',
      status: 'ACTIVE',
    },
  },
  {
    id: 'mss_5',
    title: 'لپ‌تاپ گیمینگ شیخ',
    imageUrl: '/sheikhlaptop.webp',
    imagePublicId: 'pub_5',
    productId: 'pd_laptop',
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    product: {
      id: 'pd_laptop',
      name: 'لپ‌تاپ شیخ',
      slug: 'sheikh-laptop',
      status: 'ACTIVE',
    },
  },
];

describe('Marketing Showcase Visual Component (LuxuryProductArchCarouselClient)', () => {
  it('returns null when slides array is empty (0 slides)', () => {
    const { container } = render(<LuxuryProductArchCarouselClient slides={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders exactly 1 slide properly with no duplicates (1 slide)', () => {
    render(<LuxuryProductArchCarouselClient slides={[mockSlides[0]!]} />);

    // Exact 1 text element
    const titleElements = screen.getAllByText('اسپیکر ایستاده لوکس شیخ شاپ');
    expect(titleElements).toHaveLength(1);

    // Exact 1 link targeting product page
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/products/luxury-x9-speaker');
  });

  it('renders exactly 2 slides properly with no duplicate cloning (2 slides)', () => {
    render(<LuxuryProductArchCarouselClient slides={mockSlides.slice(0, 2)} />);

    expect(screen.getAllByText('اسپیکر ایستاده لوکس شیخ شاپ')).toHaveLength(1);
    expect(screen.getAllByText('ساعت هوشمند سلطنتی شیخ')).toHaveLength(1);

    const slidesRendered = screen.getAllByTestId('swiper-slide');
    expect(slidesRendered).toHaveLength(2);
  });

  it('renders exactly 3 slides properly (3 slides)', () => {
    render(<LuxuryProductArchCarouselClient slides={mockSlides.slice(0, 3)} />);

    const slidesRendered = screen.getAllByTestId('swiper-slide');
    expect(slidesRendered).toHaveLength(3);
  });

  it('renders exactly 5 slides properly (5 slides)', () => {
    render(<LuxuryProductArchCarouselClient slides={mockSlides} />);

    const slidesRendered = screen.getAllByTestId('swiper-slide');
    expect(slidesRendered).toHaveLength(5);
  });
});
