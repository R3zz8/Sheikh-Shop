import Banner from '@/components/banner';
import Welcome from '@/components/Welcome';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Hero Carousel Section */}
        <Banner />

        {/* Welcome Section */}
        <div className="container mx-auto px-6 md:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Welcome />

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Link href="/register">
                <Button className={cn(
                  "bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
                  "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
                  "text-white font-semibold px-8 py-3 rounded-xl border border-amber-500/30",
                  "shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300",
                  "transform hover:-translate-y-0.5 backdrop-blur-sm text-lg",
                  "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                )}>
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className={cn(
                    "bg-white/8 backdrop-blur-sm border border-white/20",
                    "text-white hover:bg-white/12 hover:text-white hover:border-white/30 font-semibold",
                    "px-8 py-3 rounded-xl transition-all duration-300 text-lg",
                    "focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                  )}
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
