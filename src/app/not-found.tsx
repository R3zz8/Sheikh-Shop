'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-[#F3EAD8] to-[#FAF7F2] text-[#2C1A11] flex flex-col items-center justify-center relative overflow-y-auto px-4 pt-12 pb-36 md:py-24" dir="rtl">
      {/* Decorative luxury lighting glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.06)_0%,transparent_70%)] rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)] rounded-full blur-[90px]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw-trail {
          0% {
            stroke-dashoffset: 400;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          40% {
            stroke-dashoffset: 160;
            opacity: 0.8;
          }
          80%, 100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-trail {
            animation: none !important;
            stroke-dashoffset: 180 !important;
            opacity: 0.6 !important;
          }
          .animate-pulse-soft {
            animation: none !important;
            transform: none !important;
          }
        }
      `}} />

      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center px-4">

        {/* Visual focal point: 404 + animated golden path */}
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 select-none mb-4">
          {/* Subtle breathing background halo */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-transparent to-transparent blur-3xl rounded-full animate-pulse-soft" style={{ animation: 'pulse-soft 6s ease-in-out infinite' }} />

          {/* Golden winding path trail */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Winding lost navigation path */}
            <path
              d="M 20 100 C 20 40, 90 20, 100 20 C 150 20, 180 70, 180 100 C 180 140, 130, 180, 100, 180 C 60 180, 20, 130, 50, 100 C 65, 85, 100, 80, 110, 100 C 115, 110, 105, 120, 100, 120"
              stroke="#d97706"
              strokeWidth="1.2"
              strokeOpacity="0.08"
              strokeLinecap="round"
            />
            {/* Animated glowing path trail that ends at 404 and fades */}
            <path
              className="animate-trail"
              d="M 20 100 C 20 40, 90 20, 100 20 C 150 20, 180 70, 180 100 C 180 140, 130, 180, 100, 180 C 60 180, 20, 130, 50, 100 C 65, 85, 100, 80, 110, 100 C 115, 110, 105, 120, 100, 120"
              stroke="url(#goldTrailGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset="400"
              style={{
                animation: 'draw-trail 8s cubic-bezier(0.25, 1, 0.5, 1) infinite',
              }}
            />
            <defs>
              <linearGradient id="goldTrailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0" />
                <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Sophisticated 404 Number */}
          <h1 className="text-[7rem] sm:text-[8.5rem] font-black tracking-widest leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#451a03] via-[#78350f] to-[#451a03] drop-shadow-[0_4px_12px_rgba(217,119,6,0.15)] select-none z-10 font-sans" aria-label="خطای ۴۰۴">
            404
          </h1>
        </div>

        {/* Message Container inside elegant floating glassmorphic panel */}
        <div className="bg-[#FAF6EE]/75 backdrop-blur-md border border-amber-500/15 rounded-[2rem] p-6 sm:p-10 shadow-[0_20px_50px_rgba(42,26,18,0.08)] mb-8 w-full max-w-lg transition-transform hover:scale-[1.01] duration-300">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-amber-600 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="text-xs font-bold text-amber-700 tracking-wider uppercase">راه گم شده</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C1A11] mb-4 leading-normal">
            صفحه‌ای که دنبالش بودید پیدا نشد
          </h2>

          <p className="text-[#5D4037] text-sm sm:text-base leading-relaxed font-medium">
            به نظر می‌رسد این مسیر دیگر در فروشگاه شیخ وجود ندارد یا آدرس آن تغییر کرده است.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto btn-primary whitespace-nowrap font-black text-sm flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 transition-all duration-300 shadow-[0_6px_20px_rgba(217,119,6,0.18)] hover:scale-105 active:scale-98 cursor-pointer">
              <Home className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </button>
          </Link>

          <Link href="/products" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto btn-secondary whitespace-nowrap font-bold text-sm flex items-center justify-center gap-2 rounded-xl py-3.5 px-8 transition-all duration-300 hover:scale-105 active:scale-98 border border-amber-500/20 text-[#2C1A11] bg-white/40 backdrop-blur-sm cursor-pointer">
              <ShoppingBag className="w-4 h-4 text-amber-700" />
              <span>مشاهده محصولات</span>
            </button>
          </Link>
        </div>

        {/* Delicate Footer Note */}
        <p className="text-[11px] text-amber-800/60 font-bold mt-12 tracking-wide flex items-center gap-1 select-none">
          <span>شکوه اصالت شرقی</span>
          <span>•</span>
          <span>فروشگاه شیخ</span>
        </p>

      </div>
    </div>
  );
}
