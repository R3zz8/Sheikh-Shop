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
import ShoppingChatbot from '@/components/ai/ShoppingChatbot';
import EnhancedAISearch from '@/components/ai/EnhancedAISearch';
import Link from 'next/link';

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
                {/* Feature toolbar below header */}
                <div className="sticky top-20 z-40 w-full bg-amber-950/90 backdrop-blur supports-[backdrop-filter]:bg-amber-950/70 border-b border-amber-200/10">
                  <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                    <div className="w-full md:max-w-xl">
                      <EnhancedAISearch showAdvancedOptions={false} onResultClick={(p) => { window.location.href = `/product/${p.id}`; }} />
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href="/vr-store" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200/30 bg-white/10 text-white hover:bg-white/15 transition-colors">
                        <span>VR Store</span>
                      </Link>
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
