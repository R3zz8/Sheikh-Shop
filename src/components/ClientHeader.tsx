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
import { useState, useEffect } from 'react';
import CartDropdown from '@/components/cart';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import UserBadge from '@/components/UserBadge';
import PremiumMobileMenu from '@/components/PremiumMobileMenu';
import CurrencySwitcher from '@/components/CurrencySwitcher';

export default function ClientHeader() {
  const { data: user, refetch } = useUser();
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
  }, []);

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

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium text-sm text-gray-300 hover:text-amber-200 hover:bg-white/8 backdrop-blur-sm"
                >
                  <Icon className="w-4 h-4 transition-all duration-300 text-gray-400 group-hover:text-amber-300" />
                  {item.name}

                  {/* Hover glow effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 bg-gradient-to-r from-amber-200/10 via-yellow-200/8 to-orange-200/10 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Currency Switcher */}
            <CurrencySwitcher 
              variant="dropdown"
              className="hidden md:flex"
            />

            {/* User Badge */}
            {user && (
              <UserBadge 
                user={user} 
                onLogout={handleLogout}
                className="hidden md:flex"
              />
            )}

            {/* Cart */}
            <CartDropdown />

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

      {/* Premium Mobile Menu */}
      <PremiumMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
