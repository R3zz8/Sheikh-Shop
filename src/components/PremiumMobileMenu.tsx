'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ShoppingBag, 
  Users, 
  FileText, 
  Crown,
  Sparkles,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface PremiumMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onLogout?: () => void;
}

const navigation: NavigationItem[] = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    description: 'Discover luxury at its finest'
  },
  { 
    name: 'Products', 
    href: '/products', 
    icon: ShoppingBag,
    description: 'Curated premium collections'
  },
  { 
    name: 'About Us', 
    href: '/about-us', 
    icon: Users,
    description: 'Our story of excellence'
  },
  { 
    name: 'Article', 
    href: '/article', 
    icon: FileText,
    description: 'Insights and inspiration'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.3,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export default function PremiumMobileMenu({ 
  isOpen, 
  onClose, 
  user, 
  onLogout 
}: PremiumMobileMenuProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = '';
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] lg:hidden isolate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Solid Background Base (ensures full coverage even during fade-in) */}
          <div className="absolute inset-0 bg-black opacity-100 z-20" />

          {/* Luxury Opaque Gradient Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 opacity-100 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Brand watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 z-30">
              <Crown className="w-96 h-96 text-amber-500/20" />
            </div>
          </motion.div>

          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-amber-800/80 border border-amber-600/50 flex items-center justify-center text-white hover:bg-amber-700/90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Main Content */}
          <div className="relative z-50 flex flex-col h-full">
            {/* Header */}
            <motion.div
              className="flex items-center justify-center pt-20 pb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Crown className="w-8 h-8 text-amber-300" />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                    Sheikh Shop
                  </h1>
                </div>
                <p className="text-gray-400 text-sm font-light">
                  Luxury Redefined
                </p>
              </div>
            </motion.div>

            {/* Navigation Items */}
            <motion.nav
              className="flex-1 flex flex-col justify-center px-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="space-y-6">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'group relative flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-500',
                          'min-h-[60px] touch-manipulation',
                          active
                            ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-orange-500/20 text-amber-200 border border-amber-300/30 shadow-lg shadow-amber-500/10'
                            : 'text-gray-300 hover:text-amber-200 hover:bg-white/5 border border-transparent hover:border-white/10',
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500',
                          active
                            ? 'bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-500/25'
                            : 'bg-white/10 group-hover:bg-white/20',
                        )}>
                          <Icon className={cn(
                            'w-6 h-6 transition-all duration-500',
                            active ? 'text-white' : 'text-gray-400 group-hover:text-amber-300',
                          )} />
                          
                          {/* Active glow effect */}
                          {active && (
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/50 to-orange-400/50"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1">
                          <h3 className={cn(
                            'text-lg font-semibold transition-all duration-500',
                            active ? 'text-amber-200' : 'text-white group-hover:text-amber-200',
                          )}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className={cn(
                              'text-sm font-light transition-all duration-500 mt-1',
                              active ? 'text-amber-300/80' : 'text-gray-400 group-hover:text-gray-300',
                            )}>
                              {item.description}
                            </p>
                          )}
                        </div>

                        {/* Active indicator */}
                        {active && (
                          <motion.div
                            className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-lg shadow-amber-500/50"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                          />
                        )}

                        {/* Hover glow */}
                        <div className={cn(
                          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
                          'bg-gradient-to-r from-amber-500/10 via-yellow-500/8 to-orange-500/10',
                          'group-hover:opacity-100',
                        )} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>

            {/* Call-to-Action Buttons */}
            <motion.div
              className="px-8 pb-12 pt-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="space-y-4">
                {!user ? (
                  <>
                    {/* Sign In Button */}
                    <motion.div variants={buttonVariants}>
                      <Link href="/login" onClick={onClose}>
                        <motion.button
                          className="w-full px-6 py-4 rounded-2xl border border-amber-600/50 bg-amber-800/30 text-white font-medium transition-all duration-500 hover:bg-amber-700/40 hover:border-amber-500/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent"
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          Sign In
                        </motion.button>
                      </Link>
                    </motion.div>

                    {/* Get Started Button */}
                    <motion.div variants={buttonVariants}>
                      <Link href="/register" onClick={onClose}>
                        <motion.button
                          className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-transparent relative overflow-hidden group"
                          whileHover="hover"
                          whileTap="tap"
                          variants={buttonVariants}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          
                          {/* Content */}
                          <span className="relative flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Get Started
                          </span>
                        </motion.button>
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={buttonVariants}>
                    <motion.button
                      onClick={onLogout}
                      className="w-full px-6 py-4 rounded-2xl border border-red-500/50 bg-red-800/30 text-red-300 font-medium transition-all duration-500 hover:bg-red-700/40 hover:border-red-400/70 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-transparent"
                      whileHover="hover"
                      whileTap="tap"
                      variants={buttonVariants}
                    >
                      Sign Out
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
