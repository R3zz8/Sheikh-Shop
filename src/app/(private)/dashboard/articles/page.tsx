import { requireSuperAdmin } from '@/lib/auth/server-auth';
import SimpleArticlesDashboard from './_components/SimpleArticlesDashboard';
export const dynamic = 'force-dynamic';

export default async function DashboardArticlesPage() {
  // Server-side authentication - redirects to login if not authenticated
  await requireSuperAdmin();

  return (
    <div className="container mx-auto p-6">
      <SimpleArticlesDashboard />
    </div>
  );
} 