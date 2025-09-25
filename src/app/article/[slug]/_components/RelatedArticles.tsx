'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { getRelatedArticles } from '@/lib/actions/articles';

interface RelatedArticlesProps {
  currentArticleId: string;
  category?: string | null;
  tags?: string[];
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: string;
    username: string | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function RelatedArticles({ currentArticleId, category, tags }: RelatedArticlesProps) {
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        const result = await getRelatedArticles(currentArticleId, category || undefined, tags, 3);
        if (result.success && result.data) {
          setRelatedArticles(result.data as unknown as RelatedArticle[]);
        }
      } catch (error) {
        console.error('Error fetching related articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [currentArticleId, category, tags]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatAuthorName = (author: any): string => {
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`;
    }
    if (author.username) {
      return author.username;
    }
    return author.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15">
        <div className="flex items-center gap-2 mb-6">
          <ArrowRight className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-semibold text-white">Related Articles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="h-32 bg-white/10 rounded-lg mb-4"></div>
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/8 backdrop-blur-sm rounded-2xl p-8 border border-white/15">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRight className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-semibold text-white">Related Articles</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedArticles.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="group bg-white/5 rounded-lg p-4 border border-white/10 hover:border-amber-300/30 hover:bg-white/8 transition-all duration-300"
          >
            {/* Article Image */}
            {article.imageUrl && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold line-clamp-2 group-hover:text-amber-300 transition-colors duration-300">
                {article.title}
              </h4>
              
              <p className="text-gray-400 text-sm line-clamp-2">
                {article.summary}
              </p>

              {/* Article Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{formatAuthorName(article.author)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(article.createdAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
