import {
  Mail,
  MapPin,
  Phone,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  Sparkles,
  Crown,
  Shield,
  Heart,
  Star,
  ShoppingBag,
  HelpCircle,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export default function Footer() {
  return (
    <footer className="relative w-full">
      {/* Consultation CTA Section */}
      <div className="relative bg-gradient-to-r from-amber-900/80 via-orange-900/80 to-yellow-900/80 backdrop-blur-xl border-t border-amber-200/20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-yellow-500/5" />
        <div className="relative z-10 w-full flex justify-center py-8 px-4">
          <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="text-xl font-semibold text-white">Need Premium Consultation?</h3>
              </div>
              <p className="text-amber-100 text-sm opacity-90">Experience personalized guidance from our luxury product experts</p>
            </div>
            <Button
              className={cn(
                'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600',
                'hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700',
                'text-white font-semibold px-8 py-3 rounded-xl border border-amber-500/30',
                'shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300',
                'transform hover:-translate-y-0.5 backdrop-blur-sm',
                'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
              )}
            >
              <Crown className="w-4 h-4 mr-2" />
                            Get Consultation
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-t border-amber-200/10">
        {/* Subtle background effects */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />

        {/* Mobile Footer - Luxury Card Design */}
        <div className="md:hidden relative z-10 px-4 py-8">
          <div className="bg-gradient-to-br from-amber-900/40 via-stone-800/40 to-amber-900/40 backdrop-blur-xl rounded-2xl border border-amber-200/20 shadow-2xl shadow-amber-900/20 p-6">
            {/* Brand Section - Mobile */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-amber-300" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                  Sheikh Shop
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Curating the world&apos;s finest premium products with exceptional quality and craftsmanship.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-300 text-sm">
                <Star className="w-4 h-4" />
                <span>Premium Quality Guaranteed</span>
              </div>
            </div>

            {/* 2-Column Grid Layout - Mobile */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Shop Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-amber-300" />
                  <h4 className="text-lg font-semibold text-white">Shop</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    { name: 'Premium Drinks', href: '#' },
                    { name: 'Luxury Supplements', href: '#' },
                    { name: 'Artisan Spices', href: '#' },
                  ].map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={cn(
                          'text-gray-300 hover:text-amber-200 transition-all duration-300 text-sm',
                          'flex items-center gap-2 group',
                        )}
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-amber-300" />
                  <h4 className="text-lg font-semibold text-white">Company</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    { name: 'About Us', href: '#' },
                    { name: 'Our Story', href: '#' },
                    { name: 'Careers', href: '#' },
                  ].map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={cn(
                          'text-gray-300 hover:text-amber-200 transition-all duration-300 text-sm',
                          'flex items-center gap-2 group',
                        )}
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Horizontal Social Icons - Mobile */}
            <div className="text-center mb-6">
              <span className="text-gray-300 text-sm font-medium mb-4 block">Follow our journey</span>
              <div className="flex items-center justify-center gap-4">
                {[
                  { icon: Instagram, href: '#', label: 'Instagram', hoverColor: 'hover:text-pink-400' },
                  { icon: Twitter, href: '#', label: 'Twitter', hoverColor: 'hover:text-blue-400' },
                  { icon: Youtube, href: '#', label: 'YouTube', hoverColor: 'hover:text-red-400' },
                  { icon: MessageCircle, href: '#', label: 'WhatsApp', hoverColor: 'hover:text-green-400' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className={cn(
                      'w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20',
                      'flex items-center justify-center text-gray-300 transition-all duration-300',
                      'hover:bg-white/15 hover:border-white/30 hover:scale-110',
                      social.hoverColor,
                    )}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Essential Links - Mobile */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-3">
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">Privacy</a>
                <span className="text-amber-300">•</span>
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">Terms</a>
                <span className="text-amber-300">•</span>
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">Cookies</a>
              </div>
              <div className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} Sheikh Shop. All rights reserved.
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Footer - Unchanged */}
        <div className="hidden md:block relative z-10 max-w-7xl mx-auto py-16 px-6 md:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-8 h-8 text-amber-300" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                                    Sheikh Shop
                </h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                                Curating the world&apos;s finest premium products with exceptional quality and craftsmanship.
                                Experience luxury redefined.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-sm">
                <Star className="w-4 h-4" />
                <span>Premium Quality Guaranteed</span>
              </div>
            </div>

            {/* Shop Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <h4 className="text-lg font-semibold text-white">Shop</h4>
              </div>
              <ul className="space-y-3">
                {[
                  { name: 'Premium Drinks', href: '#' },
                  { name: 'Luxury Supplements', href: '#' },
                  { name: 'Artisan Spices', href: '#' },
                  { name: 'Exclusive Collections', href: '#' },
                  { name: 'Limited Editions', href: '#' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'text-gray-300 hover:text-amber-200 transition-all duration-300 text-sm',
                        'flex items-center gap-2 group',
                      )}
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help & Support */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-amber-300" />
                <h4 className="text-lg font-semibold text-white">Help & Support</h4>
              </div>
              <ul className="space-y-3">
                {[
                  { name: 'Customer Service', href: '#' },
                  { name: 'Shipping Information', href: '#' },
                  { name: 'Returns & Exchanges', href: '#' },
                  { name: 'Size Guide', href: '#' },
                  { name: 'FAQ', href: '#' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'text-gray-300 hover:text-amber-200 transition-all duration-300 text-sm',
                        'flex items-center gap-2 group',
                      )}
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Legal */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-amber-300" />
                <h4 className="text-lg font-semibold text-white">Company</h4>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  { name: 'About Us', href: '#' },
                  { name: 'Our Story', href: '#' },
                  { name: 'Sustainability', href: '#' },
                  { name: 'Careers', href: '#' },
                  { name: 'Press', href: '#' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'text-gray-300 hover:text-amber-200 transition-all duration-300 text-sm',
                        'flex items-center gap-2 group',
                      )}
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <Phone className="w-4 h-4 text-amber-300" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>hello@sheikhshop.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>Luxury District, Premium City</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="border-t border-amber-200/10 pt-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-6">
                <span className="text-gray-300 text-sm font-medium">Follow our journey:</span>
                <div className="flex items-center gap-4">
                  {[
                    { icon: Instagram, href: '#', label: 'Instagram', hoverColor: 'hover:text-pink-400' },
                    { icon: Twitter, href: '#', label: 'Twitter', hoverColor: 'hover:text-blue-400' },
                    { icon: Youtube, href: '#', label: 'YouTube', hoverColor: 'hover:text-red-400' },
                    { icon: MessageCircle, href: '#', label: 'WhatsApp', hoverColor: 'hover:text-green-400' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={cn(
                        'w-10 h-10 rounded-full bg-white/8 backdrop-blur-sm border border-white/20',
                        'flex items-center justify-center text-gray-300 transition-all duration-300',
                        'hover:bg-white/12 hover:border-white/30 hover:scale-110',
                        social.hoverColor,
                      )}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 text-gray-300 text-sm">
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>Stay updated with luxury insights</span>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    'bg-white/8 backdrop-blur-sm border border-white/20',
                    'text-white hover:bg-white/12 hover:text-white hover:border-white/30',
                    'px-6 py-2 rounded-xl transition-all duration-300',
                    'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                  )}
                >
                                    Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-amber-200/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-gray-400 text-sm">
                <span>&copy; {new Date().getFullYear()} Sheikh Shop. All rights reserved.</span>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">Privacy Policy</a>
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">Terms of Service</a>
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">Cookie Policy</a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Secure & Trusted</span>
                <span className="text-amber-300">•</span>
                <Heart className="w-4 h-4 text-amber-300" />
                <span>Crafted with Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
