import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles } from '@/lib/actions/articles';
import { Calendar, User, ArrowLeft, Clock, Share2, MessageCircle, Tag, ChevronRight, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleWithAuthor } from '@/types';
import { generateArticleMetadata } from '@/lib/seo/metadata';
import { generateCompleteArticleSchema, extractFAQsFromContent } from '@/lib/seo/generateArticleSchema';
import { Suspense } from 'react';
import ArticleLoadingSkeleton from './_components/ArticleLoadingSkeleton';
import RelatedArticles from './_components/RelatedArticles';
import SocialSharing from './_components/SocialSharing';
import Breadcrumbs from './_components/Breadcrumbs';
import TableOfContents from './_components/TableOfContents';
import JsonLd from '@/components/seo/JsonLd';
import { getLanguageFromPath, generateHreflangPaths, supportedLanguages } from '@/i18n.config';

// Enable ISR with 60-second revalidation
export const revalidate = 60;

interface ArticlePageProps {
    params: {
        slug: string;
    };
    searchParams?: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params, searchParams }: ArticlePageProps) {
    const result = await getArticleBySlug(params.slug);
    
    if (!result.success || !result.data) {
        return {
            title: 'Article Not Found - Sheikh Shop',
            description: 'The requested article could not be found.',
        };
    }

    const article = result.data;
    const currentPath = `/article/${params.slug}`;
    const currentLanguage = getLanguageFromPath(currentPath);

    // Use database SEO fields if available, fallback to generated metadata
    const metaTitle = article.metaTitle || article.title;
    const metaDescription = article.metaDescription || article.summary;
    const keywords = article.keywords && article.keywords.length > 0 ? article.keywords : article.tags || [];

    // Generate hreflang for multi-language SEO
    const hreflangPaths = generateHreflangPaths(currentPath);

    return {
        title: metaTitle,
        description: metaDescription,
        keywords: keywords,
        authors: [{ name: formatAuthorName(article.author) }],
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            images: article.imageUrl ? [
                {
                    url: article.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: metaTitle,
                }
            ] : undefined,
            type: 'article',
            publishedTime: article.publishedAt?.toISOString(),
            modifiedTime: article.updatedAt.toISOString(),
            authors: [formatAuthorName(article.author)],
            section: article.category,
            tags: keywords,
            locale: supportedLanguages.find(lang => lang.code === currentLanguage)?.locale || 'en_US',
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: article.imageUrl ? [article.imageUrl] : undefined,
            creator: '@sheikhshops',
            site: '@sheikhshops',
        },
        alternates: {
            canonical: `https://sheikhshops.com${currentPath}`,
            languages: hreflangPaths,
        },
        other: {
            'article:author': formatAuthorName(article.author),
            'article:published_time': article.publishedAt?.toISOString(),
            'article:modified_time': article.updatedAt.toISOString(),
            'article:section': article.category || '',
            'article:tag': keywords.join(', '),
            'article:language': currentLanguage,
        },
    };
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

    const readingTime = article.readTime || calculateReadingTime(article.content);
    const authorName = formatAuthorName(article.author);

    // Generate structured data
    const faqs = extractFAQsFromContent(article.content);
    const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Articles', url: '/article' },
        { name: article.title, url: `/article/${article.slug}` }
    ];

    const structuredData = generateCompleteArticleSchema(article, {
        faqs: faqs.length > 0 ? faqs : undefined,
        breadcrumbs,
        baseUrl: 'https://sheikhshops.com',
        logoUrl: 'https://sheikhshops.com/logo.png',
        organizationName: 'Sheikh Shop'
    });

    return (
        <>
            {/* JSON-LD Structured Data */}
            {structuredData.map((schema, index) => (
                <JsonLd key={index} data={schema} />
            ))}
            
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
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {/* Article Meta Information */}
                                <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
                                    <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-amber-400" />
                                            <span>By {authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-amber-400" />
                                            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
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

                                    {/* Keywords */}
                                    {article.keywords && article.keywords.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-amber-300 mb-2">Keywords:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {article.keywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-sm border border-amber-500/30"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

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

                                {/* Internal and External Links */}
                                {(article.internalLinks.length > 0 || article.externalLinks.length > 0) && (
                                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8">
                                        <h3 className="text-xl font-semibold text-white mb-4">References</h3>
                                        
                                        {article.internalLinks.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-lg font-medium text-amber-300 mb-3 flex items-center gap-2">
                                                    <LinkIcon className="w-5 h-5" />
                                                    Internal Links
                                                </h4>
                                                <div className="space-y-2">
                                                    {article.internalLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            className="block text-blue-300 hover:text-blue-200 transition-colors"
                                                        >
                                                            {link}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {article.externalLinks.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-medium text-amber-300 mb-3 flex items-center gap-2">
                                                    <ExternalLink className="w-5 h-5" />
                                                    External References
                                                </h4>
                                                <div className="space-y-2">
                                                    {article.externalLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-blue-300 hover:text-blue-200 transition-colors"
                                                        >
                                                            {link}
                                                            <ExternalLink className="w-3 h-3 inline ml-1" />
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24">
                                    {/* Table of Contents */}
                                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-6">
                                        <Suspense fallback={<div className="h-32 bg-white/5 rounded animate-pulse" />}>
                                            <TableOfContents content={article.content} />
                                        </Suspense>
                                    </div>

                                    {/* Social Sharing */}
                                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Share2 className="w-5 h-5 text-amber-400" />
                                            <span className="text-white font-medium">Share Article</span>
                                        </div>
                                        <SocialSharing 
                                            title={article.title}
                                            url={`https://sheikhshops.com/article/${article.slug}`}
                                            summary={article.summary}
                                        />
                                    </div>
                                </div>
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
        </>
    );
} 