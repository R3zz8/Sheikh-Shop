import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/utils/prisma';
import WebPageView from '@/modules/web/views/WebPageView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'طراحی سایت حرفه‌ای و اختصاصی | شیخ وب',
  description: 'طراحی و توسعه سایت‌های فروشگاهی، خدماتی، شرکتی، پزشکی و اختصاصی با معماری Full-Stack توسط شیخ وب.',
  alternates: {
    canonical: '/web',
  },
  openGraph: {
    title: 'طراحی سایت حرفه‌ای و اختصاصی | شیخ وب',
    description: 'طراحی و توسعه سایت‌های فروشگاهی، خدماتی، شرکتی، پزشکی و اختصاصی با معماری Full-Stack توسط شیخ وب.',
    url: '/web',
    type: 'website',
    siteName: 'شیخ وب',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'طراحی سایت حرفه‌ای و اختصاصی | شیخ وب',
    description: 'طراحی و توسعه وب‌سایت‌های سریع، اختصاصی و مدرن با معماری Full-Stack توسط شیخ وب.',
  },
};

export default async function WebPage() {
  let services = [];
  let rules = [];
  let portfolio = [];
  let faqs = [];

  try {
    [services, rules, portfolio, faqs] = await Promise.all([
      prisma.webService.findMany({
        where: { isActive: true },
        include: {
          packages: {
            where: { isActive: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.webCalculatorRule.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.webPortfolio.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.webFaq.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ]);
  } catch (error) {
    console.error('[WEB_PAGE_DB_ERROR] Failed to fetch Sheikh Web page data:', error);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'شیخ وب - دپارتمان تخصصی طراحی و توسعه وب',
    description: 'طراحی و توسعه وب‌سایت‌های سریع، اختصاصی و حرفه‌ای با معماری Full-Stack.',
    url: 'https://sheikhshop.com/web',
    priceRange: '۳۵,۰۰۰,۰۰۰ تومان - ۹۰,۰۰۰,۰۰۰+ تومان',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
    },
    knowsAbout: [
      'طراحی سایت فروشگاهی',
      'طراحی سایت شرکتی',
      'طراحی سایت خدماتی',
      'طراحی سایت پزشکی',
      'طراحی سایت آموزشی',
      'توسعه پلتفرم اختصاصی',
      'Next.js',
      'Full-Stack Web Development',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WebPageView
        services={JSON.parse(JSON.stringify(services))}
        rules={JSON.parse(JSON.stringify(rules))}
        portfolio={JSON.parse(JSON.stringify(portfolio))}
        faqs={JSON.parse(JSON.stringify(faqs))}
      />
    </>
  );
}
