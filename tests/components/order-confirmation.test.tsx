import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderConfirmationModal from '@/components/product/OrderConfirmationModal';
import ProductDetailPage from '@/components/product/ProductDetailPage';
import { STORE_CONTACT_CONFIG } from '@/lib/config/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

// Mock dependencies
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const mockMutateAsync = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    addToCartMutation: {
      mutateAsync: mockMutateAsync,
      isPending: false,
    },
  }),
}));

jest.mock('@/hooks/useUserBehavior', () => ({
  useUserBehavior: () => ({
    trackAddToCart: jest.fn(),
  }),
}));

jest.mock('@/components/3d/LuxuryUnboxingProvider', () => ({
  useLuxuryUnboxing: () => ({
    triggerUnboxing: jest.fn(),
    config: { isEnabled: false },
  }),
}));

const sampleNormalProduct: any = {
  id: 'p_test_normal',
  name: 'عسل کوهستان ۵۰۰ گرمی',
  basePrice: 500000,
  quantity: 20,
  status: 'ACTIVE',
  categoryType: 'SheikhFood',
  baseUnitId: 'u_kg',
  requiresOrderConfirmation: false,
  images: [{ id: 'img1', secureUrl: '/test.jpg' }],
};

const sampleConfirmationProduct: any = {
  id: 'p_test_confirmation',
  name: 'اسپیکر لوکس رویال X9',
  basePrice: 15000000,
  quantity: 10,
  status: 'ACTIVE',
  categoryType: 'SheikhTech',
  baseUnitId: 'u_pcs',
  requiresOrderConfirmation: true,
  images: [{ id: 'img2', secureUrl: '/speaker.jpg' }],
};

const sampleOutOfStockProduct: any = {
  id: 'p_test_oos',
  name: 'محصول ناموجود خاص',
  basePrice: 2000000,
  quantity: 0,
  status: 'ACTIVE',
  categoryType: 'SheikhTech',
  baseUnitId: 'u_pcs',
  requiresOrderConfirmation: true,
  inventoryStatus: 'OUT_OF_STOCK',
  images: [{ id: 'img3', secureUrl: '/oos.jpg' }],
};

describe('Pre-Payment Order Confirmation / Concierge System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OrderConfirmationModal Component', () => {
    it('renders correct Persian RTL copy and store support phone number', () => {
      render(
        <OrderConfirmationModal
          isOpen={true}
          onClose={jest.fn()}
          product={sampleConfirmationProduct}
          selectedQuantity={1}
        />
      );

      expect(screen.getByText(STORE_CONTACT_CONFIG.conciergeEyebrow)).toBeInTheDocument();
      expect(screen.getByText(STORE_CONTACT_CONFIG.conciergeTitle)).toBeInTheDocument();
      expect(screen.getByText(/از اعتماد و انتخاب شما از فروشگاه شیخ صمیمانه سپاسگزاریم/i)).toBeInTheDocument();
      expect(screen.getByText(/با توجه به تغییرات لحظه‌ای بازار/i)).toBeInTheDocument();
      expect(screen.getByText('بررسی موجودی')).toBeInTheDocument();
      expect(screen.getByText('تأیید قیمت نهایی')).toBeInTheDocument();
      expect(screen.getByText('هماهنگی سفارش')).toBeInTheDocument();
      expect(screen.getByText(STORE_CONTACT_CONFIG.phonePersian)).toBeInTheDocument();
      expect(screen.getByText('هماهنگی و تأیید سفارش')).toBeInTheDocument();
      expect(screen.getByText('بعداً هماهنگ می‌کنم')).toBeInTheDocument();
    });

    it('copies phone number and displays inline success state without native alert', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <OrderConfirmationModal
          isOpen={true}
          onClose={jest.fn()}
          product={sampleConfirmationProduct}
        />
      );

      const copyButton = screen.getByText('کپی شماره');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(STORE_CONTACT_CONFIG.phone);
        expect(screen.getByText('شماره تماس کپی شد.')).toBeInTheDocument();
      });
    });

    it('closes modal when secondary exit button "بعداً هماهنگ می‌کنم" is clicked', () => {
      const handleClose = jest.fn();
      render(
        <OrderConfirmationModal
          isOpen={true}
          onClose={handleClose}
          product={sampleConfirmationProduct}
        />
      );

      const exitButton = screen.getByText('بعداً هماهنگ می‌کنم');
      fireEvent.click(exitButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ProductDetailPage Purchase Intent Flow', () => {
    it('opens confirmation modal when product requires order confirmation', async () => {
      renderWithProviders(
        <ProductDetailPage
          product={sampleConfirmationProduct}
        />
      );

      // Modal should initially not be open
      expect(screen.queryByText(STORE_CONTACT_CONFIG.conciergeTitle)).not.toBeInTheDocument();

      // Click "افزودن به سبد خرید"
      const addToCartButton = screen.getAllByText('افزودن به سبد خرید')[0];
      fireEvent.click(addToCartButton);

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByText(STORE_CONTACT_CONFIG.conciergeTitle)).toBeInTheDocument();
      });
    });

    it('bypasses modal when product does not require order confirmation', async () => {
      renderWithProviders(
        <ProductDetailPage
          product={sampleNormalProduct}
        />
      );

      const addToCartButton = screen.getAllByText('افزودن به سبد خرید')[0];
      fireEvent.click(addToCartButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          productId: 'p_test_normal',
          unitId: 'u_kg',
          quantity: 1,
        });
        expect(screen.queryByText(STORE_CONTACT_CONFIG.conciergeTitle)).not.toBeInTheDocument();
      });
    });

    it('preserves out-of-stock behavior without showing add-to-cart confirmation', () => {
      renderWithProviders(
        <ProductDetailPage
          product={sampleOutOfStockProduct}
        />
      );

      expect(screen.getAllByText(/🔔 موجود شد خبرم کن/i).length).toBeGreaterThan(0);
      expect(screen.queryByText('افزودن به سبد خرید')).not.toBeInTheDocument();
    });
  });
});
