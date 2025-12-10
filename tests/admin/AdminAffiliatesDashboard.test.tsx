import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminAffiliatesDashboard from '@/components/admin/AdminAffiliatesDashboard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn().mockImplementation(({ children }) => <div>{children}</div>),
  },
}));

describe('AdminAffiliatesDashboard', () => {
  it('renders the main heading', async () => {
    // Mock fetch to prevent network errors
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
      } as Response)
    );

    render(<AdminAffiliatesDashboard />);

    // Wait for the main heading to appear
    await waitFor(() => {
      expect(screen.getByText('Admin - Affiliates')).toBeInTheDocument();
    });
  });
});
