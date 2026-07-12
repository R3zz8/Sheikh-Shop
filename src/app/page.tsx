import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Categories from '@/components/Categories';
import FAQSchema from '@/components/seo/FAQSchema';
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/seo/hreflang';
import {
  OptimizedPalmTree,
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
    title: 'Pure Honey, Premium Dates, Saffron | Sheikh Shop',
    description: '100% Natural Mountain Honey, Majdool & Piarom Dates, Premium Saffron. Free Worldwide Shipping.',
    keywords: ['natural honey', 'premium dates', 'saffron', 'sheikh shop', 'free shipping'],
    alternates: {
      canonical: canonicalUrl,
      languages: buildLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      title: 'Pure Honey, Premium Dates, Saffron | Sheikh Shop',
      description: '100% Natural Mountain Honey, Majdool & Piarom Dates, Premium Saffron. Free Worldwide Shipping.',
      siteName: 'Sheikh Shop',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Sheikh Shop - Premium Natural Products',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Pure Honey, Premium Dates, Saffron | Sheikh Shop',
      description: '100% Natural Mountain Honey, Majdool & Piarom Dates, Premium Saffron. Free Worldwide Shipping.',
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
        {/* Hero Section with 3D Palm Tree - Always Horizontal */}
        <section className="container-fluid pt-4 md:pt-8 pb-4 md:pb-8">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Grid with 2 columns that never wrap - scales proportionally */}
            <div 
              className="grid items-center overflow-hidden"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(0.5rem, 3vw, 2rem)',
                minHeight: 'clamp(320px, 60vh, 700px)',
                width: '100%',
              }}
            >
              {/* Text Content - Left Column */}
              <div className="text-right overflow-hidden flex flex-col justify-center pl-2 sm:pl-4">
                <h1 
                  className="font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-4 sm:mb-6 md:mb-8"
                  style={{
                    fontSize: 'clamp(38px, 4vw + 14px, 56px)',
                    lineHeight: '1.2',
                    wordBreak: 'break-word',
                  }}
                >
                  به فروشگاه شیخ خوش آمدید
                </h1>
                <p 
                  className="text-gray-200 mb-6 sm:mb-8 md:mb-10 leading-[1.8] font-normal"
                  style={{
                    fontSize: 'clamp(20px, 1.5vw + 12px, 22px)',
                    maxWidth: '550px',
                  }}
                >
                  با مجموعه‌ای از بهترین خرماهای ممتاز، عسل طبیعی، ارده، شیره خرما و محصولات اصیل، طعم واقعی کیفیت را تجربه کنید. فروشگاه شیخ با الهام از اصالت و مهمان‌نوازی شرقی، محصولاتی تازه، سالم و باکیفیت را برای خانواده شما فراهم کرده است.
                </p>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
                  height: 'clamp(200px, 40vw, 600px)',
                  minHeight: '200px',
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

        {/* Features Section */}
        <section className="container-fluid section-padding-sm">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            {/*
              Optimized Mobile & Desktop Grid Layout:
              - Mobile & Tablet: Always 1 perfectly balanced horizontal row (grid-cols-3)
              - Desktop: Still 3 columns (grid-cols-3) with standard desktop dimensions.
              - Uniform, balanced padding, gaps, and heights.
            */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {/* Feature 1 */}
              <div className="card p-2 sm:p-4 md:p-6 text-center flex flex-col justify-start items-stretch h-full">
                <div className="mx-auto mb-1.5 sm:mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">🌟</span>
                </div>
                {/* Thin gradient separator */}
                <div className="mx-auto mb-2 sm:mb-4 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 sm:mb-2 leading-tight tracking-tight select-none">کیفیت ممتاز</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed">
                  مجموعه‌ای منتخب از محصولات با هنر ساخت بی‌نظیر
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-2 sm:p-4 md:p-6 text-center flex flex-col justify-start items-stretch h-full">
                <div className="mx-auto mb-1.5 sm:mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">🚚</span>
                </div>
                <div className="mx-auto mb-2 sm:mb-4 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 sm:mb-2 leading-tight tracking-tight select-none">ارسال سریع</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed">
                  ارسال سریع و مطمئن درب منزل با بسته‌بندی لوکس
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-2 sm:p-4 md:p-6 text-center flex flex-col justify-start items-stretch h-full">
                <div className="mx-auto mb-1.5 sm:mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-lg w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0">
                  <span className="text-lg sm:text-xl md:text-2xl">💎</span>
                </div>
                <div className="mx-auto mb-2 sm:mb-4 h-px w-10 sm:w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70 shrink-0" />
                <h2 className="text-[13px] sm:text-[16px] md:text-[18px] lg:text-[22px] font-bold text-white mb-1 sm:mb-2 leading-tight tracking-tight select-none">مجموعه انحصاری</h2>
                <p className="text-gray-300 text-[11px] sm:text-[13px] md:text-[15px] lg:text-[16px] leading-[1.4] sm:leading-relaxed">
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