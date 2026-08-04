'use client';

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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="relative w-full">
      {/* Consultation CTA Section */}
      <div className="relative bg-gradient-to-r from-amber-900/80 via-orange-900/80 to-yellow-900/80 backdrop-blur-xl border-t border-amber-200/20" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-yellow-500/5" />
        <div className="relative z-10 w-full flex justify-center py-8 px-4">
          <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-right">
            <div className="text-right">
              <div className="flex items-center justify-start gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                <h3 className="text-[18px] md:text-[20px] font-bold text-white">نیاز به مشاوره تخصصی دارید؟</h3>
              </div>
              <p className="text-amber-100 text-[16px] md:text-[17px] opacity-90 leading-relaxed">از راهنمایی‌های اختصاصی کارشناسان محصولات لوکس ما بهره‌مند شوید</p>
            </div>
            <Button
              className={cn(
                'bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600',
                'hover:from-amber-700 hover:via-yellow-700 hover:to-orange-700',
                'text-white font-bold text-[16px] md:text-[18px] px-8 py-3 rounded-xl border border-amber-500/30',
                'shadow-lg hover:shadow-xl hover:shadow-amber-900/30 transition-all duration-300',
                'transform hover:-translate-y-0.5 backdrop-blur-sm',
                'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
              )}
            >
              <Crown className="w-5 h-5 ml-2" />
              دریافت مشاوره
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 backdrop-blur-2xl border-t border-amber-200/10" dir="rtl">
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
                <h3 className="text-[26px] font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent select-none">
                  فروشگاه شیخ
                </h3>
              </div>
              <p className="text-gray-300 text-[16px] leading-relaxed mb-4">
                ارائه‌دهنده مرغوب‌ترین محصولات ممتاز با کیفیت استثنایی و اصالت بی‌نظیر. تعریف دوباره شکوه و زیبایی شرقی.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-300 text-[16px]">
                <Star className="w-4 h-4" />
                <span>ضمانت کیفیت محصولات ممتاز</span>
              </div>
            </div>

            {/* 2-Column Grid Layout - Mobile */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-right" dir="rtl">
              {/* Shop Section */}
              <div className="text-right">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-amber-300" />
                  <h4 className="text-[18px] font-bold text-white">محصولات</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    { name: 'محصولات غذایی شیخ', href: '/sheikh-food', aria: 'صفحه محصولات غذایی شیخ' },
                    { name: 'شیخ دیجیتال', href: '/sheikh-digital', aria: 'صفحه شیخ دیجیتال' },
                    { name: 'لوازم خانگی شیخ', href: '/sheikh-home', aria: 'صفحه لوازم خانگی شیخ' },
                    { name: 'شیخ نوا', href: '/tech-products', aria: 'صفحه شیخ نوا' },
                    { name: 'طراحی سایت', href: '/about', aria: 'صفحه درباره ما و سفارش طراحی سایت' },
                  ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          prefetch={true}
                          aria-label={item.aria}
                          className={cn(
                            'transition-all duration-300 text-[16px]',
                            'flex items-center gap-2 group',
                            isActive
                              ? 'text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-gray-300 hover:text-amber-200'
                          )}
                        >
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Company Section */}
              <div className="text-right">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <Users className="w-5 h-5 text-amber-300" />
                  <h4 className="text-[18px] font-bold text-white">شرکت</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    { name: 'درباره ما', href: '#' },
                    { name: 'داستان ما', href: '#' },
                    { name: 'تماس با ما', href: '#' },
                  ].map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={cn(
                          'text-gray-300 hover:text-amber-200 transition-all duration-300 text-[16px]',
                          'flex items-center gap-2 group',
                        )}
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180" />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Horizontal Social Icons - Mobile */}
            <div className="text-center mb-6">
              <span className="text-gray-300 text-[16px] font-medium mb-4 block">همراه ما باشید</span>
              <div className="flex items-center justify-center gap-4">
                {[
                  { icon: Instagram, href: 'https://www.instagram.com/sheikh._.shops?igsh=MW41bXhqcmlxNG82Mw==', label: 'Instagram', hoverColor: 'hover:text-pink-400' },
                  { icon: Twitter, href: '#', label: 'Twitter', hoverColor: 'hover:text-blue-400' },
                  { icon: Youtube, href: 'https://www.youtube.com/@Fuzzel_Fun', label: 'YouTube', hoverColor: 'hover:text-red-400' },
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

            {/* Trust Section - Mobile */}
            <div className="bg-amber-950/20 backdrop-blur-md rounded-xl border border-amber-500/25 p-5 mb-6 text-center overflow-hidden flex flex-col items-center justify-center">
              <h4 className="text-[15px] font-bold text-amber-200 mb-3 tracking-wide">
                نماد اعتماد الکترونیکی
              </h4>

              <div className="bg-neutral-900/50 rounded-lg p-2 border border-amber-500/10 inline-flex items-center justify-center mb-3 transition-colors duration-300 hover:border-amber-500/30">
                <a
                  referrerPolicy="origin"
                  target="_blank"
                  href="https://trustseal.enamad.ir/?id=764844&Code=llkuvWwCWtMYak50jjDsj3yYjWoxjTdF"
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg p-1 block"
                  aria-label="نماد اعتماد الکترونیکی فروشگاه شیخ"
                >
                  <img
                    referrerPolicy="origin"
                    src="https://trustseal.enamad.ir/logo.aspx?id=764844&Code=llkuvWwCWtMYak50jjDsj3yYjWoxjTdF"
                    alt="نماد اعتماد الکترونیکی فروشگاه شیخ"
                    style={{ cursor: 'pointer' }}
                    width={100}
                    height={100}
                    className="object-contain w-[100px] h-[100px]"
                    {...{ code: "llkuvWwCWtMYak50jjDsj3yYjWoxjTdF" }}
                  />
                </a>
              </div>

              <p className="text-gray-300 text-[13px] leading-relaxed max-w-[280px] mx-auto opacity-90">
                فروشگاه شیخ دارای نماد اعتماد الکترونیکی می‌باشد.
              </p>
            </div>

            {/* Essential Links - Mobile */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-3">
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">حریم خصوصی</a>
                <span className="text-amber-300">•</span>
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">قوانین و مقررات</a>
                <span className="text-amber-300">•</span>
                <a href="#" className="hover:text-amber-200 transition-colors duration-300">کوکی‌ها</a>
              </div>
              <div className="text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} فروشگاه شیخ. تمامی حقوق محفوظ است.
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Footer - Unchanged structure but polished sizing and localization */}
        <div className="hidden md:block relative z-10 max-w-7xl mx-auto py-16 px-6 md:px-8 text-right" dir="rtl">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">

            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6 justify-start">
                <Crown className="w-8 h-8 text-amber-300" />
                <h3 className="text-[26px] md:text-[30px] font-bold bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 bg-clip-text text-transparent select-none">
                  فروشگاه شیخ
                </h3>
              </div>
              <p className="text-gray-300 text-[16px] lg:text-[17px] xl:text-[18px] leading-relaxed mb-6">
                ارائه‌دهنده مرغوب‌ترین محصولات ممتاز با کیفیت استثنایی و اصالت بی‌نظیر. تجربه دوباره شکوه و زیبایی شرقی.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-[16px] justify-start">
                <Star className="w-4 h-4" />
                <span>ضمانت کیفیت محصولات ممتاز</span>
              </div>
            </div>

            {/* Shop Section */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-6 justify-start">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <h4 className="text-[18px] font-bold text-white">محصولات</h4>
              </div>
              <ul className="space-y-3">
                {[
                  { name: 'محصولات غذایی شیخ', href: '/sheikh-food', aria: 'صفحه محصولات غذایی شیخ' },
                  { name: 'شیخ دیجیتال', href: '/sheikh-digital', aria: 'صفحه شیخ دیجیتال' },
                  { name: 'لوازم خانگی شیخ', href: '/sheikh-home', aria: 'صفحه لوازم خانگی شیخ' },
                  { name: 'شیخ نوا', href: '/tech-products', aria: 'صفحه شیخ نوا' },
                  { name: 'طراحی سایت', href: '/about', aria: 'صفحه درباره ما و سفارش طراحی سایت' },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        aria-label={item.aria}
                        className={cn(
                          'transition-all duration-300 text-[16px] lg:text-[17px] xl:text-[18px]',
                          'flex items-center gap-2 group justify-start',
                          isActive
                            ? 'text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-gray-300 hover:text-amber-200'
                        )}
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Help & Support */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-6 justify-start">
                <HelpCircle className="w-5 h-5 text-amber-300" />
                <h4 className="text-[18px] font-bold text-white">راهنمایی و پشتیبانی</h4>
              </div>
              <ul className="space-y-3">
                {[
                  { name: 'خدمات مشتریان', href: '#' },
                  { name: 'اطلاعات ارسال سفارش', href: '#' },
                  { name: 'مرجوعی و تعویض', href: '#' },
                  { name: 'راهنمای خرید لوکس', href: '#' },
                  { name: 'سوالات متداول', href: '/faq' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'text-gray-300 hover:text-amber-200 transition-all duration-300 text-[16px] lg:text-[17px] xl:text-[18px]',
                        'flex items-center gap-2 group justify-start',
                      )}
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Legal */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-6 justify-start">
                <Users className="w-5 h-5 text-amber-300" />
                <h4 className="text-[18px] font-bold text-white">شرکت</h4>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  { name: 'درباره ما', href: '/about-us' },
                  { name: 'داستان برند شیخ', href: '#' },
                  { name: 'مسئولیت اجتماعی', href: '#' },
                  { name: 'همکاری با ما', href: '#' },
                  { name: 'اخبار و مقالات', href: '/article' },
                ].map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className={cn(
                        'text-gray-300 hover:text-amber-200 transition-all duration-300 text-[16px] lg:text-[17px] xl:text-[18px]',
                        'flex items-center gap-2 group justify-start',
                      )}
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all duration-300 rotate-180" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300 text-[16px] lg:text-[17px] xl:text-[18px] justify-start">
                  <Phone className="w-4 h-4 text-amber-300" />
                  <span dir="ltr" className="inline-block text-right select-all">+98 917 876 9556</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-[16px] lg:text-[17px] xl:text-[18px] justify-start">
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>sheikhshops.com@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 text-[16px] lg:text-[17px] xl:text-[18px] justify-start">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>ایران، بوشهر، مرکز شهر</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust & Certifications Section - Desktop */}
          <div className="border-t border-amber-200/10 pt-8 mb-8" dir="rtl">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-amber-500/20 shadow-xl shadow-amber-950/20 p-8 flex flex-col items-center gap-6 transition-all duration-300 hover:border-amber-500/40 hover:shadow-amber-500/5 hover:scale-[1.01] group">
              <h3 className="text-[18px] font-bold text-white tracking-wide border-b border-amber-500/20 pb-2 mb-2">
                نمادها و مجوزهای فروشگاه شیخ
              </h3>

              {/* Badges Container - visually centered with space for future additional badges */}
              <div className="flex flex-wrap items-center justify-center gap-12">
                {/* eNamad Trust Seal */}
                <div className="relative p-3 bg-neutral-900/60 rounded-xl border border-amber-500/15 shadow-inner flex items-center justify-center transition-all duration-300 hover:border-amber-500/30 w-[150px] h-[150px] overflow-hidden">
                  <a
                    referrerPolicy="origin"
                    target="_blank"
                    href="https://trustseal.enamad.ir/?id=764844&Code=llkuvWwCWtMYak50jjDsj3yYjWoxjTdF"
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-lg p-1 block"
                    aria-label="نماد اعتماد الکترونیکی فروشگاه شیخ"
                  >
                    <img
                      referrerPolicy="origin"
                      src="https://trustseal.enamad.ir/logo.aspx?id=764844&Code=llkuvWwCWtMYak50jjDsj3yYjWoxjTdF"
                      alt="نماد اعتماد الکترونیکی فروشگاه شیخ"
                      style={{ cursor: 'pointer' }}
                      width={125}
                      height={125}
                      className="object-contain w-[125px] h-[125px]"
                      {...{ code: "llkuvWwCWtMYak50jjDsj3yYjWoxjTdF" }}
                    />
                  </a>
                </div>

                {/* Placeholder for future badges */}
                <div className="relative p-3 bg-neutral-900/20 rounded-xl border border-dashed border-white/5 flex items-center justify-center w-[150px] h-[150px] select-none text-center">
                  <span className="text-xs text-gray-500 font-medium">مجوزهای دیگر<br/>(بزودی)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div className="border-t border-amber-200/10 pt-8 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Social Media */}
              <div className="flex items-center gap-6">
                <span className="text-gray-300 text-[16px] font-medium">همراه ما باشید:</span>
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
                <div className="hidden md:flex items-center gap-2 text-gray-300 text-[16px]">
                  <Mail className="w-4 h-4 text-amber-300" />
                  <span>از جدیدترین محصولات و تخفیف‌ها مطلع شوید</span>
                </div>
                <Button
                  variant="outline"
                  className={cn(
                    'bg-white/8 backdrop-blur-sm border border-white/20',
                    'text-white hover:bg-white/12 hover:text-white hover:border-white/30',
                    'px-6 py-2 rounded-xl text-[16px] font-bold transition-all duration-300',
                    'focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2',
                  )}
                >
                  عضویت در خبرنامه
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-amber-200/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-gray-400 text-[16px]">
                <span>&copy; {new Date().getFullYear()} فروشگاه شیخ. تمامی حقوق محفوظ است.</span>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">حریم خصوصی</a>
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">قوانین خدمات</a>
                  <a href="#" className="hover:text-amber-200 transition-colors duration-300">سیاست کوکی‌ها</a>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-[16px]">
                <Shield className="w-4 h-4 text-amber-300" />
                <span>امن و قابل اعتماد</span>
                <span className="text-amber-300">•</span>
                <Heart className="w-4 h-4 text-amber-300" />
                <span>ساخته شده با نهایت ظرافت و اصالت</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
