import { Suspense } from 'react';
import { getAllArticlesForAdmin } from '@/lib/actions/articles';
import ArticlesDashboard from './_components/ArticlesDashboard';
import { Skeleton } from '@/components/ui/skeleton';
export const dynamic = 'force-dynamic';

// Loading skeleton for the dashboard
function ArticlesDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-lg border p-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="h-32 bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 bg-white rounded-lg border overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fetch articles for server-side rendering (admin only)
async function getArticles() {
  try {
    const result = await getAllArticlesForAdmin();
    if (result.success) {
      return result.data;
    } else {
      console.error('Error fetching articles:', result.error);
      // Return empty array instead of throwing - let the client handle the error
      return [];
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Return empty array instead of throwing - let the client handle the error
    return [];
  }
}

export default async function DashboardArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<ArticlesDashboardSkeleton />}>
        <ArticlesDashboard initialArticles={articles} />
      </Suspense>
    </div>
  );
} 