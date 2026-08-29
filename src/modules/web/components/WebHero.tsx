'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ArrowDown, Code2, ShieldCheck, Zap } from 'lucide-react';

export default function WebHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-stone-950 font-vazirmatn text-right">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-600/15 via-orange-500/10 to-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>شیخ وب ✦ دپارتمان تخصصی توسعه نرم‌افزار و طراحی وب</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-white leading-tight tracking-tight mb-6">
            <span className="block text-amber-400 mb-2">شیخ وب</span>
            <span className="bg-gradient-to-r from-amber-100 via-stone-100 to-amber-200 bg-clip-text text-transparent">
              وب‌سایتی بساز که فقط دیده نشود؛
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              برای کسب‌وکارت نتیجه بسازد.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-stone-300 text-base sm:text-xl md:text-2xl leading-relaxed mb-10 font-normal max-w-3xl mx-auto">
            طراحی و توسعه وب‌سایت‌های سریع، اختصاصی و حرفه‌ای با معماری Full-Stack برای کسب‌وکارهایی که می‌خواهند جدی‌تر دیده شوند.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-16">
            <a href="#services" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-h-[54px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-stone-950 font-bold text-base shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2 group">
                <span>مشاهده خدمات</span>
                <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
              </button>
            </a>

            <a href="#calculator" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto min-h-[54px] px-8 py-3.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/30 text-amber-200 font-bold text-base shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                <span>دریافت مشاوره رایگان</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              </button>
            </a>
          </div>

          {/* Feature Highlights Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 border-t border-amber-500/15">
            <div className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/80 backdrop-blur-md">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-stone-300 text-xs sm:text-sm font-semibold">سرعت فوق‌العاده با Next.js 16</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/80 backdrop-blur-md">
              <Code2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-stone-300 text-xs sm:text-sm font-semibold">کدنویسی ۱۰۰٪ اختصاصی و تمیز</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-stone-900/50 border border-stone-800/80 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-stone-300 text-xs sm:text-sm font-semibold">امنیت بالا و مالکیت تام کامل</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
