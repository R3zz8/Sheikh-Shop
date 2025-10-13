import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedArticleForm from '../_components/EnhancedArticleForm';
import { checkAccess } from '@/lib/checkAccess';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Loading skeleton for the form
function ArticleFormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function NewArticlePage() {
  // Check if user has permission to create articles
  const hasPermission = await checkAccess(
    new Request('http://localhost:3000'), // Mock request for server-side check
    ['SUPERADMIN', 'ADMIN', 'EDITOR', 'AUTHOR']
  );

  if (!hasPermission) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
          <p className="text-gray-600 mt-2">
            Create a new article with enhanced SEO optimization and structured data.
          </p>
        </div>

        <Suspense fallback={<ArticleFormSkeleton />}>
          <EnhancedArticleForm />
        </Suspense>
      </div>
    </div>
  );
}