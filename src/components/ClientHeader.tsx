'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, ShoppingBag, Users, FileText, 
  Crown, Menu, X, ShoppingCart, LogOut, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumMobileMenu from './PremiumMobileMenu';
import { useUser } from '@/hooks/useUser';

export default function ClientHeader() {
  // رفع خطای TypeScript
  const { data: user, refetch } = useUser() as { data: any; refetch: () => void };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Products', href: '/products', icon: ShoppingBag },
    { name: 'About Us', href: '/about-us', icon: Users },
    { name: 'Article', href: '/article', icon: FileText },
  ];

  return (
    <>
      {/* هدر دسکتاپ — دقیقاً مثل اولین کد تو */}
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-amber-950/98 backdrop-blur-2xl shadow-lg' : 'bg-amber-950/95 backdrop-blur-xl',
        isMobileMenuOpen && 'z-40' // فقط وقتی منو بازه، زیرش بره
      )}>
        {/* پس‌زمینه اصلی — دقیقاً مثل قبل */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-b border-amber-200/10" />
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 lg:h-20">
              {/* لوگو — دقیقاً مثل قبل، بدون زیرنویس */}
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <Crown className="w-8 h-8 lg:w-10 lg:h-10 text-amber-400 group-hover:text-amber-300 transition-colors" />
                  <div className="absolute inset-0 blur-xl bg-amber-400 opacity-60 group-hover:opacity-80 transition-opacity" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 bg-clip-text text-transparent">
                    Sheikh Shop
                  </h1>
                  {/* زیرنویس حذف شد — دقیقاً مثل اولین کد تو */}
                </div>
              </Link>

              {/* منوی دسکتاپ — دقیقاً مثل اولین کد تو */}
              <nav className="hidden lg:flex items-center gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                        active
                          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                          : 'text-amber-100 hover:text-white'
                      )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                      <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-amber-300 group-hover:text-amber-100')} />
                      <span className="font-medium">{item.name}</span>
                      {/* نقطه نارنجی برای Home فعال حذف شد — دقیقاً مثل قبل */}
                    </Link>
                  );
                })}
              </nav>

              {/* دکمه‌های سمت راست — دقیقاً مثل قبل */}
              <div className="flex items-center gap-3 lg:gap-4">
                <button className="relative p-2 rounded-xl bg-amber-900/30 hover:bg-amber-800/40 transition-colors">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-amber-300" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full text-xs font-bold text-white flex items-center justify-center">3</span>
                </button>

                {!user ? (
                  <>
                    <Link href="/login" className="hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800/50 border border-amber-600 text-amber-100 font-medium hover:bg-amber-700/50 transition-all">
                      Sign In
                    </Link>
                    <Link href="/register" className="hidden lg:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all">
                      Get Started
                    </Link>
                  </>
                ) : (
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0 0.5">
                        <div className="w-full h-full rounded-full bg-amber-950 flex items-center justify-center">
                          <User className="w-5 h-5 text-amber-300" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-100">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-amber-300">Premium Member</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl bg-red-900/30 hover:bg-red-800/40 transition-colors">
                      <LogOut className="w-5 h-5 text-red-300" />
                    </button>
                  </div>
                )}

                {/* دکمه منوی موبایل */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-amber-900/30 hover:bg-amber-800/40 transition-colors"
                >
                  <Menu className="w-6 h-6 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* منوی موبایل — جدید و بدون شیشه‌ای */}
      <PremiumMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={() => {
          setIsMobileMenuOpen(false);
        }}
      />
    </>
  );
}