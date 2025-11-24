// src/app/(private)/dashboard/mobile-carousel/page.tsx
import { requireSuperAdmin } from '@/lib/auth/server-auth';
import MobileCarouselClient from './_components/MobileCarouselClient';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function DashboardMobileCarouselPage() {
  await requireSuperAdmin();

  return (
    <div>
      <MobileCarouselClient />
    </div>
  );
}
