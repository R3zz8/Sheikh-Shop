import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { getWebDesignShowcase, type WebDesignShowcaseItem } from '@/lib/services/getWebDesignShowcase';

interface WebDesignServiceCardProps {
  initialData?: WebDesignShowcaseItem | null;
}

export default async function WebDesignServiceCard({ initialData }: WebDesignServiceCardProps) {
  const showcase = initialData !== undefined ? initialData : await getWebDesignShowcase();

  // If explicit isEnabled boolean is set to false, gracefully return null
  if (showcase && showcase.isEnabled === false) {
    return null;
  }

  const title = showcase?.title || 'شیخ وب؛ جایی که ایده‌ها تبدیل به وب‌سایت می‌شوند.';
  const description =
    showcase?.description ||
    'طراحی و توسعه وب‌سایت‌های فروشگاهی، شرکتی، خدماتی و اختصاصی با تکنولوژی‌های مدرن، طراحی حرفه‌ای و تمرکز بر سرعت و تجربه کاربری.';
  const services =
    showcase?.services && showcase.services.length > 0
      ? showcase.services
      : ['فروشگاهی', 'شرکتی', 'خدماتی', 'شخصی', 'اختصاصی'];
  const ctaText = showcase?.ctaText || 'مشاهده خدمات طراحی سایت';
  const targetUrl = showcase?.ctaUrl && showcase.ctaUrl !== '/services/web-design' ? showcase.ctaUrl : '/web';
  const imageUrl = showcase?.imageUrl || null;

  return (
    <section className="container-fluid py-8 md:py-14 relative z-10 font-vazirmatn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-stone-900/90 via-stone-950/95 to-amber-950/80 border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl p-6 sm:p-8 md:p-10 lg:p-12">
          {/* Subtle ambient glow effects */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

          {/* Grid Layout: Desktop LEFT image, RIGHT text. Mobile: Stacked image top/bottom appropriately */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* LEFT Column (Desktop): Premium Visual Card */}
            <div className="lg:col-span-5 order-1 lg:order-1 flex justify-center w-full">
              <Link href={targetUrl} className="block w-full">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-full aspect-[4/5] sm:aspect-[3/4] rounded-t-[3.5rem] rounded-b-3xl bg-gradient-to-b from-amber-950/40 via-stone-900/80 to-stone-950 border border-amber-500/30 p-4 sm:p-6 shadow-2xl flex flex-col justify-end items-center overflow-hidden group cursor-pointer">
                  {/* Radial Lighting Spotlight behind the character/subject */}
                  <div className="absolute inset-x-0 top-1/4 h-3/5 bg-gradient-radial from-amber-400/20 via-orange-500/10 to-transparent rounded-full blur-2xl pointer-events-none animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-amber-500/5 pointer-events-none" />

                  {/* Card Top Pill Badge */}
                  <div className="absolute top-4 sm:top-6 z-20 bg-stone-950/80 border border-amber-500/30 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-200 text-xs font-bold tracking-wide">
                      Sheikh Web Ecosystem
                    </span>
                  </div>

                  {/* Character Image container supporting transparent PNG/WebP */}
                  <div className="relative w-full h-full flex items-end justify-center z-10 pt-10">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="خدمات طراحی سایت شیخ وب"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 30vw"
                        className="object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] transition-transform duration-700 group-hover:scale-[1.03]"
                        priority
                      />
                    ) : (
                      /* Elegant Fallback Visual when no custom image is set by admin */
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 relative">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center mb-4 shadow-xl backdrop-blur-md">
                          <span className="text-5xl sm:text-6xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                            👑
                          </span>
                        </div>
                        <h4 className="text-amber-100 font-bold text-base sm:text-lg mb-1">
                          طراحی وب‌سایت اختصاصی
                        </h4>
                        <p className="text-stone-400 text-xs max-w-xs leading-relaxed">
                          توسعه راه‌کارهای مدرن تحت وب با معماری پیشرفته
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Subtle Inner Glow Border Rim */}
                  <div className="absolute inset-0 rounded-t-[3.5rem] rounded-b-3xl border border-amber-400/10 pointer-events-none" />
                </div>
              </Link>
            </div>

            {/* RIGHT Column (Desktop): Persian Marketing Content */}
            <div className="lg:col-span-7 order-2 lg:order-2 text-right flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold w-fit mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>خدمات تخصصی فناوری و نرم‌افزار</span>
              </div>

              {/* Main Heading */}
              <Link href={targetUrl} className="hover:opacity-90 transition-opacity">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white leading-tight mb-4 bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                  {title}
                </h2>
              </Link>

              {/* Supporting Text */}
              <p className="text-stone-300 text-sm sm:text-base md:text-lg leading-relaxed mb-6 font-normal max-w-2xl">
                {description}
              </p>

              {/* Service Chips / Bullet points */}
              {services && services.length > 0 && (
                <div className="mb-8">
                  <div className="text-stone-400 text-xs font-semibold mb-3">
                    تخصص‌های ما شامل:
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {services.map((service, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-500/20 text-amber-200 text-xs font-medium shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{service}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Action Button */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href={targetUrl} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto min-h-[48px] px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-stone-950 font-bold text-sm sm:text-base shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:shadow-[0_12px_35px_rgba(245,158,11,0.45)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                    <span>{ctaText}</span>
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
