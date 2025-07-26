import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ReactQueryProvider from '@/providers/ReactQuery';
import Footer from '@/components/footer/footer';
import ClientHeader from '@/components/ClientHeader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sheikh Shop',
  description: 'digital shop to buy digital stuff',
};

export default function RootLayout({
  children, //slot for children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <main className="flex flex-col justify-between min-h-screen">
            <ClientHeader />
            <div className="px-4 md:px-20 mt-28">
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
