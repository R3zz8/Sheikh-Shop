'use client';

export default function ArticleLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
      </div>

      <div className="relative z-10">
        {/* Breadcrumbs Skeleton */}
        <div className="container mx-auto px-6 pt-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-white/10 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Hero Section Skeleton */}
        <div className="relative w-full h-[60vh] md:h-[70vh] bg-white/10 animate-pulse">
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <div className="h-12 md:h-16 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Article Meta Skeleton */}
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
              <div className="flex flex-wrap items-center gap-6 mb-4">
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-white/10 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Article Content Skeleton */}
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 mb-8">
              <div className="space-y-4">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Social Sharing Skeleton */}
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
                <div className="flex gap-3">
                  <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-20 bg-white/10 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Related Articles Skeleton */}
            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15">
              <div className="h-6 w-40 bg-white/10 rounded animate-pulse mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4">
                    <div className="h-32 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-white/10 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
