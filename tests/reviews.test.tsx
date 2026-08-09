import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductStructuredData from '@/components/seo/ProductStructuredData';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import { stripHtmlTags } from '@/lib/seo/sanitize';

// Mock lucide-react to prevent ESM import syntax error in Jest
jest.mock('lucide-react', () => {
  const React = require('react');
  const mockIcon = (name: string) => {
    return React.forwardRef((props: any, ref: any) => (
      <span ref={ref} data-testid={`icon-${name}`} {...props} />
    ));
  };
  return {
    Star: mockIcon('star'),
    ShoppingBag: mockIcon('shopping-bag'),
    Truck: mockIcon('truck'),
    ShieldCheck: mockIcon('shield-check'),
    CreditCard: mockIcon('credit-card'),
    Headphones: mockIcon('headphones'),
    Sparkles: mockIcon('sparkles'),
    Gift: mockIcon('gift'),
    ChevronDown: mockIcon('chevron-down'),
    ChevronRight: mockIcon('chevron-right'),
    ChevronLeft: mockIcon('chevron-left'),
    Minus: mockIcon('minus'),
    Plus: mockIcon('plus'),
    Heart: mockIcon('heart'),
    BarChart3: mockIcon('bar-chart'),
    HelpCircle: mockIcon('help-circle'),
    MessageSquare: mockIcon('message-square'),
    Share2: mockIcon('share-2'),
    Eye: mockIcon('eye'),
    ShieldAlert: mockIcon('shield-alert'),
    BadgePercent: mockIcon('badge-percent'),
    CheckCircle2: mockIcon('check-circle-2'),
    ShoppingCart: mockIcon('shopping-cart'),
  };
});

// Mock hooks and providers
jest.mock('@/hooks/useUser', () => ({
  useUser: () => ({ data: { id: 'u_1', email: 'test@example.com' }, isLoading: false }),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addToCartMutation: { isPending: false, mutateAsync: jest.fn() },
  }),
}));

jest.mock('@/components/3d/LuxuryUnboxingProvider', () => ({
  useLuxuryUnboxing: () => ({
    triggerUnboxing: jest.fn(),
    config: { isEnabled: true },
  }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
    button: React.forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock child components to isolate our test
jest.mock('@/components/recommendations/BundleRecommendations', () => {
  return function MockBundle() { return <div data-testid="bundle-recommendations" />; };
});
jest.mock('@/components/product/ReviewSubmissionCard', () => {
  return function MockSubmission() { return <div data-testid="review-submission-card" />; };
});
jest.mock('@/components/product/DynamicReviewSection', () => {
  return function MockDynamicSection() { return <div data-testid="dynamic-review-section" />; };
});
jest.mock('@/components/product/ImageGallery', () => {
  return function MockGallery() { return <div data-testid="image-gallery" />; };
});

const mockProduct = {
  id: 'p_honey_premium',
  name: 'عسل طبیعی کوهستان شمس',
  category: 'HONEY',
  basePrice: 550000,
  baseUnitId: 'unit-1',
  quantity: 24,
  status: 'ACTIVE',
  categoryType: 'SheikhFood',
  baseUnit: { id: 'unit-1', name: 'کیلوگرم' },
  images: [{ id: 'img-1', image: '/honey.jpg' }],
  units: [],
};

describe('Authentic Product Review System Tests', () => {
  describe('HTML Sanitization (Security)', () => {
    test('stripHtmlTags removes malicious HTML and scripts', () => {
      const maliciousInput = 'عنوان فوق العاده <script>alert("XSS")</script> با کیفیت عالی <img src=x onerror=alert(1)>';
      const clean = stripHtmlTags(maliciousInput);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('<img');
      expect(clean).toContain('alert("XSS")');
      expect(clean).toContain('عنوان فوق العاده');
    });
  });

  describe('Structured Data Schema Accuracy (SEO)', () => {
    test('Zero reviews: omits aggregateRating from Product structured data', () => {
      render(
        <ProductStructuredData
          product={mockProduct as any}
          ratingValue={undefined}
          reviewCount={0}
          reviewsList={[]}
        />
      );

      const scriptElement = document.querySelector('script[type="application/ld+json"]');
      expect(scriptElement).toBeInTheDocument();
      const schemaData = JSON.parse(scriptElement?.innerHTML || '{}');

      expect(schemaData.aggregateRating).toBeUndefined();
      expect(schemaData.review).toBeUndefined();
    });

    test('Has reviews: includes aggregateRating in Product structured data', () => {
      render(
        <ProductStructuredData
          product={mockProduct as any}
          ratingValue={4.6}
          reviewCount={12}
          reviewsList={[
            { userName: 'علی', rating: 5, comment: 'عالی بود', createdAt: '2026-11-20T10:00:00.000Z' }
          ]}
        />
      );

      const scriptElement = document.querySelector('script[type="application/ld+json"]');
      expect(scriptElement).toBeInTheDocument();
      const schemaData = JSON.parse(scriptElement?.innerHTML || '{}');

      expect(schemaData.aggregateRating).toBeDefined();
      expect(schemaData.aggregateRating.ratingValue).toBe('4.6');
      expect(schemaData.aggregateRating.reviewCount).toBe('12');
      expect(schemaData.review).toBeDefined();
      expect(schemaData.review[0].author.name).toBe('علی');
    });
  });

  describe('Authentic PDP Rating Summary Render', () => {
    test('Zero reviews: renders "بدون امتیاز" and "(۰ دیدگاه تایید شده)"', () => {
      const { container } = render(
        <ProductDetailPage
          product={mockProduct as any}
          allProducts={[]}
          ratingValue={undefined}
          reviewCount={0}
        />
      );

      // Check desktop zero state
      const desktopSummary = screen.getAllByText('بدون امتیاز');
      expect(desktopSummary.length).toBeGreaterThan(0);

      const desktopCount = screen.getByText('(۰ دیدگاه تایید شده)');
      expect(desktopCount).toBeInTheDocument();

      // Check mobile zero state
      const mobileCount = screen.getByText('(۰ نظر کاربران)');
      expect(mobileCount).toBeInTheDocument();
    });

    test('Has reviews: renders actual rating and review count', () => {
      render(
        <ProductDetailPage
          product={mockProduct as any}
          allProducts={[]}
          ratingValue={4.5}
          reviewCount={18}
        />
      );

      const ratingText = screen.getAllByText('4.5');
      expect(ratingText.length).toBeGreaterThan(0);

      const reviewCountText = screen.getByText('(18 دیدگاه تایید شده)');
      expect(reviewCountText).toBeInTheDocument();

      const mobileReviewCountText = screen.getByText('(18 نظر کاربران)');
      expect(mobileReviewCountText).toBeInTheDocument();
    });
  });
});
