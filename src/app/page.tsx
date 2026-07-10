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
          <div className="max-w-6xl mx-auto">
            {/*
              Responsive grid behaviour:
              - Default/mobile: 1 col baseline
              - max-[400px]: 2 cols (2x2); center the last card by spanning 2 cols and centering
              - min-[500px]: 3 cols in one row
              - lg+: keep 3 cols as current
            */}
            <div className="grid grid-cols-1 max-[400px]:grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="card p-6 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">🌟</span>
                </div>
                {/* Thin gradient separator */}
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-white mb-2">کیفیت ممتاز</h2>
                <p className="text-gray-300 text-[16px] md:text-[17px] lg:text-[18px] leading-relaxed">
                  مجموعه‌ای منتخب از بهترین محصولات با هنر ساخت بی‌نظیر و کیفیت استثنایی
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">🚚</span>
                </div>
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-white mb-2">ارسال سریع</h2>
                <p className="text-gray-300 text-[16px] md:text-[17px] lg:text-[18px] leading-relaxed">
                  ارسال سریع و مطمئن درب منزل با بسته‌بندی ویژه و لوکس
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 text-center max-[400px]:col-span-2 max-[400px]:justify-self-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">💎</span>
                </div>
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h2 className="text-[18px] md:text-[20px] lg:text-[22px] font-bold text-white mb-2">مجموعه انحصاری</h2>
                <p className="text-gray-300 text-[16px] md:text-[17px] lg:text-[18px] leading-relaxed">
                  نسخه‌های محدود و تخفیف‌های ویژه برای مشتریان گران‌قدر ما
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}