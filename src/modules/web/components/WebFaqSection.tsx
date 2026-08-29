'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
}

interface WebFaqSectionProps {
  faqs: FaqItem[];
}

export default function WebFaqSection({ faqs }: WebFaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-16 md:py-24 bg-stone-950 font-vazirmatn text-right relative z-10 border-t border-stone-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>پاسخ شفاف به دغدغه‌های شما</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
            سوالات متداول سفارش وب‌سایت
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            پاسخ به مهم‌ترین پرسش‌های کارفرمایان درباره زمان، هزینه، مالکیت و پشتیبانی سایت
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                    : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-amber-300 transition-colors"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-amber-500/20 text-amber-400' : 'text-stone-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-0 text-stone-300 text-xs sm:text-sm leading-relaxed border-t border-stone-800/60 mt-1 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
