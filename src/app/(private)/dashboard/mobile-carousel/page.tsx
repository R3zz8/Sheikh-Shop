// src/app/(private)/dashboard/mobile-carousel/page.tsx
import { requireSuperAdmin } from '@/lib/auth/server-auth';
import MobileCarouselDashboardView from '@/modules/mobile-carousel/views/MobileCarouselDashboardView';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function DashboardMobileCarouselPage() {
  await requireSuperAdmin();

  return (
    <div>
      <MobileCarouselDashboardView />
    </div>
  );
}
