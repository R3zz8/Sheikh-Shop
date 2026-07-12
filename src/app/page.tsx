import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Categories from '@/components/Categories';
import FAQSchema from '@/components/seo/FAQSchema';
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/seo/hreflang';
import {
  SheikhScene,
  AmazingDeals,
  CarouselMobile,
} from '@/components/DynamicClientComponents';
import BMWCarousel from '@/components/BMWCarousel';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sheikhshops.com' 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const canonicalPath = '/';
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  
  return {
    title: 'به دنیای فروشگاه شیخ خوش آمدید | اکوسیستم شیخ',
    description: 'فروشگاه شیخ تنها یک فروشگاه اینترنتی نیست؛ اکوسیستمی از محصولات و خدمات متنوع شامل کالاهای دیجیتال، لوازم خودرو، عطر و ادکلن، تجهیزات هوشمند و خدمات تخصصی طراحی وب.',
    keywords: ['natural honey', 'premium dates', 'saffron', 'sheikh shop', 'free shipping', 'طراحی سایت', 'کالای دیجیتال'],
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      url: canonicalUrl,
      title: 'به دنیای فروشگاه شیخ خوش آمدید | اکوسیستم شیخ',
      description: 'فروشگاه شیخ تنها یک فروشگاه اینترنتی نیست؛ اکوسیستمی از محصولات و خدمات متنوع شامل کالاهای دیجیتال، لوازم خودرو، عطر و ادکلن، تجهیزات هوشمند و خدمات تخصصی طراحی وب.',
      siteName: 'Sheikh Shop',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Sheikh Shop - Premium Ecosystem',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'به دنیای فروشگاه شیخ خوش آمدید | اکوسیستم شیخ',
      description: 'فروشگاه شیخ تنها یک فروشگاه اینترنتی نیست؛ اکوسیستمی از محصولات و خدمات متنوع شامل کالاهای دیجیتال، لوازم خودرو، عطر و ادکلن، تجهیزات هوشمند و خدمات تخصصی طراحی وب.',
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
      
      {/* Categories Section */}
      <Categories />

      {/* Flagship Brand Hero Experience (RTL Left Content & interactive 3D Sheikh right side) */}
      <SheikhScene />
      
      {/* Mobile Carousel - Below Categories */}
      <div className="relative z-20 px-4 py-6">
        <CarouselMobile />
      </div>

      {/* Amazing Deals Section */}
      <AmazingDeals />

      <BMWCarousel />

      {/* Inject FAQ JSON-LD for common homepage questions */}
      <FAQSchema
        faqs={[
          { question: 'Do you ship internationally?', answer: 'Yes, we ship worldwide with tracked delivery options.' },
          { question: 'What payment methods are accepted?', answer: 'We accept major credit cards and secure third-party payments.' },
          { question: 'How long does delivery take?', answer: 'Standard delivery is 3–7 business days depending on your region.' },
        ]}
      />

      <div className="relative z-10">
        {/* Features Section */}
        <section className="container-fluid section-padding-sm pt-4 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            {/*
              Optimized Mobile & Desktop Grid Layout:
              - Mobile & Tablet: Always 1 perfectly balanced horizontal row (grid-cols-3)
              - Desktop: Still 3 columns (grid-cols-3) with standard desktop dimensions.
              - Uniform, balanced padding, gaps, and heights.
            */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {/* Feature 1 */}
              <div className="card p-4 text-center flex flex-col justify-start items-stretch h-full bg-stone-900/40 border border-amber-500/10 rounded-2xl backdrop-blur-md">
                <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">🌟</span>
                </div>
                {/* Thin separator */}
                <div className="mx-auto mb-2 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 leading-tight tracking-tight select-none font-vazirmatn">کیفیت ممتاز</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed font-vazirmatn">
                  مجموعه‌ای منتخب از محصولات با هنر ساخت بی‌نظیر
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-4 text-center flex flex-col justify-start items-stretch h-full bg-stone-900/40 border border-amber-500/10 rounded-2xl backdrop-blur-md">
                <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">🚚</span>
                </div>
                <div className="mx-auto mb-2 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 leading-tight tracking-tight select-none font-vazirmatn">ارسال سریع</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed font-vazirmatn">
                  ارسال سریع و مطمئن درب منزل با بسته‌بندی لوکس
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-4 text-center flex flex-col justify-start items-stretch h-full bg-stone-900/40 border border-amber-500/10 rounded-2xl backdrop-blur-md">
                <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">💎</span>
                </div>
                <div className="mx-auto mb-2 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 leading-tight tracking-tight select-none font-vazirmatn">مجموعه انحصاری</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed font-vazirmatn">
                  تخفیف‌های انحصاری و نسخه‌های خاص برای شما
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}