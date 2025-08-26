export default function ArticlesSkeleton() {
    return (
        <div className="space-y-8">
            {[1, 2, 3].map((index) => (
                <div
                    key={`skeleton-${index}`}
                    className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 animate-pulse"
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Skeleton */}
                        <div className="relative w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-700" />

                        {/* Content Skeleton */}
                        <div className="flex-1 space-y-3">
                            {/* Date Skeleton */}
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-600 rounded" />
                                <div className="w-24 h-4 bg-gray-600 rounded" />
                            </div>

                            {/* Title Skeleton */}
                            <div className="space-y-2">
                                <div className="w-3/4 h-8 bg-gray-600 rounded" />
                                <div className="w-1/2 h-8 bg-gray-600 rounded" />
                            </div>

                            {/* Summary Skeleton */}
                            <div className="space-y-2">
                                <div className="w-full h-4 bg-gray-600 rounded" />
                                <div className="w-5/6 h-4 bg-gray-600 rounded" />
                                <div className="w-4/6 h-4 bg-gray-600 rounded" />
                            </div>

                            {/* Read More Skeleton */}
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-4 bg-gray-600 rounded" />
                                <div className="w-4 h-4 bg-gray-600 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 