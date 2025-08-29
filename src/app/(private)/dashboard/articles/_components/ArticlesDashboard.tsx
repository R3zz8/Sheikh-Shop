'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireRole } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  Clock,
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Archive,
  EyeOff,
  CalendarDays,
  History,
  Users,
  Target,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import type { Article } from '@prisma/client';
import ArticlesGridView from './ArticlesGridView';
import ArticlesTableView from './ArticlesTableView';

interface ArticleWithAuthor extends Article {
  author: {
    id: string;
    email: string;
    username: string | null;
  };
}

interface ArticlesDashboardProps {
  initialArticles?: ArticleWithAuthor[];
}

interface DashboardStats {
  total: number;
  published: number;
  drafts: number;
  thisWeek: number;
  thisMonth: number;
}

interface FilterState {
  search: string;
  status: 'ALL' | 'DRAFT' | 'PUBLISHED';
  author: string;
  dateRange: 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';
  sortBy: 'TITLE' | 'CREATED_AT' | 'UPDATED_AT' | 'STATUS' | 'AUTHOR';
  sortOrder: 'ASC' | 'DESC';
  viewMode: 'CARDS' | 'TABLE';
}

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline';
}

export default function ArticlesDashboard({ initialArticles = [] }: ArticlesDashboardProps) {
  const router = useRouter();
  const hasAccess = useRequireRole(['SUPERADMIN', 'ADMIN', 'EDITOR']);
  
  // State management
  const [articles, setArticles] = useState<ArticleWithAuthor[]>(initialArticles);
  const [filteredArticles, setFilteredArticles] = useState<ArticleWithAuthor[]>(initialArticles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    author: 'ALL',
    dateRange: 'ALL',
    sortBy: 'CREATED_AT',
    sortOrder: 'DESC',
    viewMode: 'CARDS'
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Memoized computed values
  const dashboardStats = useMemo((): DashboardStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'PUBLISHED').length,
      drafts: articles.filter(a => a.status === 'DRAFT').length,
      thisWeek: articles.filter(a => new Date(a.createdAt) >= weekAgo).length,
      thisMonth: articles.filter(a => new Date(a.createdAt) >= monthAgo).length
    };
  }, [articles]);

  const uniqueAuthors = useMemo(() => {
    const authors = new Set(articles.map(a => a.author.email));
    return Array.from(authors);
  }, [articles]);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/articles');
      const result = await response.json();

      if (result.success && result.data) {
        setArticles(result.data);
        setFilteredArticles(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch articles');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch articles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...articles];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchLower) ||
        article.summary.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(article => article.status === filters.status);
    }

    // Author filter
    if (filters.author !== 'ALL') {
      filtered = filtered.filter(article => article.author.email === filters.author);
    }

    // Date range filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'TODAY':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'THIS_WEEK':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'THIS_MONTH':
          cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(article => new Date(article.createdAt) >= cutoffDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'TITLE':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'CREATED_AT':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'UPDATED_AT':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'STATUS':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'AUTHOR':
          aValue = a.author.email.toLowerCase();
          bValue = b.author.email.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }

      if (filters.sortOrder === 'ASC') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredArticles(filtered);
  }, [articles, filters]);

  // Load articles on mount
  useEffect(() => {
    if (initialArticles.length === 0) {
      fetchArticles();
    }
  }, [initialArticles.length, fetchArticles]);

  // Handle article selection
  const handleArticleSelection = (articleId: string, checked: boolean) => {
    const newSelection = new Set(selectedArticles);
    if (checked) {
      newSelection.add(articleId);
    } else {
      newSelection.delete(articleId);
    }
    setSelectedArticles(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(new Set(filteredArticles.map(a => a.id)));
      setShowBulkActions(true);
    } else {
      setSelectedArticles(new Set());
      setShowBulkActions(false);
    }
  };

  // Article actions
  const handleDelete = async (id: string) => {
    setArticleToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      const response = await fetch(`/api/articles/${articleToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setArticles(articles.filter(article => article.id !== articleToDelete));
        setSelectedArticles(prev => {
          const newSelection = new Set(prev);
          newSelection.delete(articleToDelete);
          return newSelection;
        });
        toast.success('Article deleted successfully');
      } else {
        throw new Error('Failed to delete article');
      }
    } catch (error) {
      toast.error('Failed to delete article');
    } finally {
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    }
  };

  const handleBulkAction = async (action: 'PUBLISH' | 'UNPUBLISH' | 'DELETE') => {
    if (selectedArticles.size === 0) return;

    try {
      const articleIds = Array.from(selectedArticles);
      
      switch (action) {
        case 'PUBLISH':
          await Promise.all(
            articleIds.map(id =>
              fetch(`/api/articles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PUBLISHED' })
              })
            )
          );
          toast.success(`${articleIds.length} articles published successfully`);
          break;

        case 'UNPUBLISH':
          await Promise.all(
            articleIds.map(id =>
              fetch(`/api/articles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'DRAFT' })
              })
            )
          );
          toast.success(`${articleIds.length} articles unpublished successfully`);
          break;

        case 'DELETE':
          await Promise.all(
            articleIds.map(id =>
              fetch(`/api/articles/${id}`, { method: 'DELETE' })
            )
          );
          toast.success(`${articleIds.length} articles deleted successfully`);
          break;
      }

      // Refresh articles and clear selection
      await fetchArticles();
      setSelectedArticles(new Set());
      setShowBulkActions(false);
    } catch (error) {
      toast.error(`Failed to perform bulk action: ${action.toLowerCase()}`);
    }
  };

  const duplicateArticle = async (article: ArticleWithAuthor) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${article.title} (Copy)`,
          summary: article.summary,
          content: article.content,
          status: 'DRAFT',
          imageUrl: article.imageUrl
        })
      });

      if (response.ok) {
        toast.success('Article duplicated successfully');
        await fetchArticles();
      } else {
        throw new Error('Failed to duplicate article');
      }
    } catch (error) {
      toast.error('Failed to duplicate article');
    }
  };

  // Quick actions
  const quickActions: BulkAction[] = [
    {
      id: 'publish',
      label: 'Publish Selected',
      icon: <Eye className="w-4 h-4" />,
      action: () => handleBulkAction('PUBLISH'),
      variant: 'default'
    },
    {
      id: 'unpublish',
      label: 'Unpublish Selected',
      icon: <EyeOff className="w-4 h-4" />,
      action: () => handleBulkAction('UNPUBLISH'),
      variant: 'outline'
    },
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => handleBulkAction('DELETE'),
      variant: 'destructive'
    }
  ];

  // Format date helper
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

  // Word count helper
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Articles</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchArticles} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Articles Management</h1>
              <p className="text-gray-600 mt-1">Create, edit, and manage your content</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchArticles} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/dashboard/articles/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Article
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Articles</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Published</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.published}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.drafts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.thisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.thisMonth}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and Quick Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search articles by title, summary, or content..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filters.status} onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Drafts</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.author} onValueChange={(value: any) => setFilters(prev => ({ ...prev, author: value }))}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Authors</SelectItem>
                      {uniqueAuthors.map(author => (
                        <SelectItem key={author} value={author}>{author}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.dateRange} onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Time</SelectItem>
                      <SelectItem value="TODAY">Today</SelectItem>
                      <SelectItem value="THIS_WEEK">This Week</SelectItem>
                      <SelectItem value="THIS_MONTH">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters and View Options */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CREATED_AT">Created Date</SelectItem>
                        <SelectItem value="UPDATED_AT">Updated Date</SelectItem>
                        <SelectItem value="TITLE">Title</SelectItem>
                        <SelectItem value="STATUS">Status</SelectItem>
                        <SelectItem value="AUTHOR">Author</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === 'ASC' ? 'DESC' : 'ASC' 
                    }))}
                  >
                    {filters.sortOrder === 'ASC' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Tabs value={filters.viewMode} onValueChange={(value: any) => setFilters(prev => ({ ...prev, viewMode: value }))}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="CARDS" className="flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />
                        Cards
                      </TabsTrigger>
                      <TabsTrigger value="TABLE" className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        Table
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {showBulkActions && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedArticles.size} article{selectedArticles.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedArticles(new Set());
                      setShowBulkActions(false);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear Selection
                  </Button>
                </div>
                <div className="flex gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.variant}
                      size="sm"
                      onClick={action.action}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Articles Content */}
        <TabsContent value={filters.viewMode} className="mt-0">
          {filters.viewMode === 'CARDS' ? (
            <ArticlesGridView
              articles={filteredArticles}
              selectedArticles={selectedArticles}
              onSelectionChange={handleArticleSelection}
              onSelectAll={handleSelectAll}
              onDelete={handleDelete}
              onDuplicate={duplicateArticle}
              loading={loading}
            />
          ) : (
            <ArticlesTableView
              articles={filteredArticles}
              selectedArticles={selectedArticles}
              onSelectionChange={handleArticleSelection}
              onSelectAll={handleSelectAll}
              onDelete={handleDelete}
              onDuplicate={duplicateArticle}
              loading={loading}
            />
          )}
        </TabsContent>

        {/* Empty State */}
        {filteredArticles.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                {filters.search || filters.status !== 'ALL' || filters.author !== 'ALL' || filters.dateRange !== 'ALL'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first article.'}
              </p>
              <div className="flex justify-center gap-3">
                {(filters.search || filters.status !== 'ALL' || filters.author !== 'ALL' || filters.dateRange !== 'ALL') && (
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      status: 'ALL',
                      author: 'ALL',
                      dateRange: 'ALL',
                      sortBy: 'CREATED_AT',
                      sortOrder: 'DESC',
                      viewMode: 'CARDS'
                    })}
                  >
                    Clear Filters
                  </Button>
                )}
                <Link href="/dashboard/articles/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Article
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this article? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

