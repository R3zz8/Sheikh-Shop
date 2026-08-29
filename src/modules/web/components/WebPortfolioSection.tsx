'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, FolderGit2, Sparkles, Code2 } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  technologies: string[];
  projectUrl?: string | null;
  category?: string | null;
}

interface WebPortfolioSectionProps {
  items: PortfolioItem[];
}

export default function WebPortfolioSection({ items }: WebPortfolioSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-stone-900 font-vazirmatn text-right relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <span>نمونه کارهای گزیده</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            پروژه‌ها و پلتفرم‌های پیاده‌سازی شده
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg leading-relaxed">
            نمایش کیفیت، سرعت و خلاقیت بکار رفته در پروژه‌های مشتریان شیخ وب
          </p>
        </div>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 shadow-xl group flex flex-col justify-between"
              >
                <div>
                  {/* Portfolio Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.category && (
                      <span className="absolute top-4 right-4 bg-stone-950/80 border border-amber-500/30 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 text-xs font-semibold">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-stone-400 text-xs leading-relaxed mb-4">
                        {item.description}
                      </p>
                    )}

                    {item.technologies && item.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.technologies.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-amber-200/80 text-[11px] font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {item.projectUrl && (
                  <div className="px-6 pb-6 pt-0">
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <span>مشاهده زنده پروژه</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Fallback */
          <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">نمونه‌کارهای اختصاصی و محرمانه</h3>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed mb-6">
              به دلیل توافق‌نامه‌های عدم افشا (NDA) با برندهای تجاری و هلدینگ‌های طرف قرارداد، برخی پروژه‌ها در نمایشگاه عمومی وب‌سایت قرار داده نشده‌اند. نمونه‌کارهای زنده در جلسات آنلاین و حضوری مشاوره ارائه می‌گردند.
            </p>
            <a href="#calculator" className="inline-block">
              <button className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors">
                درخواست جلسه آنلاین و مشاهده نمونه‌کارها
              </button>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
