import React from 'react';
import { render, screen } from '@testing-library/react';
import NewProductsSlider from '@/components/home/NewProductsSlider';
import { getNewProducts } from '@/lib/services/getNewProducts';

// Mock Swiper
jest.mock('swiper/react', () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper">{children}</div>,
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div data-testid="swiper-slide">{children}</div>,
}));

jest.mock('swiper/modules', () => ({
  Navigation: jest.fn(),
  Autoplay: jest.fn(),
  Keyboard: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  Sparkles: () => <div data-testid="sparkles" />,
  ArrowLeft: () => <div data-testid="arrow-left" />,
  Gift: () => <div data-testid="gift" />,
}));

describe('NewProductsSlider & getNewProducts Data Service', () => {
  const mockProducts = [
    {
      id: 'prod_new_1',
      name: 'عسل طبیعی جدید شیخ',
      slug: 'new-honey-sheikh',
      basePrice: 1250000,
      isNew: true,
      status: 'ACTIVE',
      images: [{ id: 'img1', secureUrl: '/honey.webp' }],
      discounts: [],
    },
    {
      id: 'prod_new_2',
      name: 'ساعت هوشمند سلطنتی جدید',
      slug: 'royal-watch-new',
      basePrice: 32800000,
      isNew: true,
      status: 'ACTIVE',
      images: [{ id: 'img2', secureUrl: '/watch.webp' }],
      discounts: [],
    },
  ];

  it('renders null when products array is empty', () => {
    const { container } = render(<NewProductsSlider products={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders products properly when items are present', () => {
    render(<NewProductsSlider products={mockProducts} />);

    expect(screen.getByText('محصولات جدید شیخ')).toBeInTheDocument();
    expect(screen.getByText('عسل طبیعی جدید شیخ')).toBeInTheDocument();
    expect(screen.getByText('ساعت هوشمند سلطنتی جدید')).toBeInTheDocument();
    expect(screen.getAllByText('جدید').length).toBeGreaterThan(0);
  });

  it('fetches only new and active products via getNewProducts service', async () => {
    const products = await getNewProducts();
    expect(Array.isArray(products)).toBe(true);

    products.forEach((product: any) => {
      expect(product.isNew).toBe(true);
      expect(product.status).toBe('ACTIVE');
    });
  });
});
