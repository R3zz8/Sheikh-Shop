'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  User,
  Clock,
  FileText,
  ExternalLink,
  EyeOff,
  CalendarDays,
  History,
  Users,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Article } from '@prisma/client';

interface ArticleWithAuthor extends Article {
  author: {
    id: string;
    email: string;
    username?: string;
  };
}

interface ArticlesGridViewProps {
  articles: ArticleWithAuthor[];
  selectedArticles: Set<string>;
  onSelectionChange: (articleId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (articleId: string) => void;
  onDuplicate: (article: ArticleWithAuthor) => void;
  loading: boolean;
}

export default function ArticlesGridView({
  articles,
  selectedArticles,
  onSelectionChange,
  onSelectAll,
  onDelete,
  onDuplicate,
  loading
}: ArticlesGridViewProps) {
  // Helper functions
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return formatDate(date);
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const allSelected = articles.length > 0 && selectedArticles.size === articles.length;
  const someSelected = selectedArticles.size > 0 && selectedArticles.size < articles.length;

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header */}
      {articles.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onCheckedChange={onSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedArticles.size === 0 
              ? 'Select articles for bulk actions'
              : `${selectedArticles.size} article${selectedArticles.size !== 1 ? 's' : ''} selected`
            }
          </span>
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((article) => {
          const isSelected = selectedArticles.has(article.id);
          const wordCount = getWordCount(article.content);
          const readingTime = getReadingTime(wordCount);

          return (
            <Card 
              key={article.id} 
              className={`group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              {/* Article Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                {article.imageUrl ? (
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelectionChange(article.id, !!checked)}
                    className="bg-white/90 backdrop-blur-sm"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="backdrop-blur-sm"
                  >
                    {article.status === 'PUBLISHED' ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        Draft
                      </>
                    )}
                  </Badge>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View Article</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={() => onDuplicate(article)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate Article</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <CardContent className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {article.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.summary}
                </p>

                {/* Metadata */}
                <div className="space-y-2">
                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">
                        {article.author.username || article.author.email.split('@')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatRelativeDate(article.createdAt)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{readingTime}</span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  {article.updatedAt !== article.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <History className="w-3 h-3" />
                      <span>Updated {formatRelativeDate(article.updatedAt)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Preview</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => onDuplicate(article)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate</TooltipContent>
                    </Tooltip>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Article Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/articles/${article.id}/edit`} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Article
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link href={`/article/${article.slug}`} target="_blank" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View Public
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem 
                        onClick={() => onDuplicate(article)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onDelete(article.id)}
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Article
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600">Create your first article to get started.</p>
        </div>
      )}
    </div>
  );
}

