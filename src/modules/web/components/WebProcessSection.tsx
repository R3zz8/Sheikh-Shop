'use client';

import React from 'react';
import { Layers, Sparkles } from 'lucide-react';

const steps = [
  { step: '01', title: 'تحلیل نیازمندی', desc: 'شناخت دقیق اهداف تجاری، پرسونای مخاطب و تحلیل رقبا' },
  { step: '02', title: 'طراحی UI/UX', desc: 'خلق پروتوتایپ گرافیکی و هویت بصری لوکس کاربرپسند' },
  { step: '03', title: 'توسعه Frontend', desc: 'کدنویسی کامپوننت‌های واکنش‌گرا با Next.js و Tailwind' },
  { step: '04', title: 'توسعه Backend', desc: 'طراحی منطق تجاری ایمن و مدیریت نشست‌ها و کاربران' },
  { step: '05', title: 'Database & APIs', desc: 'مدل‌سازی پایگاه داده PostgreSQL و APIهای REST/GraphQL' },
  { step: '06', title: 'Testing', desc: 'تست‌های واحد، عملکردی و یکپارچگی روی تمام مرورگرها' },
  { step: '07', title: 'Performance & Security', desc: 'بهینه‌سازی سرعت زیر ۱ ثانیه و ارزیابی لایه‌های امنیتی' },
  { step: '08', title: 'Deployment', desc: 'استقرار روی سرور ابری اختصاصی، دامنه و گواهی SSL' },
  { step: '09', title: 'Support', desc: 'آموزش پنل مدیریت، پشتیبانی تکنیکال و به‌روزرسانی مداوم' },
];

export default function WebProcessSection() {
  return (
    <section className="py-16 md:py-24 bg-stone-950 font-vazirmatn text-right relative z-10 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>مسیر شفاف اجرای پروژه</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            فرآیند ساخت و تحویل پروژه در شیخ وب
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg leading-relaxed">
            گام‌های استاندارد و مهندسی‌شده ازایده تا تحویل نهایی پلتفرم دیجیتال
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-stone-900/80 border border-stone-800 hover:border-amber-500/30 rounded-2xl p-6 transition-all duration-300 flex items-start gap-4 shadow-lg group"
            >
              <span className="text-2xl font-black text-amber-400/80 group-hover:text-amber-300 transition-colors font-mono shrink-0">
                {s.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-amber-200 transition-colors">
                  {s.title}
                </h3>
                <p className="text-stone-400 text-xs leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
