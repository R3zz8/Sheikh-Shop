import React from 'react';
import { render, screen } from '@testing-library/react';
import BMWCarousel from '@/components/BMWCarousel';
import { getSpecialProducts } from '@/lib/services/getSpecialProducts';
import { prisma } from '@/lib/prisma';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Mock dependencies
jest.mock('@/hooks/useMediaQuery');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}));
jest.mock('@/lib/cache/redis', () => ({
  cacheService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
  },
  CACHE_TTL: {
    PRODUCTS: 300,
  },
}));

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

describe('Special Products 3D Carousel (BMWCarousel)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Default to desktop view
  });

  describe('getSpecialProducts service', () => {
    it('queries only active products with isBestSeller: true', async () => {
      const mockRawProducts = [
        {
          id: 'prod-special-1',
          name: 'محصول ویژه ۱',
          slug: 'special-product-1',
          category: 'HONEY',
          categoryType: 'SheikhFood',
          description: 'توضیحات ویژه',
          excerpt: 'چکیده',
          basePrice: 1500000,
          status: 'ACTIVE',
          isNew: false,
          isBestSeller: true,
          isAmazing: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          images: [{ id: 'img-1', image: '/img1.jpg', secureUrl: '/img1.jpg', isFeatured: true, isVisible: true, sortOrder: 0, createdAt: new Date() }],
          units: [],
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockRawProducts);

      const result = await getSpecialProducts(10);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isBestSeller: true,
            status: 'ACTIVE',
          },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('محصول ویژه ۱');
    });

    it('returns an empty array on database query failure without crashing', async () => {
      (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await getSpecialProducts(10);
      expect(result).toEqual([]);
    });
  });

  describe('BMWCarousel Component', () => {
    it('renders products properly when items are present on desktop view', () => {
      const mockProducts = [
        {
          id: 'p1',
          name: 'زعفران ممتاز ویژه',
          slug: 'saffron-special',
          basePrice: 2500000,
          images: [{ secureUrl: 'https://example.com/saffron.jpg' }],
        },
      ];

      render(<BMWCarousel products={mockProducts} />);

      expect(screen.getByTestId('swiper')).toBeInTheDocument();
      expect(screen.getByText('زعفران ممتاز ویژه')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /explore/i })).toHaveAttribute(
        'href',
        '/products/saffron-special'
      );
    });

    it('returns null when zero products are passed', () => {
      const { container } = render(<BMWCarousel products={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null on non-desktop viewports (<1024px)', () => {
      (useMediaQuery as jest.Mock).mockReturnValue(false);

      const mockProducts = [
        {
          id: 'p1',
          name: 'عسل ویژه',
          basePrice: 1000000,
          images: [{ secureUrl: 'https://example.com/honey.jpg' }],
        },
      ];

      const { container } = render(<BMWCarousel products={mockProducts} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
