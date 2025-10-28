'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  UserRound, 
  FileText, 
  ShoppingBag, 
  Home, 
  ArrowUp 
} from 'lucide-react';

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MobileFooter() {
  const pathname = usePathname();

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navItems = [
    { icon: UserRound, href: '/login', label: 'Profile' },
    { icon: FileText, href: '/article', label: 'Articles' },
    // وسط خالی — اینجا فقط placeholder هست
    null,
    { icon: Home, href: '/', label: 'Home' },
    { icon: ArrowUp, label: 'Top', onClick: scrollToTop },
  ];

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-1">
      <div className="relative w-full">
        {/* نوار اصلی */}
        <div className="relative rounded-3xl bg-gradient-to-t from-amber-100/95 to-amber-50/90 backdrop-blur-md border border-amber-300/40 shadow-xl overflow-hidden h-20">
          
          {/* بریدگی شفاف */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 pointer-events-none">
            <div className="absolute inset-0 bg-transparent" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_-12px_20px_rgba(139,69,19,0.3)]" />
          </div>

          {/* ۵ ستون: Profile | Articles | خالی | Home | Top */}
          <div className="grid grid-cols-5 gap-1 px-3 pt-3 pb-1 h-full">
            {navItems.map((item, index) => {
              // وسط (index === 2) رو خالی می‌ذاریم
              if (index === 2) {
                return <div key="center" className="h-full" />;
              }

              const Icon = item!.icon;
              const isActive = item!.href && (pathname === item!.href || (item!.href === '/article' && pathname.startsWith('/article')));
              const isTop = !!item!.onClick;

              return (
                <div key={index} className="flex flex-col items-center justify-end gap-0.5 pb-1">
                  {isTop ? (
                    <button onClick={item!.onClick} className="flex flex-col items-center w-full cursor-pointer">
                      <Icon className="w-6 h-6 text-amber-700/90 transition-all" />
                      <span className="text-[10px] font-bold text-amber-700/85">{item!.label}</span>
                    </button>
                  ) : (
                    <Link href={item!.href!} className="flex flex-col items-center w-full">
                      <Icon
                        className={cx(
                          'w-6 h-6 transition-all duration-200',
                          isActive ? 'text-amber-800 scale-110 drop-shadow-lg' : 'text-amber-700/90'
                        )}
                      />
                      <span className={cx('text-[10px] font-bold tracking-wide', isActive ? 'text-amber-800' : 'text-amber-700/85')}>
                        {item!.label}
                      </span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* دکمه وسط - دقیقاً بالای ستون وسط */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <Link href="/products" aria-label="Products">
            <motion.div
              whileTap={{ scale: 0.94 }}
              className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-800 via-amber-900 to-orange-900 shadow-2xl border-4 border-amber-100 ring-6 ring-amber-700/40 backdrop-blur-sm"
            >
              <ShoppingBag className="w-11 h-11 text-amber-50 drop-shadow-xl font-bold" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-amber-100 shadow-lg animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-amber-100 shadow-lg" />
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}