import { notFound } from 'next/navigation';
import { getArticleBySlug, getRelatedArticles } from '@/lib/actions/articles';
import { Calendar, User, ArrowRight, Clock, Share2, MessageCircle, Tag, ChevronLeft, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ArticleWithAuthor } from '@/types';
import { generateCompleteArticleSchema, extractFAQsFromContent } from '@/lib/seo/generateArticleSchema';
import { sanitizeDescription } from '@/lib/seo/helpers';
import { Suspense } from 'react';
import ArticleLoadingSkeleton from './_components/ArticleLoadingSkeleton';
import RelatedArticles from './_components/RelatedArticles';
import SocialSharing from './_components/SocialSharing';
import Breadcrumbs from './_components/Breadcrumbs';
import TableOfContents from './_components/TableOfContents';
import JsonLd from '@/components/seo/JsonLd';
import { getLanguageFromPath, generateHreflangPaths, supportedLanguages } from '@/i18n.config';
import { generatePageSEO } from '@/lib/seo/core';
import { manageHeadings } from '@/lib/seo/heading-manager';
import { unstable_noStore as noStore } from 'next/cache';

// Force dynamic rendering to ensure the correct article is loaded for each slug.
export const dynamic = 'force-dynamic';

interface ArticlePageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const { slug } = await params;
    const result = await getArticleBySlug(slug);

    if (!result.success || !result.data) {
        return generatePageSEO({
            title: 'مقاله یافت نشد',
            description: 'مقاله درخواستی یافت نشد.',
            noIndex: true,
        });
    }

    const article = result.data;
    const canonicalPath = `/article/${article.slug}`;

    // SEO Fallback Logic
    const title = article.metaTitle || article.title;
    const description = article.metaDescription || article.summary || sanitizeDescription(article.content, 150);
    const keywords = article.keywords && article.keywords.length > 0 ? article.keywords : article.tags || [];

    if (process.env.NODE_ENV === 'development') {
        console.log(`[SEO Debug] Generating metadata for article: "${article.title}"`);
        if (!article.metaTitle) console.log(`  - Title: Fallback to article title.`);
        if (!article.metaDescription) console.log(`  - Description: Fallback to summary or content.`);
    }

    const baseSEO = generatePageSEO({
        title,
        description,
        keywords,
        ogTitle: article.metaTitle || title,
        ogDescription: article.metaDescription || description,
        ogImage: article.imageUrl || '',
        canonical: canonicalPath,
    });

    // Enhance with article-specific metadata
    return {
        ...baseSEO,
        authors: [{ name: formatAuthorName(article.author) }],
        openGraph: {
            ...baseSEO.openGraph,
            type: 'article',
            publishedTime: article.publishedAt?.toISOString(),
            modifiedTime: article.updatedAt.toISOString(),
            authors: [formatAuthorName(article.author)],
            section: article.category,
            tags: keywords,
        },
        alternates: {
            ...baseSEO.alternates,
            languages: generateHreflangPaths(canonicalPath),
        },
    };
}

async function getArticle(slug: string): Promise<ArticleWithAuthor | null> {
    noStore();
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
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        notFound();
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fa-IR', {
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
        { name: 'خانه', url: '/' },
        { name: 'مقالات', url: '/article' },
        { name: article.title, url: `/article/${article.slug}` }
    ];

    const structuredData = generateCompleteArticleSchema(article, {
        faqs: faqs.length > 0 ? faqs : undefined,
        breadcrumbs,
        baseUrl: 'https://sheikhshops.com',
        logoUrl: 'https://sheikhshops.com/logo.png',
        organizationName: 'فروشگاه شیخ'
    });

    const processedContent = manageHeadings(article.content);

    return (
        <>
            {/* JSON-LD Structured Data */}
            {structuredData.map((schema, index) => (
                <JsonLd key={index} data={schema} />
            ))}
            
            <div className="min-h-screen bg-gradient-to-br from-amber-950/95 via-stone-900/95 to-amber-950/95 relative overflow-hidden font-vazirmatn" dir="rtl">
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

                {/* Hero Section with Cover Image */}
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
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-right">
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
                                <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8 text-right">
                                    <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm mb-4 justify-start">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-amber-400" />
                                            <span>نویسنده: {authorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-amber-400" />
                                            <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-400" />
                                            <span>{readingTime} دقیقه زمان مطالعه</span>
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
                                    <p className="text-lg text-gray-300 leading-relaxed mb-4 text-right">
                                        {article.summary}
                                    </p>

                                    {/* Keywords */}
                                    {article.keywords && article.keywords.length > 0 && (
                                        <div className="mb-4 text-right">
                                            <h4 className="text-sm font-medium text-amber-300 mb-2">کلمات کلیدی:</h4>
                                            <div className="flex flex-wrap gap-2 justify-start">
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
                                        <div className="flex flex-wrap gap-2 justify-start">
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
                                    <div className="prose prose-invert prose-lg max-w-none text-right">
                                        <div
                                            className="text-gray-300 leading-relaxed space-y-6 text-right"
                                            dangerouslySetInnerHTML={{ __html: processedContent }}
                                        />
                                    </div>
                                </div>

                                {/* References */}
                                {(article.internalLinks.length > 0 || article.externalLinks.length > 0) && (
                                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 mb-8 text-right">
                                        <h3 className="text-xl font-semibold text-white mb-4">منابع و مراجع</h3>
                                        
                                        {article.internalLinks.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-lg font-medium text-amber-300 mb-3 flex items-center gap-2">
                                                    <LinkIcon className="w-5 h-5" />
                                                    لینک‌های داخلی
                                                </h4>
                                                <div className="space-y-2">
                                                    {article.internalLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            className="block text-blue-300 hover:text-blue-200 transition-colors text-right"
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
                                                    منابع خارجی
                                                </h4>
                                                <div className="space-y-2">
                                                    {article.externalLinks.map((link, index) => (
                                                        <a
                                                            key={index}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-blue-300 hover:text-blue-200 transition-colors text-right"
                                                        >
                                                            {link}
                                                            <ExternalLink className="w-3 h-3 inline mr-1" />
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
                                    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 text-right">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Share2 className="w-5 h-5 text-amber-400" />
                                            <span className="text-white font-medium">اشتراک‌گذاری مقاله</span>
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
                            <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15 mb-8 text-right">
                                <div className="flex items-center gap-2 mb-6">
                                    <MessageCircle className="w-5 h-5 text-amber-400" />
                                    <h3 className="text-xl font-semibold text-white">
                                        نظرات ({article.comments.length})
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {article.comments.map((comment) => (
                                        <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center gap-2 mb-2 justify-start">
                                                <span className="text-amber-300 font-medium">
                                                    {comment.author?.username || 'کاربر ناشناس'}
                                                </span>
                                                <span className="text-gray-400 text-sm">
                                                    {formatDate(comment.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-right">{comment.content}</p>
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
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                <span>بازگشت به همه مقالات</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
