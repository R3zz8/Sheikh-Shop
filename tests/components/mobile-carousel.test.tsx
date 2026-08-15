import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MobileCarouselForm from '@/modules/mobile-carousel/components/MobileCarouselForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Image: () => <div data-testid="image-icon" />,
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('MobileCarouselForm Component', () => {
  const mockClose = jest.fn();
  const mockSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form with default values for new slide', () => {
    render(
      <MobileCarouselForm slide={null} onClose={mockClose} onSuccess={mockSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/عنوان بالای تیتر/i)).toHaveValue('فروشگاه شیخ');
    expect(screen.getByLabelText(/زیرعنوان انگلیسی/i)).toHaveValue('international store');
    expect(screen.getByLabelText(/متن دکمه/i)).toHaveValue('مشاهده فروشگاه');
  });

  test('pre-fills form with existing slide data', () => {
    const slide = {
      id: 'slide-1',
      topTitle: 'عنوان تست',
      subtitle: 'test subtitle',
      title: 'متن اصلی تبلیغاتی اول',
      ctaText: 'مشاهده ویژه',
      link: '/category/honey',
      image: 'https://example.com/test.jpg',
      order: 3,
    };

    render(
      <MobileCarouselForm slide={slide} onClose={mockClose} onSuccess={mockSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByLabelText(/عنوان بالای تیتر/i)).toHaveValue('عنوان تست');
    expect(screen.getByLabelText(/زیرعنوان انگلیسی/i)).toHaveValue('test subtitle');
    expect(screen.getByLabelText(/متن اصلی تبلیغاتی/i)).toHaveValue('متن اصلی تبلیغاتی اول');
    expect(screen.getByLabelText(/متن دکمه/i)).toHaveValue('مشاهده ویژه');
    expect(screen.getByLabelText(/لینک مقصد دکمه/i)).toHaveValue('/category/honey');
  });

  test('validates required fields on submission', async () => {
    render(
      <MobileCarouselForm slide={null} onClose={mockClose} onSuccess={mockSuccess} />,
      { wrapper: createWrapper() }
    );

    // Clear required fields
    const titleInput = screen.getByLabelText(/متن اصلی تبلیغاتی/i);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: /ذخیره تغییرات/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/متن اصلی تبلیغاتی الزامی است/i)).toBeInTheDocument();
    });
  });
});
