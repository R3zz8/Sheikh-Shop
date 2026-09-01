'use client';

import React, { useState, useEffect, useRef, type ComponentType } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ShoppingBag, Users, FileText, 
  HelpCircle, Handshake, Shield, 
  Crown, Sparkles, X, LogOut,
  ChevronDown,
  Beef,
  Cpu,
  User,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sub-item interface including icon
interface SubMenuItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

// Navigation Item interface
interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  subItems?: SubMenuItem[];
}

import { useUIContext } from '@/providers/UIProvider';

interface PremiumMobileMenuProps {
  user?: any;
  onLogout?: () => void;
}

export default function PremiumMobileMenu({ 
  user, 
  onLogout 
}: PremiumMobileMenuProps) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIContext();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchOrderCount = async () => {
      if (!isMobileMenuOpen || !user) return;
      try {
        const res = await fetch('/api/user/orders/count');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setOrderCount(data.count ?? 0);
        }
      } catch {
        if (mounted) setOrderCount(null);
      }
    };
    fetchOrderCount();
    return () => { mounted = false; };
  }, [isMobileMenuOpen, user]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsVisible(true);
      if (
        pathname.startsWith('/products') ||
        pathname.startsWith('/tech_products') ||
        pathname.startsWith('/tech-products') ||
        pathname.startsWith('/sheikh-digital') ||
        pathname.startsWith('/sheikh-home')
      ) {
        setExpandedItem('محصولات');
      } else {
        setExpandedItem(null);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [isMobileMenuOpen, pathname]);

  // Handle open/close state events, body class locking, and haptics
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
      document.body.style.overflow = 'hidden';
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(8); } catch (_) {}
      }
    } else {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(8); } catch (_) {}
      }
    }

    const event = new CustomEvent('sheikh-mobile-menu-state', { detail: { isOpen: isMobileMenuOpen } });
    window.dispatchEvent(event);

    return () => {
      document.body.classList.remove('mobile-menu-open');
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('sheikh-mobile-menu-state', { detail: { isOpen: false } }));
    };
  }, [isMobileMenuOpen]);

  // Trap focus and close on Escape key (Accessibility)
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }

      if (e.key === 'Tab' && menuRef.current) {
        const focusableElements = menuRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    // Set initial focus to close button
    const focusTimer = setTimeout(() => {
      if (menuRef.current) {
        const closeBtn = menuRef.current.querySelector('button[aria-label="Close menu"]') as HTMLElement;
        if (closeBtn) {
          closeBtn.focus();
        } else {
          const firstFocusable = menuRef.current.querySelector('button, a') as HTMLElement;
          if (firstFocusable) firstFocusable.focus();
        }
      }
    }, 120);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  // Check if item or sub-item is active
  const isActive = (href: string, subItems?: SubMenuItem[]) => {
    if (subItems && subItems.length > 0) {
      return subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href));
    }
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href);
  };

  const handleParentClick = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  if (!isVisible) return null;

  const mobileNavigation: NavigationItem[] = [
    { name: 'خانه',        href: '/',          icon: Home },
    {
      name: 'محصولات',
      href: '/products',
      icon: ShoppingBag,
      subItems: [
        { name: 'محصولات غذایی شیخ', href: '/products', icon: Beef },
        { name: 'شیخ دیجیتال', href: '/sheikh-digital', icon: Sparkles },
        { name: 'لوازم خانگی شیخ', href: '/sheikh-home', icon: Sparkles },
        { name: 'شیخ نوا', href: '/tech-products', icon: Cpu },
      ]
    },
    { name: 'سفارش‌های من', href: '/account/orders', icon: Package },
    { name: 'درباره ما',    href: '/about-us',  icon: Users },
    { name: 'مقالات',    href: '/article',   icon: FileText },
    { name: 'سوالات متداول',         href: '/faq',       icon: HelpCircle },
    { name: 'همکاری در فروش',   href: '/affiliate', icon: Handshake },
    { name: 'حریم خصوصی',     href: '/privacy',   icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >

          {/* PREMIUM IOS-STYLE DARK/BLUR OVERLAY (Backdrop click closes menu) */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Ambient gold glow 1 */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
            {/* Ambient gold glow 2 */}
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
            {/* Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] pointer-events-none" />
            {/* CSS Noise Overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
              }}
            />
          </motion.div>

          {/* FLOATING LUXURY CONTAINER (Swipe-to-close & click propagation stopped) */}
          <motion.div
            ref={menuRef}
            dir="rtl"
            className={cn(
              "relative w-full max-w-md h-[calc(100vh-2rem)] rounded-[32px] overflow-hidden select-none touch-none",
              "bg-gradient-to-b from-[#1b110b]/95 via-[#231710]/95 to-[#150c07]/98",
              "border border-amber-500/20 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9)]",
              "flex flex-col text-amber-100/90 z-10"
            )}
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) {
                setMobileMenuOpen(false);
              }
            }}
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26
            }}
          >
            {/* GPU-Accelerated Golden Breathing Glow - Zero Visual Regression */}
            <div className="absolute inset-0 rounded-[32px] border border-amber-500/25 pointer-events-none z-0 animate-pulse-glow" style={{ animationDuration: '4s' }} />

            {/* Visual Drag Handle Indicator for Native App Vibe */}
            <div className="w-12 h-1 bg-amber-500/30 rounded-full mx-auto mt-3 flex-shrink-0 relative z-10" />

            {/* Close Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              className={cn(
                "absolute top-5 left-5 z-50 w-10 h-10 rounded-full",
                "bg-stone-900/40 border border-amber-500/20",
                "flex items-center justify-center text-amber-200/80 hover:text-amber-100",
                "hover:bg-amber-950/40 hover:border-amber-500/40 transition-all duration-300"
              )}
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* Background Branding Crown Watermark */}
            <div className="absolute inset-x-0 top-32 flex items-center justify-center opacity-[0.02] pointer-events-none">
              <Crown className="w-80 h-80 text-amber-400" />
            </div>

            {/* BRAND HEADER */}
            <div className="flex flex-col items-center pt-5 pb-3 px-6 relative flex-shrink-0">
              <div className="relative mb-2">
                <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                <div className="absolute inset-0 blur-lg bg-amber-400/40 animate-pulse" />
              </div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-200 bg-clip-text text-transparent select-none tracking-wide">
                فروشگاه شیخ
              </h1>
              <p className="text-[11px] text-amber-400/60 mt-1 font-medium tracking-normal text-center">
                فروشگاهی برای محصولات خاص و تجربه‌ای متفاوت
              </p>
            </div>

            {/* NAVIGATION SCROLL AREA (Restored native scroll for content overflow) */}
            <nav className="flex-1 overflow-y-auto px-5 py-2 scrollbar-thin scrollbar-thumb-amber-900/30 touch-pan-y">
              <div className="space-y-3">
                {mobileNavigation.map((item, index) => {
                  const Icon = item.icon;
                  const isExpanded = expandedItem === item.name;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const active = isActive(item.href, item.subItems);

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }} // 50ms stagger delay
                      className="relative"
                    >
                      {hasSubItems ? (
                        <div
                          onClick={() => handleParentClick(item.name)}
                          className={cn(
                            'group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer border',
                            active
                              ? 'bg-gradient-to-l from-amber-950/40 to-amber-900/20 border-amber-500/30 text-white shadow-[0_4px_20px_rgba(245,158,11,0.05)]'
                              : 'bg-stone-900/20 hover:bg-amber-950/20 border-amber-950/30 hover:border-amber-900/40 text-amber-200/80 hover:text-white'
                          )}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                              active ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800/40 text-amber-400/75 group-hover:bg-amber-900/30 group-hover:text-amber-300'
                            )}>
                              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <span className={cn('font-semibold text-base tracking-wide', active ? 'text-amber-200 font-bold' : 'text-amber-200/90 group-hover:text-white')}>
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {active && <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.25 }}
                              className="text-amber-400/60 group-hover:text-amber-300"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'group relative flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 border',
                            active
                              ? 'bg-gradient-to-l from-amber-500/20 via-amber-600/10 to-transparent border-amber-500/40 text-white shadow-[0_4px_20px_rgba(245,158,11,0.08)]'
                              : 'bg-stone-900/20 hover:bg-amber-950/20 border-amber-950/30 hover:border-amber-900/40 text-amber-200/80 hover:text-white'
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                              active ? 'bg-amber-500/35 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]' : 'bg-stone-800/40 text-amber-400/75 group-hover:bg-amber-900/30 group-hover:text-amber-300'
                            )}>
                              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <span className={cn('font-semibold text-base tracking-wide', active ? 'text-white font-bold' : 'text-amber-200/90 group-hover:text-white')}>
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {item.href === '/account/orders' && orderCount !== null && orderCount > 0 && (
                              <span className="bg-amber-500/20 text-amber-300 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-500/30">
                                {orderCount}
                              </span>
                            )}
                            {active && (
                              <>
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                              </>
                            )}
                          </div>
                        </Link>
                      )}

                      {/* SUBMENU WITH HIGH-PERFORMANCE CSS GRID TRANSITION */}
                      <div
                        className={cn(
                          "grid transition-all duration-300 ease-in-out relative mt-1.5 ms-6 border-r border-amber-500/20 pr-4",
                          isExpanded ? "grid-rows-[1fr] opacity-100 mb-1.5" : "grid-rows-[0fr] opacity-0"
                        )}
                      >
                        <div className="overflow-hidden space-y-1.5 relative">
                          {/* Decorative Tree branch lines */}
                          <div className="absolute right-0 top-0 bottom-4 w-[1px] bg-gradient-to-b from-amber-500/25 to-transparent pointer-events-none" />

                          {item.subItems?.map((subItem, subIndex) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = isActive(subItem.href);
                            return (
                              <div
                                key={subItem.name}
                                className="relative"
                              >
                                {/* Horizontal connector node */}
                                <div className="absolute right-[-16px] top-[24px] w-4 h-[1px] bg-amber-500/20" />

                                <Link
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    'group relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 border',
                                    isSubActive
                                      ? 'bg-gradient-to-l from-amber-500/15 via-amber-600/5 to-transparent border-amber-500/30 text-white shadow-md shadow-amber-500/5'
                                      : 'bg-stone-900/10 hover:bg-amber-950/10 border-transparent hover:border-amber-950/20 text-amber-300/70 hover:text-white'
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300',
                                      isSubActive ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800/30 text-amber-400/50 group-hover:bg-amber-900/20 group-hover:text-amber-300'
                                    )}>
                                      <SubIcon className="w-4 h-4" />
                                    </div>
                                    <span className={cn('text-sm font-medium tracking-wide', isSubActive ? 'text-amber-200 font-semibold' : 'text-amber-300/80 group-hover:text-white')}>
                                      {subItem.name}
                                    </span>
                                  </div>
                                  {isSubActive && <Crown className="w-3 h-3 text-amber-400" />}
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            {/* PREMIUM FOOTER */}
            <div className="p-5 relative bg-[#130904]/90 border-t border-amber-500/10 flex-shrink-0">
              <div className="space-y-4">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <motion.button
                        className={cn(
                          "w-full py-3 px-4 rounded-xl font-bold text-sm text-white",
                          "bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500",
                          "shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.4)]",
                          "relative overflow-hidden group flex items-center justify-center gap-1.5"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        ثبت نام
                      </motion.button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                      <motion.button
                        className={cn(
                          "w-full py-3 px-4 rounded-xl font-semibold text-sm",
                          "bg-stone-900/60 border border-amber-500/20 text-amber-100",
                          "hover:bg-amber-950/30 hover:border-amber-500/40 transition-colors"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ورود
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-900/30 border border-amber-500/10">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-300">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-amber-200 truncate max-w-[120px]">
                          {user.name || user.email || 'کاربر گرامی'}
                        </span>
                      </div>
                      <span className="text-[10px] bg-amber-500/15 text-amber-400 font-bold px-2 py-0.5 rounded-md">
                        عضو طلایی
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/account/orders" onClick={() => setMobileMenuOpen(false)} className="w-full">
                        <motion.button
                          className={cn(
                            "w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5",
                            "bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 transition-all duration-300"
                          )}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Package className="w-3.5 h-3.5 text-amber-400" />
                          <span>سفارش‌های من</span>
                          {orderCount !== null && orderCount > 0 && (
                            <span className="bg-amber-400 text-black font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                              {orderCount}
                            </span>
                          )}
                        </motion.button>
                      </Link>

                      <motion.button
                        onClick={onLogout}
                        className={cn(
                          "w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5",
                          "bg-red-950/20 border border-red-900/30 text-red-300 hover:bg-red-900/20 transition-all duration-300"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج</span>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Bottom Meta & Copyright */}
                <div className="pt-2 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full text-[11px] text-amber-500/40 border-t border-amber-500/5 pt-3">
                    <span>تمامی حقوق مادی و معنوی محفوظ است</span>
                    <span className="bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                      نسخه ۲.۴.۰
                    </span>
                  </div>
                  <span className="text-[9px] text-amber-500/25 mt-1">
                    فروشگاه شیخ © ۱۴۰۳
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
