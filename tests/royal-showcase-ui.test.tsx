/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
});

// Dynamic proxy mock for all lucide-react icons
jest.mock('lucide-react', () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return function MockIcon(props: any) {
          return <span data-testid={`icon-${String(prop)}`} {...props} />;
        };
      },
    }
  );
});

// Mock Next.js navigation & toast
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => '/',
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock React Three Fiber / Canvas to avoid WebGL rendering overhead in JSDOM
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="mock-r3f-canvas">{children}</div>,
  useFrame: jest.fn(),
}));

// Mock react-intersection-observer
jest.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: jest.fn(), inView: true }),
}));

import RoyalShowcase from '@/components/royal-showcase/RoyalShowcase';

describe('Royal Showcase Component UI Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders carousel with real database products and Toman prices', async () => {
    const mockApiData = {
      config: { isEnabled: true, loopMode: true, autoplayInterval: 5000, backgroundGlow: '#fbbf24' },
      featuredProducts: [
        { productId: 'p1', badgeType: 'BEST_SELLER', categoryEffect: 'HONEY', ctaText: 'خرید عسل' }
      ],
      allProducts: [
        {
          id: 'p1',
          name: 'Premium Iranian Honey',
          category: 'HONEY',
          categoryType: 'SheikhFood',
          basePrice: 1250000,
          slug: 'p1',
          status: 'ACTIVE',
          images: [{ secureUrl: '/honey.webp' }]
        }
      ]
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiData,
    } as Response);

    render(<RoyalShowcase />);

    await waitFor(() => {
      expect(screen.getByText('⭐ پرفروش‌ترین محصولات فروشگاه شیخ')).toBeInTheDocument();
      expect(screen.getByText('Premium Iranian Honey')).toBeInTheDocument();
      expect(screen.getByText('۱٬۲۵۰٬۰۰۰')).toBeInTheDocument();
      expect(screen.getByText('تومان')).toBeInTheDocument();
    });
  });

  test('Empty state: renders null when 0 featured products exist', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        config: { isEnabled: true },
        featuredProducts: [],
        allProducts: []
      }),
    } as Response);

    const { container } = render(<RoyalShowcase />);

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
