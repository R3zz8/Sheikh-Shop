// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ClientHeader from '@/components/ClientHeader';
import Footer from '@/components/footer/footer';
import MobileFooter from '@/components/MobileFooter';
import { Toaster } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';
import ReactQueryProvider from '@/providers/ReactQuery';
import { CurrencyProvider } from '@/providers/CurrencyProvider';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import { generateSEO } from '@/lib/seo/metadata';
import AccessibilityEnhancements from '@/components/accessibility/AccessibilityEnhancements';
import ShoppingChatbot from '@/components/ai/ShoppingChatbot';
import EnhancedAISearch from '@/components/ai/EnhancedAISearch';
import AMPHead from '@/components/seo/AMPHead';
import Script from 'next/script';
import Link from 'next/link';

// === فونت‌ها از @fontsource (بدون localFont) ===
import '@fontsource/inter/400.css';
import '@fontsource/tajawal/400.css';

// === generateMetadata ===
export async function generateMetadata(): Promise<Metadata> {
  // Root layout doesn't receive params in Next.js 15
  // Use default metadata for homepage
  const lang = 'en';
  const isArabic = false;
  const cleanPath = '/';

  const seoMap: Record<string, { en: string; ar: string }> = {
    '/': {
      en: 'Pure Honey, Premium Dates, Saffron | Sheikh Shop',
      ar: 'عسل جبلي طبيعي، تمر فاخر، زعفران سوبر نجين | شيخ شوب',
    },
    '/products': {
      en: 'Natural Honey, Dates & Saffron | Sheikh Shop',
      ar: 'عسل طبيعي، تمر فاخر، زعفران | شيخ شوب',
    },
    '/categories/honey': {
      en: 'Pure Natural Honey | 100% Raw & Organic | Sheikh Shop',
      ar: 'عسل جبلي طبيعي 100% | خام وعضوي | شيخ شوب',
    },
    '/categories/dates': {
      en: 'Premium Majdool & Piarom Dates | Fresh Harvest',
      ar: 'تمور المجدول والپیاروم الفاخرة | محصول طازج',
    },
    '/categories/saffron': {
      en: 'Super Negin Saffron | Lab-Tested & Certified',
      ar: 'زعفران سوبر نجين | فحص مخبري وشهادة جودة',
    },
    '/categories/others': {
      en: 'Natural & Organic Products | Sheikh Shop',
      ar: 'منتجات طبيعية وعضوية | شيخ شوب',
    },
  };

  const defaultSEO = seoMap['/'] || { en: 'Sheikh Shop', ar: 'شيخ شوب' };
  const pageSEO = seoMap[cleanPath] || defaultSEO;

  const title = isArabic ? pageSEO.ar : pageSEO.en;
  const description = isArabic
    ? 'عسل طبيعي 100%، تمور المجدول والپیاروم، زعفران سوبر نجين مع شحن مجاني عالمي.'
    : '100% Natural Mountain Honey, Majdool & Piarom Dates, Premium Saffron. Free Worldwide Shipping.';

  return generateSEO({
    title,
    description,
    keywords: isArabic
      ? ['عسل طبيعي', 'تمر فاخر', 'زعفران', 'شيخ شوب', 'شحن مجاني']
      : ['natural honey', 'premium dates', 'saffron', 'sheikh shop', 'free shipping'],
    canonical: cleanPath,
    ogImage: `/og-${lang}.jpg`,
  });
}

// === RootLayout ===
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout doesn't receive params in Next.js 15
  const lang = 'en';
  const isArabic = false;

  return (
    <html lang={lang} dir={isArabic ? 'rtl' : 'ltr'}>
      <head>
        <meta name="application-name" content="SheikhShops" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SheikhShops" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#451a03" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="p:domain_verify" content="211124b09592c994a2df8c1c9dfce648" />
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-BMHE9T3G35"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BMHE9T3G35', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="antialiased font-sans">
        <AMPHead />
        <AccessibilityEnhancements />
        <ErrorBoundary>
          <ReactQueryProvider>
            <CurrencyProvider>
              <div className="flex flex-col min-h-screen">
                <ClientHeader />
                <div className="sticky top-20 z-40 w-full bg-amber-950/90 backdrop-blur supports-[backdrop-filter]:bg-amber-950/70 border-b border-amber-200/10">
                  <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="w-full md:max-w-xl">
                      <EnhancedAISearch showAdvancedOptions={false} showVRStoreButton={true} />
                    </div>
                  </div>
                </div>
                <main id="main-content" className="flex-1 pt-20 pb-20 md:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileFooter />
              </div>
              <Toaster />
              <ShoppingChatbot />
            </CurrencyProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}