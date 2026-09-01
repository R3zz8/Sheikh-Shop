import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

// Mock lucide-react to prevent ESM import syntax error in Jest
jest.mock('lucide-react', () => {
  const React = require('react');
  const dummyIcon = (props: any) => React.createElement('svg', props);
  return {
    UserCircle2: dummyIcon,
    User2: dummyIcon,
    User: dummyIcon,
    Smile: dummyIcon,
    Crown: dummyIcon,
    Shield: dummyIcon,
    Settings: dummyIcon,
    LogOut: dummyIcon,
    Sparkles: dummyIcon,
    Trophy: dummyIcon,
    Package: dummyIcon,
    Home: dummyIcon,
    ShoppingBag: dummyIcon,
    Users: dummyIcon,
    FileText: dummyIcon,
    HelpCircle: dummyIcon,
    Handshake: dummyIcon,
    X: dummyIcon,
    ChevronDown: dummyIcon,
    Beef: dummyIcon,
    Cpu: dummyIcon,
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      button: React.forwardRef<HTMLButtonElement, any>(({ children, whileHover, whileTap, onClick, ...props }, ref) => (
        <button ref={ref} onClick={onClick} {...props}>{children}</button>
      )),
      div: React.forwardRef<HTMLDivElement, any>(({ children, whileHover, whileTap, initial, animate, exit, transition, drag, dragConstraints, dragElastic, onDragEnd, ...props }, ref) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

// Mock Radix UI Dropdown Menu
const DropdownContext = React.createContext<{ open: boolean; toggle: () => void }>({
  open: false,
  toggle: () => {},
});

jest.mock('@/components/ui/dropdown-menu', () => {
  const React = require('react');
  return {
    DropdownMenu: ({ children, open, onOpenChange }: any) => {
      const toggle = () => onOpenChange?.(!open);
      return (
        <DropdownContext.Provider value={{ open, toggle }}>
          <div data-testid="dropdown-root">{children}</div>
        </DropdownContext.Provider>
      );
    },
    DropdownMenuTrigger: ({ children }: any) => {
      const { toggle } = React.useContext(DropdownContext);
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        onClick: (e: any) => {
          child.props.onClick?.(e);
          toggle();
        },
      });
    },
    DropdownMenuContent: ({ children }: any) => {
      const { open } = React.useContext(DropdownContext);
      if (!open) return null;
      return <div data-testid="dropdown-content">{children}</div>;
    },
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuItem: ({ children }: any) => <div>{children}</div>,
  };
});

import UserBadge from '@/components/UserBadge';
import PremiumMobileMenu from '@/components/PremiumMobileMenu';

// Mock UI context
jest.mock('@/providers/UIProvider', () => ({
  useUIContext: () => ({
    isMobileMenuOpen: true,
    setMobileMenuOpen: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('User Orders Navigation & Badge Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@sheikhshop.com',
    role: 'USER' as const,
  };

  it('fetches order count and renders "سفارش‌های من" in UserBadge desktop dropdown', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/user/orders/count')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 3 }),
        });
      }
      if (url.includes('/api/user/profile')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ experiencePoints: 100, level: 2 }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<UserBadge user={mockUser} />);

    // Click button to trigger onOpenChange
    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('سفارش‌های من')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('renders "سفارش‌های من" link and count badge in PremiumMobileMenu', async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/user/orders/count')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ count: 5 }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<PremiumMobileMenu user={mockUser} onLogout={jest.fn()} />);

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /سفارش‌های من/i });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute('href', '/account/orders');
    });
  });
});
