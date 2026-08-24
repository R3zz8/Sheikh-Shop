import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Categories from '@/components/Categories';
import NewProductsSection from '@/components/home/NewProductsSection';
import { ChevronLeft, Code2 } from 'lucide-react';
import FAQSchema from '@/components/seo/FAQSchema';
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/seo/hreflang';
import { getActiveMainCategories } from '@/lib/services/getCategories';
import {
  SheikhScene,
  AmazingDeals,
  CarouselMobile,
  OptimizedPalmTree,
  PremiumSpeakerShowcase,
  RoyalShowcase,
  BMWCarousel,
} from '@/components/DynamicClientComponents';
import LuxuryProductArchCarousel from '@/components/home/LuxuryProductArchCarousel';

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
    other: {
      enamad: '35545964',
    },
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

export default async function Home() {
  const initialCategories = await getActiveMainCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
      
      {/* Categories Section */}
      <Categories initialCategories={initialCategories} />

      {/* New Products Section - Directly below Categories */}
      <NewProductsSection />

      {/* Flagship Brand Hero Experience (RTL Left Content & interactive 3D Sheikh right side) */}
      <SheikhScene />
      
      {/* Mobile Carousel - Below Categories & New Products */}
      <div className="relative z-20 px-4 py-6">
        <CarouselMobile />
      </div>

      {/* Luxury Product Arch Carousel */}
      <LuxuryProductArchCarousel />

      {/* Amazing Deals Section */}
      <AmazingDeals />

      {/* Premium Speaker Showcase Section */}
      <PremiumSpeakerShowcase />

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
        {/* Royal 3D Showcase */}
        <RoyalShowcase />

        {/* Desktop-only Hero Section with 3D Palm Tree */}
        <section className="hidden md:block container-fluid pt-4 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div
              className="grid items-center overflow-hidden"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(1rem, 3vw, 2rem)',
                minHeight: 'clamp(300px, 60vh, 700px)',
                width: '100%',
              }}
            >
              {/* Text Content - Left Column */}
              <div className="text-right overflow-hidden flex flex-col justify-center pl-4">
                <h1
                  className="font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-8"
                  style={{
                    fontSize: 'clamp(38px, 4vw + 14px, 56px)',
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                  }}
                >
                  به فروشگاه شیخ خوش آمدید
                </h1>
                <p
                  className="text-gray-200 mb-10 leading-[1.8] font-normal"
                  style={{
                    fontSize: 'clamp(20px, 1.5vw + 12px, 22px)',
                    maxWidth: '550px',
                  }}
                >
                  با مجموعه‌ای از بهترین خرماهای ممتاز، عسل طبیعی، ارده، شیره خرما و محصولات اصیل، طعم واقعی کیفیت را تجربه کنید. فروشگاه شیخ با الهام از اصالت و مهمان‌نوازی شرقی، محصولاتی تازه، سالم و باکیفیت را برای خانواده شما فراهم کرده است.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/products">
                    <Button
                      className="btn-primary whitespace-nowrap transition-all duration-300 font-bold"
                      style={{
                        fontSize: 'clamp(16px, 1vw + 12px, 18px)',
                        padding: 'clamp(0.75rem, 1.5vw, 1.125rem) clamp(1.25rem, 2.5vw, 2.25rem)',
                        borderRadius: '0.75rem',
                      }}
                    >
                      مشاهده محصولات
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="btn-secondary whitespace-nowrap transition-all duration-300 font-bold"
                      style={{
                        fontSize: 'clamp(16px, 1vw + 12px, 18px)',
                        padding: 'clamp(0.75rem, 1.5vw, 1.125rem) clamp(1.25rem, 2.5vw, 2.25rem)',
                        borderRadius: '0.75rem',
                      }}
                    >
                      ثبت نام
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Optimized 3D Palm Tree - Right Column */}
              <div
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{
                  height: 'clamp(300px, 40vw, 600px)',
                  minHeight: '300px',
                }}
              >
                <OptimizedPalmTree
                  height="100%"
                  enableControls={true}
                  autoRotate={true}
                  intensity={1.2}
                  className="rounded-2xl"
                  posterImage="/tree3d.jpeg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Premium Mobile-optimized Hero Section */}
        <section className="block md:hidden px-5 pt-10 pb-8">
          <div className="max-w-lg mx-auto flex flex-col gap-6">
            {/* Centered Hero Row */}
            <div className="flex items-center justify-between gap-4 w-full">
              {/* 3D Palm Tree Container - Fixed width/height & Vertically Centered */}
              <div className="relative overflow-hidden flex-shrink-0 w-[140px] h-[140px] xs:w-[160px] xs:h-[160px] rounded-2xl bg-stone-900/40 border border-amber-500/10 shadow-2xl flex items-center justify-center">
                <OptimizedPalmTree
                  height="100%"
                  minHeight="100%"
                  enableControls={true}
                  autoRotate={true}
                  intensity={1.2}
                  className="rounded-2xl"
                  posterImage="/tree3d.jpeg"
                />
              </div>

              {/* Text Block - Vertically Centered */}
              <div className="flex flex-col justify-center text-right flex-1 min-w-0">
                <h1 className="text-2xl xs:text-[28px] font-black bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent leading-tight mb-2">
                  به فروشگاه
                  <br />
                  شیخ خوش آمدید
                </h1>
                <p className="text-gray-300 text-[13px] xs:text-[14px] leading-relaxed font-normal">
                  با مجموعه‌ای از بهترین خرماهای ممتاز، عسل طبیعی، زعفران اصل و محصولات طبیعی، تجربه‌ای از کیفیت و اصالت را تجربه کنید.
                </p>
              </div>
            </div>

            {/* Premium Buttons */}
            <div className="flex flex-col gap-[14px] items-center justify-center w-full pb-[30px]">
              {/* Primary: Shop Products */}
              <Link href="/products" className="group w-full flex justify-center">
                <button className="w-full max-w-[340px] h-[48px] relative overflow-hidden bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-6 rounded-full text-stone-950 text-sm font-black font-vazirmatn shadow-[0_8px_30px_rgb(245,158,11,0.25)] hover:shadow-[0_12px_40px_rgb(245,158,11,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] flex items-center justify-center gap-2">
                  <span>مشاهده محصولات</span>
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
              </Link>

              {/* Secondary: Custom Website Development */}
              <Link href="/contact" className="group w-full flex justify-center">
                <button className="w-full max-w-[340px] h-[44px] bg-neutral-900/60 border border-amber-500/20 hover:border-amber-400/40 px-6 rounded-full text-amber-200/90 text-xs font-bold font-vazirmatn transition-all duration-300 hover:scale-[1.03] active:scale-[0.96] flex items-center justify-center gap-2 backdrop-blur-md shadow-md">
                  <span>سفارش طراحی سایت</span>
                  <Code2 className="w-4 h-4 text-amber-400/90 group-hover:rotate-12 transition-transform duration-300" />
                </button>
              </Link>
            </div>
          </div>
        </section>

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
