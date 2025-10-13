import { Suspense } from 'react';
import type { Metadata } from 'next';
import { checkAccess } from '@/lib/checkAccess';
import { redirect } from 'next/navigation';
import { getAnalyticsData } from '@/lib/actions/analytics';
import AnalyticsDashboard from './_components/AnalyticsDashboard';
import AnalyticsLoadingSkeleton from './_components/AnalyticsLoadingSkeleton';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - Sheikh Shop Admin',
  description: 'Real-time analytics and performance metrics for articles and content.',
};

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  // Check user permissions (only ADMIN+ can access analytics)
  const hasPermission = await checkAccess(
    new Request('http://localhost:3000'), // Mock request for server-side check
    ['SUPERADMIN', 'ADMIN']
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time insights into article performance, engagement metrics, and content analytics.
        </p>
      </div>

      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  );
}
