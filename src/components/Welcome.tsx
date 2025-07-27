import { Crown, Sparkles } from 'lucide-react';
import React from 'react';
import { Button } from './ui';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Crown className="w-8 h-8 text-amber-300" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
            Welcome to Sheikh Shop
          </h1>
          <Crown className="w-8 h-8 text-amber-300" />
        </div>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Experience luxury redefined with our curated collection of premium products.
          Discover exceptional quality and craftsmanship that sets new standards.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto mt-12">
        {[
          {
            icon: Crown,
            title: "Premium Quality",
            description: "Curated selection of the finest products with exceptional craftsmanship"
          },
          {
            icon: Sparkles,
            title: "Exclusive Collection",
            description: "Unique items that reflect sophistication and luxury lifestyle"
          },
          {
            icon: Crown,
            title: "Trusted Service",
            description: "Dedicated support ensuring your shopping experience is seamless"
          }
        ].map((feature, index) => (
          <div
            key={index}
            className={cn(
              "relative group p-6 rounded-2xl",
              "bg-white/8 backdrop-blur-xl border border-white/15",
              "shadow-xl hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-500",
              "hover:scale-105 hover:bg-white/12 overflow-hidden"
            )}
          >
            {/* Subtle border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/20 via-yellow-200/20 to-orange-200/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

            <div className="relative z-10 text-center space-y-4">
              <div className="flex justify-center">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "bg-gradient-to-r from-amber-600/20 via-yellow-600/20 to-orange-600/20",
                  "border border-amber-500/30"
                )}>
                  <feature.icon className="w-8 h-8 text-amber-300" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <Button
          asChild
          className={cn(
            "bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600",
            "hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700",
            "text-white font-semibold px-8 py-3 rounded-xl border border-amber-500/30",
            "shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300",
            "transform hover:-translate-y-0.5 backdrop-blur-sm"
          )}
        >
          <Link href="/products">Explore Products</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={cn(
            "bg-white/8 backdrop-blur-sm border border-white/20",
            "text-white hover:bg-white/12 hover:text-white hover:border-white/30 font-semibold",
            "px-8 py-3 rounded-xl transition-all duration-300"
          )}
        >
          <Link href="/user">My Account</Link>
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
