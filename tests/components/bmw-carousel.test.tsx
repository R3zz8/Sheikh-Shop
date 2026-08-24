import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BMWCarousel from '@/components/BMWCarousel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: { children: any }) => (
    <div data-testid="swiper-slide">
      {typeof children === 'function' ? children({ isActive: true }) : children}
    </div>
  ),
}));

jest.mock('swiper/modules', () => ({
  Pagination: jest.fn(),
  EffectCoverflow: jest.fn(),
}));

jest.mock('swiper/css', () => ({}));
jest.mock('swiper/css/effect-coverflow', () => ({}));
jest.mock('swiper/css/pagination', () => ({}));

// Mock useMediaQuery to simulate Desktop
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn().mockReturnValue(true),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQuery = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('3D Homepage Carousel Component (BMWCarousel)', () => {
  it('renders default fallback slides when no initial slides provided', () => {
    renderWithQuery(<BMWCarousel />);
    const slides = screen.getAllByTestId('swiper-slide');
    expect(slides.length).toBeGreaterThan(0);
    expect(screen.getByText('Class A')).toBeInTheDocument();
  });

  it('renders dynamic slides when initialSlides prop is passed', () => {
    const customSlides = [
      { id: '1', title: 'Luxury Custom 1', image: '/custom1.jpg' },
      { id: '2', title: 'Luxury Custom 2', image: '/custom2.jpg' },
    ];
    renderWithQuery(<BMWCarousel initialSlides={customSlides} />);
    const slides = screen.getAllByTestId('swiper-slide');
    expect(slides).toHaveLength(2);
    expect(screen.getByText('Luxury Custom 1')).toBeInTheDocument();
    expect(screen.getByText('Luxury Custom 2')).toBeInTheDocument();
  });
});
