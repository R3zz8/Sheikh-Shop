import { requireSuperAdmin } from '@/lib/auth/server-auth';
import MarketingShowcaseDashboardView from '@/modules/marketing-showcase/views/MarketingShowcaseDashboardView';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function DashboardMarketingShowcasePage() {
  await requireSuperAdmin();

  return (
    <div>
      <MarketingShowcaseDashboardView />
    </div>
  );
}
