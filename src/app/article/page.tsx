import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ArticlesList from './_components/ArticlesList';
import ArticlesSkeleton from './_components/ArticlesSkeleton';

export const metadata = {
    title: 'Articles - Sheikh Shop',
    description: 'Discover insightful articles about premium products, health benefits, and culinary excellence.',
};

async function getArticles() {
    try {
        const articles = await prisma.article.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return articles;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

export default async function ArticlesPage() {
    const articles = await getArticles();

    if (!articles || articles.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
                {/* Background effects matching header/footer */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
                </div>

                <div className="relative z-10 container mx-auto px-6 py-16">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-serif text-white mb-8 tracking-tight">
                            Articles
                        </h1>
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-12 border border-white/15">
                            <p className="text-xl text-gray-300 mb-6">
                                No articles available at the moment.
                            </p>
                            <p className="text-gray-400">
                                Check back soon for insightful content about our premium products.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
            {/* Background effects matching header/footer */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-serif text-white text-center mb-12 tracking-tight">
                        Articles
                    </h1>

                    <Suspense fallback={<ArticlesSkeleton />}>
                        <ArticlesList articles={articles} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
} 