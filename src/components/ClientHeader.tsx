'use client';
import {
  Crown,
  Home,
  ShoppingBag,
  Users,
  FileText,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import CartDropdown from '@/components/cart';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';

export default function ClientHeader() {
  const { data: user, refetch } = useUser();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalStyle;
    }

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    refetch();
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'About Us', href: '/about-us', icon: Users },
    { name: 'Article', href: '/article', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-amber-950/98 backdrop-blur-2xl shadow-lg' : 'bg-amber-950/95 backdrop-blur-xl',
    )}>
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-b border-amber-200/10" />
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-8 h-8 text-amber-300" />
              <Link href="/" className="font-bold text-2xl tracking-wide bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                Sheikh Shop
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative group px-6 py-3 rounded-xl transition-all duration-300',
                    'flex items-center gap-2 font-medium text-sm',
                    active
                      ? 'text-amber-200 bg-white/12 backdrop-blur-sm border border-amber-200/20'
                      : 'text-gray-300 hover:text-amber-200 hover:bg-white/8 backdrop-blur-sm',
                  )}
                >
                  <Icon className={cn(
                    'w-4 h-4 transition-all duration-300',
                    active ? 'text-amber-300' : 'text-gray-400 group-hover:text-amber-300',
                  )} />
                  {item.name}

                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 rounded-full" />
                  )}

                  {/* Hover glow effect */}
                  <div className={cn(
                    'absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300',
                    'bg-gradient-to-r from-amber-200/10 via-yellow-200/8 to-orange-200/10',
                    'group-hover:opacity-100',
                  )} />
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Welcome Message */}
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-gray-300">Welcome, {user.email}</span>
              </div>
            )}

            {/* Cart */}
            <CartDropdown />

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className={cn(
                  'hidden md:flex items-center gap-2 px-4 py-2 rounded-xl',
                  'bg-white/8 backdrop-blur-sm border border-white/20',
                  'text-white hover:bg-white/12 hover:text-white hover:border-white/30',
                  'font-medium transition-all duration-300',
                  'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                )}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}

            {/* Login/Sign Up Buttons */}
            {!user && (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <button className="btn-ghost">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn-primary">
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                'lg:hidden w-12 h-12 rounded-xl flex items-center justify-center',
                'bg-white/8 backdrop-blur-sm border border-white/20',
                'text-white hover:bg-white/12 hover:border-white/30',
                'transition-all duration-300',
                'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
              )}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        'lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-out',
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
      )}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div className={cn(
          'absolute top-20 left-0 right-0 bg-amber-950/98 backdrop-blur-2xl border-b border-amber-200/10',
          'transform transition-transform duration-300 ease-out',
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full',
        )}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 mb-8 p-4 bg-white/8 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user.email}</p>
                  <p className="text-gray-400 text-sm">{user.role}</p>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-2 mb-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300',
                      'min-h-[44px] touch-manipulation', // iOS touch target size
                      active
                        ? 'bg-white/12 text-amber-200 border border-amber-200/20'
                        : 'text-gray-300 hover:bg-white/8 hover:text-amber-200',
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className={cn(
                      'w-5 h-5 transition-all duration-300',
                      active ? 'text-amber-300' : 'text-gray-400',
                    )} />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-amber-300 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                    'bg-white/8 backdrop-blur-sm border border-white/20',
                    'text-white hover:bg-white/12 hover:border-white/30',
                    'font-medium transition-all duration-300',
                    'min-h-[44px] touch-manipulation',
                  )}
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full btn-secondary min-h-[44px] touch-manipulation">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full btn-primary min-h-[44px] touch-manipulation">
                      Get Started
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
