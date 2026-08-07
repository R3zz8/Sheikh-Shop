import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lucide-react to prevent ESM import syntax error in Jest
jest.mock('lucide-react', () => ({
  Crown: () => <span data-testid="crown-icon" />,
}));

// Mock framer-motion to prevent context/transpile errors in Jest JSDOM
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>(({ children, whileHover, whileTap, ...props }, ref) => (
      <button ref={ref} {...props}>{children}</button>
    )),
    div: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>{children}</div>
    )),
  },
  useReducedMotion: () => false,
}));

import GoogleAuthButton from '@/components/auth/GoogleAuthButton';

// Mock window.location.href
const originalLocation = window.location;

beforeAll(() => {
  // @ts-ignore
  delete window.location;
  window.location = { ...originalLocation, href: '' };
});

afterAll(() => {
  window.location = originalLocation;
});

describe('GoogleAuthButton Component', () => {
  it('renders correctly with default state', () => {
    render(<GoogleAuthButton />);
    expect(screen.getByText('ادامه با حساب گوگل')).toBeInTheDocument();
  });

  it('triggers custom onClick if provided', () => {
    const mockOnClick = jest.fn();
    render(<GoogleAuthButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('triggers default window.location redirection if onClick is not provided', () => {
    render(<GoogleAuthButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(window.location.href).toBe('/api/auth/google');
  });

  it('renders loading state and disables interaction', () => {
    render(<GoogleAuthButton isLoading={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('در حال اتصال به گوگل...')).toBeInTheDocument();
  });
});
