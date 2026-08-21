// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';
import ReactQueryProvider from '@/providers/ReactQuery';
import { CurrencyProvider } from '@/providers/CurrencyProvider';
import { UIProvider } from '@/providers/UIProvider';
import { LuxuryUnboxingProvider } from '@/components/3d/LuxuryUnboxingProvider';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/JsonLd';
import { generatePageSEO } from '@/lib/seo/core';
import AppLayoutContent from '@/components/AppLayoutContent';
import { Inter, Vazirmatn } from 'next/font/google';
import PWAResponsiveSplash from '@/components/PWAResponsiveSplash';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '600', '700'],
  adjustFontFallback: true,
});

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: ['400', '500', '700', '800'],
  adjustFontFallback: true,
});

export async function generateMetadata(): Promise<Metadata> {
  return generatePageSEO({
    title: 'Sheikh Shop | Premium Honey, Dates, and Saffron',
    description: 'Discover the finest selection of 100% natural mountain honey, premium Majdool dates, and Super Negin saffron. Sheikh Shop offers authentic, high-quality products with free worldwide shipping.',
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = 'fa';
  const isArabic = true;

  return (
    <html lang={lang} dir={isArabic ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="application-name" content="فروشگاه شیخ" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="فروشگاه شیخ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
        className={`${inter.variable} ${vazirmatn.variable} antialiased font-sans font-vazirmatn`}
      >
        <PWAResponsiveSplash>
          <ErrorBoundary>
            <ReactQueryProvider>
              <CurrencyProvider>
                <UIProvider>
                  <LuxuryUnboxingProvider>
                    <AppLayoutContent>
                      {children}
                    </AppLayoutContent>
                    <Toaster />
                  </LuxuryUnboxingProvider>
                </UIProvider>
              </CurrencyProvider>
            </ReactQueryProvider>
          </ErrorBoundary>
        </PWAResponsiveSplash>
      </body>
    </html>
  );
}