import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { MonitorSmartphone, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/providers/ReactQuery';
import CartDropdown from '@/components/cart';
import Footer from '@/components/footer/footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Digital shop',
  description: 'digital shop to buy digital stuff',
};

export default function RootLayout({
  children, //slot for children
  ads, // slot for ads
}: Readonly<{
  children: React.ReactNode;
  ads: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main className="flex flex-col justify-between min-h-screen">
            <header className="fixed flex justify-between items-center shadow-xl bg-white px-20 w-full h-20 z-40">
              <div className="flex items-center gap-3">
                <MonitorSmartphone />
                <Link href="/" className="font-bold text-2xl">
                  Sheikh Shop
                </Link>
              </div>
              <div className="flex items-center gap-2">
                {/* Auth removed for custom auth */}
                <CartDropdown />
              </div>
            </header>
            <div className="px-20 mt-28">
              {children}
              <Toaster />
            </div>
            <div className="my-10 mx-auto flex justify-center">
              {/* {ads} */}
            </div>
          </main>
          <Footer />
        </body>
      </html>
    </ReactQueryProvider>
  );
}
