'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import dynamic from 'next/dynamic';

// Dynamically import the 3D palm tree component
const PalmTreeContainer = dynamic(() => import('@/components/3d/PalmTreeWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-amber-700 font-medium">Loading 3D Palm Tree...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Hero Section with 3D Palm Tree */}
        <section className="container-fluid section-padding">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-6">
                  Welcome to Sheikh Shop
                </h1>
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl lg:max-w-none mb-8">
                  Experience luxury redefined with our curated collection of premium products,
                  inspired by the elegance of Arabian heritage.
                </p>
                <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                  <Link href="/products">
                    <Button className="btn-primary text-lg">
                      Explore Products
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="btn-secondary text-lg">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* 3D Palm Tree */}
              <div className="relative">
                <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <PalmTreeContainer
                    height="500px"
                    enableControls={true}
                    autoRotate={true}
                    intensity={1.2}
                    className="rounded-2xl"
                  />
                </div>
                {/* Decorative overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full blur-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container-fluid section-padding-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌟</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-gray-300 text-sm">
                  Curated selection of the finest products with exceptional craftsmanship
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-300 text-sm">
                  Swift and secure delivery to your doorstep with premium packaging
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💎</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Exclusive Collection</h3>
                <p className="text-gray-300 text-sm">
                  Limited edition items and exclusive deals for our valued customers
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
