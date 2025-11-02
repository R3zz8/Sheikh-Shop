import Link from 'next/link';
import { Button } from '@/components/ui/button';
import OptimizedPalmTree from '@/components/3d/OptimizedPalmTree';
import Categories from '@/components/Categories';
import AmazingDeals from '@/components/AmazingDeals';
import FAQSchema from '@/components/seo/FAQSchema';
import CarouselMobile from '@/components/CarouselMobile';
import '@fontsource/inter/400.css';     // Regular
import '@fontsource/tajawal/400.css';    // Regular
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
      
      {/* Categories Section */}
      <Categories />
      
      {/* Mobile Carousel - Below Categories */}
      <div className="relative z-20 px-4 py-6">
        <CarouselMobile />
      </div>

      {/* Amazing Deals Section */}
      <AmazingDeals />

      {/* Inject FAQ JSON-LD for common homepage questions */}
      <FAQSchema
        faqs={[
          { question: 'Do you ship internationally?', answer: 'Yes, we ship worldwide with tracked delivery options.' },
          { question: 'What payment methods are accepted?', answer: 'We accept major credit cards and secure third-party payments.' },
          { question: 'How long does delivery take?', answer: 'Standard delivery is 3–7 business days depending on your region.' },
        ]}
      />

      <div className="relative z-10">
        {/* Hero Section with 3D Palm Tree - Always Horizontal */}
        <section className="container-fluid section-padding">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
            {/* Grid with 2 columns that never wrap - scales proportionally */}
            <div 
              className="grid items-center overflow-hidden"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(0.5rem, 3vw, 2rem)',
                minHeight: 'clamp(400px, 85vh, 700px)',
                width: '100%',
              }}
            >
              {/* Text Content - Left Column */}
              <div className="text-left overflow-hidden flex flex-col justify-center pr-2 sm:pr-4">
                <h1 
                  className="font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6"
                  style={{
                    fontSize: 'clamp(1.25rem, 3.5vw + 0.75rem, 3.75rem)',
                    lineHeight: '1.1',
                    wordBreak: 'break-word',
                  }}
                >
                  Welcome to Sheikh Shop
                </h1>
                <p 
                  className="text-gray-300 mb-4 sm:mb-6 md:mb-8 leading-relaxed"
                  style={{
                    fontSize: 'clamp(0.75rem, 1.25vw + 0.5rem, 1.25rem)',
                    lineHeight: '1.6',
                  }}
                >
                  Experience luxury redefined with our curated collection of premium products,
                  inspired by the elegance of Arabian heritage.
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  <Link href="/products">
                    <Button 
                      className="btn-primary whitespace-nowrap"
                      style={{
                        fontSize: 'clamp(0.75rem, 0.9vw + 0.5rem, 1.125rem)',
                        padding: 'clamp(0.5rem, 1.25vw, 0.875rem) clamp(0.875rem, 1.75vw, 1.5rem)',
                      }}
                    >
                      Explore Products
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button 
                      className="btn-secondary whitespace-nowrap"
                      style={{
                        fontSize: 'clamp(0.75rem, 0.9vw + 0.5rem, 1.125rem)',
                        padding: 'clamp(0.5rem, 1.25vw, 0.875rem) clamp(0.875rem, 1.75vw, 1.5rem)',
                      }}
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Optimized 3D Palm Tree - Right Column */}
              <div 
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{ 
                  height: 'clamp(250px, 45vw, 600px)',
                  minHeight: '250px',
                }}
              >
                <OptimizedPalmTree
                  height="100%"
                  enableControls={true}
                  autoRotate={true}
                  intensity={1.2}
                  className="rounded-2xl"
                  posterImage="/palm-tree-poster.jpg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container-fluid section-padding-sm">
          <div className="max-w-6xl mx-auto">
            {/*
              Responsive grid behaviour:
              - Default/mobile: 1 col baseline
              - max-[400px]: 2 cols (2x2); center the last card by spanning 2 cols and centering
              - min-[500px]: 3 cols in one row
              - lg+: keep 3 cols as current
            */}
            <div className="grid grid-cols-1 max-[400px]:grid-cols-2 min-[500px]:grid-cols-3 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="card p-6 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">🌟</span>
                </div>
                {/* Thin gradient separator */}
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h3 className="text-xl max-[400px]:text-sm min-[500px]:text-base lg:text-xl font-semibold text-white mb-2">Premium Quality</h3>
                <p className="text-gray-300 text-sm max-[400px]:text-xs min-[500px]:text-xs lg:text-sm">
                  Curated selection of the finest products with exceptional craftsmanship
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 text-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">🚚</span>
                </div>
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h3 className="text-xl max-[400px]:text-sm min-[500px]:text-base lg:text-xl font-semibold text-white mb-2">Fast Delivery</h3>
                <p className="text-gray-300 text-sm max-[400px]:text-xs min-[500px]:text-xs lg:text-sm">
                  Swift and secure delivery to your doorstep with premium packaging
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 text-center max-[400px]:col-span-2 max-[400px]:justify-self-center">
                <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-400 shadow-lg w-16 h-16 max-[400px]:w-12 max-[400px]:h-12 min-[500px]:w-14 min-[500px]:h-14 lg:w-16 lg:h-16">
                  <span className="text-2xl max-[400px]:text-xl min-[500px]:text-xl lg:text-2xl">💎</span>
                </div>
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300/70" />
                <h3 className="text-xl max-[400px]:text-sm min-[500px]:text-base lg:text-xl font-semibold text-white mb-2">Exclusive Collection</h3>
                <p className="text-gray-300 text-sm max-[400px]:text-xs min-[500px]:text-xs lg:text-sm">
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