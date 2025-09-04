import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/actions/articles';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleWithAuthor } from '@/types';

interface ArticlePageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const result = await getArticleById(params.slug);
    
    if (!result.success || !result.data) {
        return {
            title: 'Article Not Found - Sheikh Shop',
        };
    }

    return {
        title: `${result.data.title} - Sheikh Shop`,
        description: result.data.summary,
    };
}

async function getArticle(slug: string): Promise<ArticleWithAuthor | null> {
    try {
        const result = await getArticleById(slug);
        if (result.success && result.data) {
            return result.data as ArticleWithAuthor;
        }
        return null;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const article = await getArticle(params.slug);

    if (!article) {
        notFound();
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(date));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
            {/* Background effects matching header/footer */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
            </div>

            <div className="relative z-10 container mx-auto px-6 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <Link
                        href="/article"
                        className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors duration-300 mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        <span>Back to Articles</span>
                    </Link>

                    {/* Article Header */}
                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 mb-8">
                        {/* Article Image */}
                        {article.imageUrl && (
                            <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
                                <Image
                                    src={article.imageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 800px"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                            </div>
                        )}

                        {/* Article Meta */}
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 text-gray-400 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(article.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>By {article.author.email}</span>
                            </div>
                        </div>

                        {/* Article Title */}
                        <h1 className="text-4xl md:text-5xl font-serif text-white font-bold leading-tight mb-6">
                            {article.title}
                        </h1>

                        {/* Article Summary */}
                        <p className="text-xl text-gray-300 leading-relaxed">
                            {article.summary}
                        </p>
                    </div>

                    {/* Article Content */}
                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15">
                        <div className="prose prose-invert prose-lg max-w-none">
                            <div
                                className="text-gray-300 leading-relaxed space-y-6"
                                dangerouslySetInnerHTML={{ __html: article.content }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 