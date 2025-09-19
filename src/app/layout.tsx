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
import { generateMetadata as generateSEOMetadata } from '@/lib/seo/metadata';
import AccessibilityEnhancements from '@/components/accessibility/AccessibilityEnhancements';

// Font variables with fallbacks
const fontVariables = '--font-inter --font-poppins --font-jetbrains-mono';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Sheikh Shop - Premium Luxury Products',
  description: 'Discover our curated collection of premium luxury products. Experience exceptional quality and craftsmanship with Sheikh Shop.',
  keywords: ['luxury', 'premium', 'products', 'sheikh shop', 'quality', 'craftsmanship'],
  canonical: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#451a03" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="antialiased">
        <AccessibilityEnhancements />
        <ErrorBoundary>
          <ReactQueryProvider>
            <CurrencyProvider>
              <div className="flex flex-col min-h-screen">
                <ClientHeader />
                <main id="main-content" className="flex-1 pt-20 pb-20 md:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileFooter />
              </div>
              <Toaster />
            </CurrencyProvider>
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
