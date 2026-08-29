'use client';

import React, { useState } from 'react';
import { ShoppingBag, Briefcase, Building2, Stethoscope, GraduationCap, Cpu, CheckCircle2, Clock, Sparkles, ArrowLeft, Layers, ShieldCheck } from 'lucide-react';

interface WebServicePackage {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  description?: string | null;
  features: string[];
  badge?: string | null;
  isPopular?: boolean;
}

interface WebService {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string | null;
  startingPrice: number;
  previousPrice?: number | null;
  currency: string;
  isStartingFrom: boolean;
  features: string[];
  estimatedDelivery?: string | null;
  icon?: string | null;
  isFeatured?: boolean;
  ctaText?: string | null;
  ctaUrl?: string | null;
  packages?: WebServicePackage[];
}

interface WebServicesSectionProps {
  services: WebService[];
}

const getServiceIcon = (iconName?: string | null, slug?: string) => {
  switch (iconName || slug) {
    case 'ShoppingBag':
    case 'ecommerce':
      return ShoppingBag;
    case 'Briefcase':
    case 'service':
      return Briefcase;
    case 'Building2':
    case 'corporate':
      return Building2;
    case 'Stethoscope':
    case 'medical':
      return Stethoscope;
    case 'GraduationCap':
    case 'educational':
      return GraduationCap;
    case 'Cpu':
    case 'custom':
    default:
      return Cpu;
  }
};

const formatToman = (amount: number) => {
  return new Intl.NumberFormat('fa-IR').format(amount);
};

export default function WebServicesSection({ services }: WebServicesSectionProps) {
  const [selectedService, setSelectedService] = useState<WebService | null>(null);

  return (
    <section id="services" className="py-16 md:py-24 bg-stone-900 font-vazirmatn text-right relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>خدمات تخصصی طراحی و توسعه</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            توسعه پلتفرم‌های تخصصی بر اساس نیاز شما
          </h2>
          <p className="text-stone-300 text-sm sm:text-lg leading-relaxed">
            از وب‌سایت‌های فروشگاهی پرسرعت تا سامانه‌های پیجیده سازمانی و پلتفرم‌های اختصاصی
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = getServiceIcon(service.icon, service.slug);
            const hasPackages = service.packages && service.packages.length > 0;

            return (
              <div
                key={service.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] ${
                  service.isFeatured
                    ? 'bg-gradient-to-b from-stone-900 via-amber-950/30 to-stone-950 border-2 border-amber-500/50 shadow-[0_15px_40px_rgba(245,158,11,0.15)]'
                    : 'bg-stone-950/80 border border-stone-800 hover:border-amber-500/30 shadow-xl'
                }`}
              >
                {/* Badge if featured */}
                {service.isFeatured && (
                  <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 text-xs font-black px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>ویژه شیخ</span>
                  </div>
                )}

                <div>
                  {/* Service Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{service.title}</h3>
                      {service.estimatedDelivery && (
                        <div className="flex items-center gap-1.5 text-stone-400 text-xs font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>تحویل: {service.estimatedDelivery}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Short description */}
                  <p className="text-stone-300 text-sm leading-relaxed mb-6 font-normal">
                    {service.shortDescription}
                  </p>

                  {/* Features Checklist */}
                  {service.features && service.features.length > 0 && (
                    <ul className="space-y-2.5 mb-8">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Footer Pricing & CTA */}
                <div className="pt-6 border-t border-stone-800/80 mt-auto">
                  <div className="flex items-baseline justify-between mb-6">
                    <span className="text-xs text-stone-400 font-semibold">
                      {service.isStartingFrom ? 'شروع قیمت از:' : 'قیمت:'}
                    </span>
                    <div className="text-left">
                      {service.previousPrice && (
                        <span className="text-xs text-stone-500 line-through block mb-0.5">
                          {formatToman(service.previousPrice)} تومان
                        </span>
                      )}
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        {formatToman(service.startingPrice)}
                      </span>
                      <span className="text-xs text-stone-400 mr-1">تومان</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <a href="#calculator" className="block w-full">
                      <button className="w-full min-h-[46px] px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-bold text-sm shadow-md hover:shadow-amber-500/25 transition-all duration-300 flex items-center justify-center gap-2 group">
                        <span>{service.ctaText || 'محاسبه قیمت و سفارش'}</span>
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      </button>
                    </a>

                    {hasPackages && (
                      <button
                        onClick={() => setSelectedService(service)}
                        className="w-full py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-amber-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>مشاهده پکیج‌های سه‌گانه ({service.packages?.length} تعرفه)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Packages Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-stone-800">
              <div>
                <span className="text-amber-400 text-xs font-bold block mb-1">پکیج‌های تعرفه‌ای</span>
                <h3 className="text-xl sm:text-2xl font-black text-white">{selectedService.title}</h3>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-10 h-10 rounded-full bg-stone-800 text-stone-300 hover:bg-stone-700 flex items-center justify-center font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedService.packages?.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between ${
                    pkg.isPopular
                      ? 'bg-gradient-to-b from-stone-900 via-amber-950/40 to-stone-950 border-2 border-amber-500 shadow-xl'
                      : 'bg-stone-950 border border-stone-800'
                  }`}
                >
                  <div>
                    {pkg.badge && (
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-3">
                        {pkg.badge}
                      </span>
                    )}
                    <h4 className="text-xl font-bold text-white mb-2">{pkg.name}</h4>
                    {pkg.description && (
                      <p className="text-stone-400 text-xs mb-4">{pkg.description}</p>
                    )}

                    <div className="mb-6 pb-4 border-b border-stone-800">
                      {pkg.oldPrice && (
                        <span className="text-xs text-stone-500 line-through block mb-0.5">
                          {formatToman(pkg.oldPrice)} تومان
                        </span>
                      )}
                      <span className="text-2xl font-black text-amber-300">
                        {formatToman(pkg.price)}
                      </span>
                      <span className="text-xs text-stone-400 mr-1">تومان</span>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a href="#calculator" onClick={() => setSelectedService(null)}>
                    <button className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors">
                      انتخاب این پکیج
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
