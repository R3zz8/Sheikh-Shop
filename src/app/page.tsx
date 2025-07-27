import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui';

// Dynamic imports for better performance
const Banner = dynamic(() => import('@/components/banner'), {
  loading: () => <div className="min-h-[600px] bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 animate-pulse" />,
  ssr: true
});

const Welcome = dynamic(() => import('@/components/Welcome'), {
  loading: () => <div className="min-h-[400px] bg-white/8 backdrop-blur-sm rounded-2xl animate-pulse" />,
  ssr: true
});

// Use client component wrapper for 3D component
const PalmTreeWrapper = dynamic(() => import('@/components/3d/PalmTreeWrapper'), {
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-amber-700 font-medium">Loading 3D Palm Tree...</p>
      </div>
    </div>
  ),
  ssr: true
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Hero Carousel Section */}
        <Banner />

        {/* 3D Palm Tree Section */}
        <section className="container-fluid section-padding">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="h2 text-gradient mb-4">
                Premium Date Collection
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Experience the finest quality dates, grown with care and tradition
              </p>
            </div>

            {/* 3D Palm Tree Component */}
            <div className="relative">
              <PalmTreeWrapper
                height="500px"
                enableControls={true}
                autoRotate={true}
                intensity={1.2}
                className="rounded-2xl overflow-hidden shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="container-fluid section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <Welcome />

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link href="/register">
                <Button className="btn-primary text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button className="btn-secondary text-lg">
                  Sign In
                </Button>
              </Link>
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
