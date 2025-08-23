import type { Metadata } from 'next';
import { Inter, Poppins, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ClientHeader from '@/components/ClientHeader';
import Footer from '@/components/footer/footer';
import MobileFooter from '@/components/MobileFooter';
import { Toaster } from '@/components/ui';
import ErrorBoundary from '@/components/ErrorBoundary';
import ReactQueryProvider from '@/providers/ReactQuery';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sheikh Shop - Premium Luxury Products',
    template: '%s | Sheikh Shop',
  },
  description: 'Discover our curated collection of premium luxury products. Experience exceptional quality and craftsmanship with Sheikh Shop.',
  keywords: ['luxury', 'premium', 'products', 'sheikh shop', 'quality', 'craftsmanship'],
  authors: [{ name: 'Sheikh Shop Team' }],
  creator: 'Sheikh Shop',
  publisher: 'Sheikh Shop',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sheikhshop.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sheikhshop.com',
    title: 'Sheikh Shop - Premium Luxury Products',
    description: 'Discover our curated collection of premium luxury products. Experience exceptional quality and craftsmanship.',
    siteName: 'Sheikh Shop',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sheikh Shop - Premium Luxury Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sheikh Shop - Premium Luxury Products',
    description: 'Discover our curated collection of premium luxury products.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#451a03" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <ReactQueryProvider>
            <div className="flex flex-col min-h-screen">
              <ClientHeader />
              <main className="flex-1 pt-20 pb-20 md:pb-0">
                {children}
              </main>
              <Footer />
              <MobileFooter />
            </div>
            <Toaster />
          </ReactQueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
