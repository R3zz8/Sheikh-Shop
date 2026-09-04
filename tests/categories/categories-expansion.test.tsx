import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductCategoryType } from '@prisma/client';
import Categories from '@/components/Categories';
import { getActiveMainCategories } from '@/lib/services/getCategories';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: false, data: [] }),
  })
) as jest.Mock;

describe('Sheikh-Shop Category Expansion (6 Categories)', () => {
  it('should include SheikhNicotine and SheikhGrooming in ProductCategoryType enum', () => {
    expect(ProductCategoryType.SheikhNicotine).toBe('SheikhNicotine');
    expect(ProductCategoryType.SheikhGrooming).toBe('SheikhGrooming');
  });

  it('getActiveMainCategories service should return all 6 default categories', async () => {
    const categories = await getActiveMainCategories();
    expect(categories).toHaveLength(6);

    const names = categories.map(c => c.name);
    expect(names).toContain('شیخ نوا');
    expect(names).toContain('لوازم دیجیتال شیخ');
    expect(names).toContain('لوازم خانگی شیخ');
    expect(names).toContain('مواد غذایی شیخ');
    expect(names).toContain('شیخ نیکوتین');
    expect(names).toContain('شیخ گرومینگ');
  });

  it('Categories component should render 6 circular category cards in the UI', () => {
    render(<Categories />);
    expect(screen.getByText('شیخ نوا')).toBeInTheDocument();
    expect(screen.getByText('لوازم دیجیتال شیخ')).toBeInTheDocument();
    expect(screen.getByText('لوازم خانگی شیخ')).toBeInTheDocument();
    expect(screen.getByText('مواد غذایی شیخ')).toBeInTheDocument();
    expect(screen.getByText('شیخ نیکوتین')).toBeInTheDocument();
    expect(screen.getByText('شیخ گرومینگ')).toBeInTheDocument();
  });
});
