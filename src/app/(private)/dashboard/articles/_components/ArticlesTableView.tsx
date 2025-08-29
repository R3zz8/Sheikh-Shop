'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  ChevronUp,
  ChevronDown,
  SortAsc,
  SortDesc
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

interface ArticlesTableViewProps {
  articles: ArticleWithAuthor[];
  selectedArticles: Set<string>;
  onSelectionChange: (articleId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete: (articleId: string) => void;
  onDuplicate: (article: ArticleWithAuthor) => void;
  loading: boolean;
}

export default function ArticlesTableView({
  articles,
  selectedArticles,
  onSelectionChange,
  onSelectAll,
  onDelete,
  onDuplicate,
  loading
}: ArticlesTableViewProps) {
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
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <div className="p-4 border-b bg-gray-50">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
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
                                      if (el && 'indeterminate' in el) (el as HTMLInputElement).indeterminate = someSelected;
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

      {/* Articles Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el && 'indeterminate' in el) (el as HTMLInputElement).indeterminate = someSelected;
                    }}
                    onCheckedChange={onSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => {
                const isSelected = selectedArticles.has(article.id);
                const wordCount = getWordCount(article.content);
                const readingTime = getReadingTime(wordCount);

                return (
                  <tr 
                    key={article.id} 
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectionChange(article.id, !!checked)}
                      />
                    </td>

                    {/* Article Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {article.imageUrl ? (
                              <Image
                                src={article.imageUrl}
                                alt={article.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 truncate max-w-xs">
                            {article.summary}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {wordCount} words • {readingTime} read
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge 
                        variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}
                        className="flex items-center gap-1 w-fit"
                      >
                        {article.status === 'PUBLISHED' ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {article.author.username || article.author.email.split('@')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          <div>{formatDate(article.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            {formatRelativeDate(article.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Updated Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-gray-400" />
                        <div className="text-sm text-gray-900">
                          <div>{formatDate(article.updatedAt)}</div>
                          <div className="text-xs text-gray-500">
                            {article.updatedAt !== article.createdAt 
                              ? formatRelativeDate(article.updatedAt)
                              : 'Same as created'
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 space-y-1">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-gray-400" />
                          <span>{wordCount} words</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{readingTime}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
    </div>
  );
}
