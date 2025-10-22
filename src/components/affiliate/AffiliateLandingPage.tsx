// src/components/affiliate/AffiliateLandingPage.tsx
import React from 'react';
import Hero from './Hero';
import WhyPartnerWithUs from './WhyPartnerWithUs';
import CommissionRates from './CommissionRates';
import HowItWorks from './HowItWorks';
import Testimonials from './Testimonials';
import JoinForm from './JoinForm';

const AffiliateLandingPage = () => {
  return (
    <div className="bg-gray-900">
      <Hero />
      <WhyPartnerWithUs />
      <CommissionRates />
      <HowItWorks />
      <Testimonials />
      <JoinForm />
    </div>
  );
};

export default AffiliateLandingPage;
