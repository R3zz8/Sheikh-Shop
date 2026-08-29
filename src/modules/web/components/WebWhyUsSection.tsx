'use client';

import React from 'react';
import { Zap, Palette, Smartphone, ShieldCheck, Rocket, Cpu, Cloud, Wrench, Sparkles } from 'lucide-react';

const advantages = [
  {
    icon: Zap,
    title: 'سرعت و Performance فوق‌العاده',
    description: 'توسعه بر پایه معماری Next.js 16 App Router و بهینه‌سازی کدهای SSR/SSG جهت بارگذاری زیر ۱ ثانیه و امتیاز بالاتر از ۹۰ در گوگل PageSpeed.',
  },
  {
    icon: Palette,
    title: 'طراحی UI/UX اختصاصی',
    description: 'طراحی گرافیکی منحصر به فرد در Figma بدون استفاده از قالب‌های آماده سنگی و کپی‌شده، منطبق با هویت لوکس و تجاری برند شما.',
  },
  {
    icon: Smartphone,
    title: 'معماری Mobile-First',
    description: 'واکنش‌گرایی ۱۰۰٪ دقیق و تست‌شده روی ابعاد مختلف موبایل، تبلت و دسکتاپ با تجربه‌ای مشابه اپلیکیشن‌های بومی.',
  },
  {
    icon: ShieldCheck,
    title: 'امنیت لایه بنکداری',
    description: 'محافظت پیشرفته در برابر حملات XSS، CSRF، SQL Injection، محدودکننده درخواست (Rate Limiting) و رمزنگاری توکن‌های امنیتی JWT.',
  },
  {
    icon: Rocket,
    title: 'سئو فنی (Technical SEO)',
    description: 'ساختار استاندارد Semantic HTML، متاتگ‌های هوشمند شبکه اجتماعی، نقشه سایت XML خودکار و اسکیمای ساختاریافته Google JSON-LD.',
  },
  {
    icon: Cpu,
    title: 'توسعه یکپارچه Full-Stack',
    description: 'طراحی همزمان فرانت‌اند مدرن، بک‌اند قدرتمند API Routes، دیتابیس بهینه‌سازی‌شده PostgreSQL و ابزارهای ارتباطی بدون واسطه.',
  },
  {
    icon: Cloud,
    title: 'زیرساخت ابری مدرن',
    description: 'اتصال به سیستم‌های مدیریت رسانه Cloudinary، کشینگ توزیع‌شده Redis، فشرده‌سازی خودکار تصاویر WebP/AVIF و پایداری بالا.',
  },
  {
    icon: Wrench,
    title: 'استقرار و پشتیبانی مداوم',
    description: 'استقرار حرفه‌ای روی سرورهای ابری، تست‌های خودکار قبل از انتشار و پشتیبانی فنی شش ماهه الی یک‌ساله تضمین‌شده.',
  },
];

export default function WebWhyUsSection() {
  return (
    <section className="py-16 md:py-24 bg-stone-900 font-vazirmatn text-right relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>مزایای فنی و تمایز رقابتی</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            چرا کسب‌وکارهای جدی شیخ وب را انتخاب می‌کنند؟
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg leading-relaxed">
            ما فقط وب‌سایت نمی‌سازیم؛ محصول دیجیتال کامل و مقیاس‌پذیر خلق می‌کنیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <div
                key={idx}
                className="bg-stone-950/80 border border-stone-800 hover:border-amber-500/40 rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:translate-y-[-4px] shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-amber-300 transition-colors">
                    {adv.title}
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed font-normal">
                    {adv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
