// src/app/affiliate/page.tsx
import React from 'react';
import { Metadata } from 'next';
import AffiliateLandingPageComponent from '@/components/affiliate/AffiliateLandingPage';

export const metadata: Metadata = {
  title: 'Join Sheikh Shop Affiliate Program | Earn up to 25% Commission',
  description: 'Partner with Sheikh Shop and earn commissions promoting premium saffron, dates, and honey worldwide.',
  keywords: 'affiliate program, saffron affiliate, organic products affiliate, luxury food affiliate',
};

const AffiliateLandingPage = () => {
  return <AffiliateLandingPageComponent />;
};

export default AffiliateLandingPage;
