'use client';
import {
  Crown,
  Home,
  ShoppingBag,
  Users,
  FileText,
  LogOut,
  Lock,
  Mail,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import CartDropdown from '@/components/cart';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import UserBadge from '@/components/UserBadge';
import PremiumMobileMenu from '@/components/PremiumMobileMenu';
import { usePathname } from 'next/navigation';
import { useUIContext } from '@/providers/UIProvider';

export default function ClientHeader() {
  const { data: user, refetch } = useUser() as { data: any; refetch: () => void };
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const pathname = usePathname();
  const aboutRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Handle scroll effect
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
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setIsAboutOpen(false);
      }
      if (productsRef.current && !productsRef.current.contains(e.target as Node)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    refetch();
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'خانه', href: '/', icon: Home },
    {
      name: 'محصولات',
      href: '/products',
      icon: ShoppingBag,
      subItems: [
        { name: 'محصولات غذایی شیخ', href: '/products' },
        { name: 'محصولات فناورانه شیخ', href: '/tech-products' },
      ],
    },
    {
      name: 'درباره ما',
      href: '/about-us',
      icon: Users,
      subItems: [
        { name: 'حریم خصوصی', href: '/privacy' },
        { name: 'تماس با ما', href: '/contact' },
      ],
    },
    { name: 'مقالات', href: '/article', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        dir="rtl"
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          hasMounted && isScrolled
            ? 'bg-amber-950/98 backdrop-blur-2xl shadow-lg'
            : 'bg-amber-950/95 backdrop-blur-xl',
          isMobileMenuOpen && 'z-40'
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-b border-amber-200/10" />
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
          <nav className="flex items-center justify-between h-20">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Crown className="w-8 h-8 text-amber-300" />
                <div className="absolute inset-0 blur-xl bg-amber-400 opacity-60" />
              </div>
              <Link href="/" className="font-bold text-[26px] md:text-[30px] bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent select-none">
                فروشگاه شیخ
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                if (!item.subItems) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'relative group px-6 py-3 rounded-xl flex items-center gap-2 text-[18px] lg:text-[19px] xl:text-[20px] font-medium transition-all duration-200',
                        active
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                          : 'text-gray-300 hover:bg-white/8 backdrop-blur-sm'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                }

                if (item.name === 'محصولات') {
                  return (
                    <div
                      ref={productsRef}
                      key={item.name}
                      className="relative group"
                      onMouseEnter={() => setIsProductsOpen(true)}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'relative px-6 py-3 rounded-xl flex items-center gap-2 text-[18px] lg:text-[19px] xl:text-[20px] font-medium cursor-pointer transition-all duration-200',
                          active || isProductsOpen
                            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                            : 'text-gray-300 hover:bg-white/8 backdrop-blur-sm'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.name}
                        <ChevronDown className="w-5 h-5" />
                      </Link>

                      {isProductsOpen && (
                        <div
                          onMouseLeave={() => setIsProductsOpen(false)}
                          className="absolute right-0 mt-2 w-[160px] bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-xl border border-amber-600 rounded-2xl shadow-2xl z-50 animate-fadeIn py-2 animate-duration-200"
                        >
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-amber-800/50 rounded-lg text-sm font-medium"
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    ref={aboutRef}
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => setIsAboutOpen(true)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        'relative px-6 py-3 rounded-xl flex items-center gap-2 text-[18px] lg:text-[19px] xl:text-[20px] font-medium cursor-pointer transition-all duration-200',
                        active || isAboutOpen
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                          : 'text-gray-300 hover:bg-white/8 backdrop-blur-sm'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                      <ChevronDown className="w-5 h-5" />
                    </Link>

                    {isAboutOpen && (
                      <div
                        onMouseLeave={() => setIsAboutOpen(false)}
                        className="absolute right-0 mt-2 w-[160px] bg-gradient-to-r from-amber-600 to-orange-600 backdrop-blur-xl border border-amber-600 rounded-2xl shadow-2xl z-50 animate-fadeIn py-2"
                      >
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-amber-800/50 rounded-lg text-sm font-medium"
                          >
                            {subItem.name === 'Privacy Policy' ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {user && <UserBadge user={user} onLogout={handleLogout} className="hidden md:flex" />}
              <CartDropdown />

              {!user && (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login">
                    <button className="px-5 py-2.5 rounded-xl bg-amber-800/50 border border-amber-600 text-amber-100 text-[16px] xl:text-[18px] font-semibold">
                      ورود
                    </button>
                  </Link>

                  <Link href="/register">
                    <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[16px] xl:text-[18px] font-bold shadow-lg shadow-amber-500/30">
                      ثبت نام
                    </button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden w-12 h-12 rounded-xl flex items-center justify-center bg-white/8 backdrop-blur-sm border border-white/20 text-white"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <PremiumMobileMenu user={user} onLogout={handleLogout} />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}