'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';
import type { ArticleWithAuthor } from '@/types';

interface ArticlesListProps {
    articles: ArticleWithAuthor[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
    },
};

export default function ArticlesList({ articles }: ArticlesListProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(date));
    };

    return (
        <motion.div
            className="space-y-8 font-vazirmatn"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            dir="rtl"
        >
            {articles.map((article, index) => (
                <motion.div
                    key={article.id}
                    variants={itemVariants}
                    whileHover={{ y: -2 }}
                    className="group"
                >
                    <Link href={`/article/${article.slug}`}>
                        <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/15 hover:border-amber-300/30 transition-all duration-300 hover:bg-white/12">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Article Image */}
                                <div className="relative w-full md:w-48 h-48 md:h-32 rounded-xl overflow-hidden flex-shrink-0">
                                    <Image
                                        src={article.imageUrl || '/assets/noImage.jpg'}
                                        alt={article.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, 192px"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>

                                {/* Article Content */}
                                <div className="flex-1 space-y-3 text-right">
                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium justify-start" dir="rtl">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatDate(article.createdAt)}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl md:text-3xl font-serif text-white font-bold leading-tight group-hover:text-amber-200 transition-colors duration-300 text-right">
                                        {article.title}
                                    </h2>

                                    {/* Summary */}
                                    <p className="text-gray-300 leading-relaxed overflow-hidden text-ellipsis text-right" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {article.summary}
                                    </p>

                                    {/* Read More */}
                                    <div className="flex items-center gap-2 text-amber-300 font-medium group-hover:text-amber-200 transition-colors duration-300 justify-start" dir="rtl">
                                        <span>خواندن مقاله</span>
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
}
