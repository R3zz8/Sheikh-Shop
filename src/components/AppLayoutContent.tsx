'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ClientHeader from '@/components/ClientHeader';
import Footer from '@/components/footer/footer';
import MobileFooter from '@/components/MobileFooter';
import AccessibilityEnhancements from '@/components/accessibility/AccessibilityEnhancements';
import { ShoppingChatbot, EnhancedAISearch } from '@/components/DynamicClientComponents';
import PrePurchaseNoticeModal from '@/components/notice/PrePurchaseNoticeModal';
import AMPHead from '@/components/seo/AMPHead';
import LayoutDebugger from '@/components/LayoutDebugger';

interface AppLayoutContentProps {
  children: React.ReactNode;
}

export default function AppLayoutContent({ children }: AppLayoutContentProps) {
  const pathname = usePathname();
  const isMaintenance = pathname === '/maintenance';

  if (isMaintenance) {
    return (
      <main id="main-content" className="w-full min-h-screen">
        {children}
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LayoutDebugger />
      <AMPHead />
      <AccessibilityEnhancements />
      <ClientHeader />
      <div className="sticky top-20 z-40 w-full bg-amber-950/90 backdrop-blur supports-[backdrop-filter]:bg-amber-950/70 border-b border-amber-200/10 min-h-[123px] flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full">
          <div className="w-full md:max-w-xl min-h-[98px]">
            <EnhancedAISearch showAdvancedOptions={false} showVRStoreButton={true} />
          </div>
        </div>
      </div>
      <main id="main-content" style={{ minHeight: '100vh' }} className="flex-1 w-full min-h-screen pt-20 pb-20 md:pb-0">
        <div style={{ minHeight: '100vh' }} className="w-full min-h-screen">
          {children}
        </div>
      </main>
      <Footer />
      <MobileFooter />
      <ShoppingChatbot />
      <PrePurchaseNoticeModal />
    </div>
  );
}
