'use client';

import React from 'react';
import Link from 'next/link';

export default function SheikhNicotineEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center" dir="rtl">
      <div className="w-20 h-20 mb-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl shadow-[0_0_30px_rgba(245,158,11,0.15)]">
        💨
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">محصولی در بخش شیخ نیکوتین یافت نشد</h2>
      <p className="text-gray-400 text-sm max-w-md mb-8 leading-relaxed">
        به زودی برترین و لوکس‌ترین دستگاه‌های پاد سیستم، ویپ‌ها و ای-لیکوئیدهای ممتاز در دسته‌بندی شیخ نیکوتین قرار خواهند گرفت.
      </p>
      <Link
        href="/products"
        className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition-all duration-300"
      >
        مشاهده سایر محصولات فروشگاه
      </Link>
    </div>
  );
}
