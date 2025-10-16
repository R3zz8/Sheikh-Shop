'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Grid,
  ShoppingBag,
  Heart,
  User,
  MessageCircle,
} from 'lucide-react';
import { useMemo } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  key: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: Home, key: 'home' },
  { href: '/categories', label: 'Categories', icon: Grid, key: 'categories' },
  // Center (Products) rendered specially
  { href: '/wishlist', label: 'Favorites', icon: Heart, key: 'favorites' },
  { href: '/register', label: 'Profile', icon: User, key: 'profile' },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function MobileNavigation() {
  const pathname = usePathname();

  const activeKey = useMemo(() => {
    if (!pathname) return '';
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categories')) return 'categories';
    if (pathname.startsWith('/products')) return 'products';
    if (pathname.startsWith('/wishlist')) return 'favorites';
    if (pathname.startsWith('/register') || pathname.startsWith('/user')) return 'profile';
    return '';
  }, [pathname]);

  const isActive = (key: string) => activeKey === key;

  return (
    <div className="md:hidden fixed inset-x-0 bottom-3 z-50 px-4">
      <div className="relative max-w-md mx-auto">
        {/* Frosted floating bar with soft brand styling */}
        <div
          className={
            'relative w-full rounded-2xl bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.18)]'
          }
          aria-label="Primary navigation"
          role="navigation"
        >
          {/* Concave dip visual using an overlay circle and inner shadow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-transparent pointer-events-none">
            {/* Simulate concave cut with inner shadow highlight */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_10px_14px_rgba(0,0,0,0.08)]" />
          </div>

          {/* Grid for five items with the center reserved for Products button */}
          <div className="grid grid-cols-5 items-end px-4 py-3">
            {/* Home */}
            <NavLink href="/" label="Home" active={isActive('home')}>
              <Home className={iconClass(isActive('home'))} />
            </NavLink>

            {/* Categories */}
            <NavLink href="/categories" label="Categories" active={isActive('categories')}>
              <Grid className={iconClass(isActive('categories'))} />
            </NavLink>

            {/* Spacer for center button (Products) */}
            <div className="flex items-center justify-center" aria-hidden />

            {/* Favorites */}
            <NavLink href="/wishlist" label="Favorites" active={isActive('favorites')}>
              <Heart className={iconClass(isActive('favorites'))} />
            </NavLink>

            {/* Profile */}
            <NavLink href="/register" label="Profile" active={isActive('profile')}>
              <User className={iconClass(isActive('profile'))} />
            </NavLink>
          </div>

          {/* Center primary Products action inside concave dip */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2">
            <Link href="/products" aria-label="Products" className="group">
              <motion.div
                whileTap={{ scale: 0.96 }}
                className={cx(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  'shadow-[0_10px_24px_rgba(0,0,0,0.22)] border',
                  'border-amber-300/50 bg-white/90 backdrop-blur-xl'
                )}
                style={{
                  boxShadow:
                    '0 4px 16px rgba(58,43,34,0.18), 0 0 0 6px rgba(194,143,58,0.12)',
                }}
              >
                <ShoppingBag
                  className={cx(
                    'w-7 h-7',
                    'text-[--brand-brown]'
                  )}
                />
              </motion.div>
            </Link>
          </div>

          {/* Floating chatbot button above Profile area */}
          <div className="absolute -top-12 right-6">
            <Link href="/chatbot" aria-label="Chatbot">
              <motion.div
                initial={{ scale: 1, opacity: 0.95 }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.95, 1, 0.95] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className={cx(
                  'w-11 h-11 rounded-full flex items-center justify-center',
                  'bg-white shadow-[0_8px_22px_rgba(0,0,0,0.18)] border border-amber-300/50'
                )}
                style={{
                  boxShadow:
                    '0 6px 18px rgba(58,43,34,0.22), 0 0 0 4px rgba(194,143,58,0.10)',
                }}
              >
                <MessageCircle className="w-5 h-5 text-[--brand-brown]" />
              </motion.div>
            </Link>
          </div>
        </div>
      </div>

      {/* Brand CSS variables for consistent theming */}
      <style jsx global>{`
        :root {
          --brand-brown: #3A2B22;
          --brand-gold: #C28F3A;
          --brand-bg: #F7F3EF;
        }
      `}</style>
    </div>
  );
}

function NavLink({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cx(
        'relative flex items-center justify-center h-12',
        'rounded-xl transition-colors'
      )}
    >
      {active && (
        <span
          className="absolute inset-0 rounded-xl bg-amber-300/10 border border-amber-300/30"
          aria-hidden
        />
      )}
      {children}
    </Link>
  );
}

function iconClass(active?: boolean) {
  return cx(
    'w-6 h-6',
    active ? 'text-[--brand-gold] drop-shadow-[0_0_8px_rgba(194,143,58,0.45)]' : 'text-[--brand-brown] opacity-90'
  );
}



