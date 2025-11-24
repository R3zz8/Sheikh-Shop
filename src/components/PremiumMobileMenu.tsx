'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ShoppingBag, Users, FileText, 
  HelpCircle, Handshake, Shield, 
  Crown, Sparkles, X, LogOut,
  ChevronDown,
  // --- ADDED: Icons for sub-menu items as per review feedback ---
  Beef,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- MODIFIED: Sub-item type now includes an icon ---
interface SubMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  subItems?: SubMenuItem[];
}

interface PremiumMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onLogout?: () => void;
}

export default function PremiumMobileMenu({ 
  isOpen, 
  onClose, 
  user, 
  onLogout 
}: PremiumMobileMenuProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (pathname.startsWith('/products') || pathname.startsWith('/tech_products')) {
        setExpandedItem('Products');
      } else {
        setExpandedItem(null);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [isOpen, pathname]);

  // --- REFACTORED: `isActive` logic is now dynamic for parent items ---
  const isActive = (href: string, subItems?: SubMenuItem[]) => {
    if (subItems && subItems.length > 0) {
      // A parent is active if any of its children are active
      return subItems.some(sub => pathname.startsWith(sub.href));
    }
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleParentClick = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  if (!isVisible) return null;

  const mobileNavigation: NavigationItem[] = [
    { name: 'Home',        href: '/',          icon: Home },
    {
      name: 'Products',
      href: '/products',
      icon: ShoppingBag,
      subItems: [
        // --- MODIFIED: Sub-items now have icons ---
        { name: 'Sheikh Food', href: '/products', icon: Beef },
        { name: 'Sheikh Tech', href: '/tech_products', icon: Cpu },
      ]
    },
    { name: 'About Us',    href: '/about-us',  icon: Users },
    { name: 'Articles',    href: '/article',   icon: FileText },
    // --- FIXED: Restored original item order ---
    { name: 'FAQ',         href: '/faq',       icon: HelpCircle },
    { name: 'Affiliate',   href: '/affiliate', icon: Handshake },
    { name: 'Privacy',     href: '/privacy',   icon: Shield },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 lg:hidden mobile-menu-overlay"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#3d2b1f] via-[#4a3728] to-[#3d2b1f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/10 via-transparent to-amber-900/10" />
          <div className="absolute inset-0 flex items-center justify-center opacity-8 pointer-events-none">
            <Crown className="w-[420px] h-[420px] text-amber-600/40 animate-pulse-slow" />
          </div>
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-[#4a3728] border border-amber-600 flex items-center justify-center text-amber-200 hover:bg-[#5a4535]"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>
          <div className="relative z-10 flex flex-col h-full text-amber-100">
            <motion.div className="flex flex-col items-center pt-16 pb-10">
              <div className="relative mb-3">
                <Crown className="w-12 h-12 text-amber-400" />
                <div className="absolute inset-0 blur-xl bg-amber-400 opacity-60 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 bg-clip-text text-transparent">
                Sheikh Shop
              </h1>
              <p className="text-amber-300 text-sm mt-1 font-light">Luxury Redefined</p>
            </motion.div>
            <nav className="flex-1 px-6 overflow-y-auto pb-40">
              <div className="space-y-5">
                {mobileNavigation.map((item, index) => {
                  const Icon = item.icon;
                  const isExpanded = expandedItem === item.name;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  // --- MODIFIED: Pass subItems to isActive for dynamic check ---
                  const active = isActive(item.href, item.subItems);

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      {hasSubItems ? (
                        <div
                          onClick={() => handleParentClick(item.name)}
                          className={cn(
                            'group relative flex items-center gap-4 px-5 py-5 rounded-2xl transition-all duration-500 overflow-hidden cursor-pointer',
                            active
                              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/40'
                              : 'text-amber-100 hover:text-white'
                          )}
                          aria-expanded={isExpanded}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', active ? 'bg-white/20' : 'bg-amber-800/30 group-hover:bg-amber-700/40')}>
                            <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-amber-300 group-hover:text-amber-100')} />
                          </div>
                          <h3 className={cn('font-semibold text-lg', active ? 'text-white' : 'group-hover:text-white')}>
                            {item.name}
                          </h3>
                          <motion.div
                            className="ml-auto"
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </motion.div>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            'group relative flex items-center gap-4 px-5 py-5 rounded-2xl transition-all duration-500 overflow-hidden',
                            active
                              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/40'
                              : 'text-amber-100 hover:text-white'
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', active ? 'bg-white/20' : 'bg-amber-800/30 group-hover:bg-amber-700/40')}>
                            <Icon className={cn('w-5 h-5', active ? 'text-white' : 'text-amber-300 group-hover:text-amber-100')} />
                          </div>
                          <h3 className={cn('font-semibold text-lg', active ? 'text-white' : 'group-hover:text-white')}>
                            {item.name}
                          </h3>
                          {active && <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse ml-auto" />}
                        </Link>
                      )}

                      <AnimatePresence>
                        {isExpanded && hasSubItems && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="pl-4 mt-1 space-y-1"
                          >
                            {/* --- REFACTORED: Sub-items now use the exact same styling as parent items --- */}
                            {item.subItems?.map((subItem, subIndex) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = isActive(subItem.href);
                              return (
                                <motion.div
                                  key={subItem.name}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIndex * 0.05, duration: 0.3 }}
                                >
                                  <Link
                                    href={subItem.href}
                                    onClick={onClose}
                                    className={cn(
                                      'group relative flex items-center gap-4 px-5 py-5 rounded-2xl transition-all duration-500 overflow-hidden',
                                      isSubActive
                                        ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                                        : 'text-amber-100 hover:text-white'
                                    )}
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                                    <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', isSubActive ? 'bg-white/20' : 'bg-amber-800/30 group-hover:bg-amber-700/40')}>
                                      <SubIcon className={cn('w-5 h-5', isSubActive ? 'text-white' : 'text-amber-300 group-hover:text-amber-100')} />
                                    </div>
                                    <h3 className={cn('font-semibold text-lg', isSubActive ? 'text-white' : 'group-hover:text-white')}>
                                      {subItem.name}
                                    </h3>
                                    {isSubActive && <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse ml-auto" />}
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </nav>

            <div className="px-6 pb-12 pt-8 space-y-4">
              {!user ? (
                <>
                  <Link href="/register" onClick={onClose}>
                    <motion.button className="w-full px-6 py-5 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 relative overflow-hidden group" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                        Register
                      </span>
                    </motion.button>
                  </Link>
                  <Link href="/login" onClick={onClose}>
                    <motion.button className="w-full px-6 py-5 rounded-2xl bg-amber-800/50 border border-amber-600 text-amber-100 font-medium hover:bg-amber-700/50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Login
                    </motion.button>
                  </Link>
                </>
              ) : (
                <motion.button onClick={onLogout} className="w-full px-6 py-5 rounded-2xl bg-red-900/50 border border-red-600 text-red-300 font-medium hover:bg-red-800/50 flex items-center justify-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
