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
import { generatePageSEO } from '@/lib/seo/core';
import AccessibilityEnhancements from '@/components/accessibility/AccessibilityEnhancements';
import { ShoppingChatbot, EnhancedAISearch } from '@/components/DynamicClientComponents';
import AMPHead from '@/components/seo/AMPHead';
import Script from 'next/script';
import Link from 'next/link';
import { Inter, Tajawal, Poppins, JetBrains_Mono } from 'next/font/google';

// FIXED: Optimized font loading to eliminate render-blocking CSS.
// Using next/font automatically self-hosts fonts and inlines the critical font-face CSS,
// which is the modern, recommended approach for performance in Next.js.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-tajawal',
  weight: ['400', '700'],
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600'],
});

// === generateMetadata ===
export async function generateMetadata(): Promise<Metadata> {
  // The root layout now provides a default, brand-focused metadata object.
  // Page-specific metadata will override this, ensuring titles and descriptions
  // are not duplicated or incorrectly applied globally.
  return generatePageSEO({
    title: 'Sheikh Shop | Premium Honey, Dates, and Saffron',
    description: 'Discover the finest selection of 100% natural mountain honey, premium Majdool dates, and Super Negin saffron. Sheikh Shop offers authentic, high-quality products with free worldwide shipping.',
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
        <script
          data-cfasync="false"
          src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"
          defer>
        </script>
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
      <body
        className={`${inter.variable} ${tajawal.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased font-sans`}
      >
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