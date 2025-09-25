import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles } from '@/lib/actions/articles';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, Tag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleWithAuthor } from '@/types';
import { generateArticleMetadata } from '@/lib/seo/metadata';
import { Suspense } from 'react';
import ArticleLoadingSkeleton from './_components/ArticleLoadingSkeleton';
import RelatedArticles from './_components/RelatedArticles';
import SocialSharing from './_components/SocialSharing';
import Breadcrumbs from './_components/Breadcrumbs';

interface ArticlePageProps {
    params: {
        slug: string;
    };
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const result = await getArticleBySlug(params.slug);
    
    if (!result.success || !result.data) {
        return {
            title: 'Article Not Found - Sheikh Shop',
        };
    }

    return generateArticleMetadata({
        title: result.data.title,
        summary: result.data.summary,
        slug: result.data.slug,
        imageUrl: result.data.imageUrl || undefined,
        category: result.data.category || undefined,
        tags: result.data.tags || [],
    });
}

async function getArticle(slug: string): Promise<ArticleWithAuthor | null> {
    try {
        const result = await getArticleBySlug(slug);
        if (result.success && result.data) {
            return result.data as ArticleWithAuthor;
        }
        return null;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

// Calculate reading time based on content
function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// Format author name
function formatAuthorName(author: any): string {
    if (author.firstName && author.lastName) {
        return `${author.firstName} ${author.lastName}`;
    }
    if (author.username) {
        return author.username;
    }
    return author.email.split('@')[0];
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

    const readingTime = calculateReadingTime(article.content);
    const authorName = formatAuthorName(article.author);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-radial from-amber-500/3 via-orange-500/2 to-yellow-500/3 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/2 via-transparent to-orange-500/2 pointer-events-none" />
            </div>

            <div className="relative z-10">
                {/* Breadcrumbs */}
                <div className="container mx-auto px-6 pt-8">
                    <Breadcrumbs 
                        title={article.title}
                        category={article.category}
                    />
                </div>

                {/* Hero Section with Full-Width Cover Image */}
                {article.imageUrl && (
                    <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
                        <Image
                            src={article.imageUrl}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                        {/* Dark-to-transparent gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Article title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                            <div className="container mx-auto">
                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white font-bold leading-tight mb-4">
                                    {article.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Article Meta Information */}
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
                            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm mb-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-400" />
                                    <span>By {authorName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-400" />
                                    <span>{formatDate(article.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    <span>{readingTime} min read</span>
                                </div>
                                {article.category && (
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-amber-400" />
                                        <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full text-xs">
                                            {article.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Article Summary */}
                            <p className="text-lg text-gray-300 leading-relaxed mb-4">
                                {article.summary}
                            </p>

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm border border-white/20"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Article Content */}
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 mb-8">
                            <div className="prose prose-invert prose-lg max-w-none">
                                <div
                                    className="text-gray-300 leading-relaxed space-y-6"
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                />
                            </div>
                        </div>

                        {/* Social Sharing */}
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Share2 className="w-5 h-5 text-amber-400" />
                                    <span className="text-white font-medium">Share this article</span>
                                </div>
                                <SocialSharing 
                                    title={article.title}
                                    url={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/article/${article.slug}`}
                                    summary={article.summary}
                                />
                            </div>
                        </div>

                        {/* Comments Section */}
                        {article.comments && article.comments.length > 0 && (
                            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 mb-8">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageCircle className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-xl font-semibold text-white">
                                        Comments ({article.comments.length})
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {article.comments.map((comment) => (
                                        <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-amber-300 font-medium">
                                                    {comment.author?.username || 'Anonymous'}
                                                </span>
                                                <span className="text-gray-400 text-sm">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300">{comment.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Articles */}
                        <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse" />}>
                            <RelatedArticles 
                                currentArticleId={article.id}
                                category={article.category}
                                tags={article.tags}
                            />
                        </Suspense>

                        {/* Back to Articles */}
                        <div className="text-center mt-12">
                            <Link
                                href="/article"
                                className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors duration-300 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                <span>Back to All Articles</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 