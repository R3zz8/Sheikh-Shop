import { Suspense } from 'react';
import { getArticles } from '@/lib/actions/articles';
import ArticlesList from './_components/ArticlesList';
import type { ArticleWithAuthor } from '@/types';
import ArticlesSkeleton from './_components/ArticlesSkeleton';

// Force dynamic rendering to prevent build-time database queries
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'مقالات آموزنده | فروشگاه شیخ',
    description: 'مقالات آموزنده در مورد محصولات برتر، فواید سلامتی و برتری‌های غذایی را کشف کنید.',
};

async function fetchArticles() {
    try {
        const result = await getArticles();
        if (result.success) {
            return result.data;
        } else {
            console.error('Error fetching articles:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

export default async function ArticlesPage() {
    const articles = (await fetchArticles()) as ArticleWithAuthor[];

    if (!articles || articles.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden font-vazirmatn" dir="rtl">
                {/* Background effects matching header/footer */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
                </div>

                <div className="relative z-10 container mx-auto px-6 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
                            مقالات
                        </h1>
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-12 border border-white/15">
                            <p className="text-xl text-gray-300 mb-6">
                                در حال حاضر هیچ مقاله‌ای موجود نیست.
                            </p>
                            <p className="text-gray-400">
                                به زودی برای مطالب آموزنده درباره محصولات ویژه ما دوباره سر بزنید.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden font-vazirmatn" dir="rtl">
            {/* Background effects matching header/footer */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white text-center mb-12 tracking-tight">
                        مقالات
                    </h1>

                    <Suspense fallback={<ArticlesSkeleton />}>
                        <ArticlesList articles={articles} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
