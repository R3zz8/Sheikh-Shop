'use client';

import React from 'react';
import WebHero from '../components/WebHero';
import WebServicesSection from '../components/WebServicesSection';
import WebCalculatorSection from '../components/WebCalculatorSection';
import WebWhyUsSection from '../components/WebWhyUsSection';
import WebProcessSection from '../components/WebProcessSection';
import WebPortfolioSection from '../components/WebPortfolioSection';
import WebFaqSection from '../components/WebFaqSection';

interface WebPageViewProps {
  services: any[];
  rules: any[];
  portfolio: any[];
  faqs: any[];
}

export default function WebPageView({
  services,
  rules,
  portfolio,
  faqs,
}: WebPageViewProps) {
  return (
    <main className="min-h-screen bg-stone-950 text-white font-vazirmatn dir-rtl">
      {/* 1. Hero Section */}
      <WebHero />

      {/* 2. Services Section */}
      <WebServicesSection services={services} />

      {/* 3. Interactive Price Calculator Section */}
      <WebCalculatorSection rules={rules} />

      {/* 4. Why Sheikh Web - Technical Advantages Section */}
      <WebWhyUsSection />

      {/* 5. Development Process Section */}
      <WebProcessSection />

      {/* 6. Portfolio Section */}
      <WebPortfolioSection items={portfolio} />

      {/* 7. FAQ Section */}
      <WebFaqSection faqs={faqs} />
    </main>
  );
}
