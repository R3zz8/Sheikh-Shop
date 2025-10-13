'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  Globe, 
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';
// Charts will be implemented with a simpler approach for now
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';

interface AnalyticsData {
  summary: {
    totalArticles: number;
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    avgEngagementScore: number;
    avgReadingTime: number;
    topPerformingLanguage: string;
    topCategory: string | null;
    recentGrowth: {
      views: number;
      likes: number;
      articles: number;
    };
  };
  topArticles: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    shares: number;
    language: string;
    engagementScore: number;
    avgReadingTime: number;
    bounceRate: number;
    category: string | null;
    author: {
      id: string;
      username: string;
      email: string;
    };
  }>;
  languagePerformance: Array<{
    language: string;
    articleCount: number;
    totalViews: number;
    avgEngagementScore: number;
    avgReadingTime: number;
  }>;
  timeSeries: Array<{
    date: string;
    views: number;
    likes: number;
    articles: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    shares: number;
    language: string;
    engagementScore: number;
    avgReadingTime: number;
    bounceRate: number;
    category: string | null;
    author: {
      id: string;
      username: string;
      email: string;
    };
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getLanguageName = (code: string) => {
    const names: Record<string, string> = {
      en: 'English',
      ar: 'العربية',
      fa: 'فارسی',
      tr: 'Türkçe',
    };
    return names[code] || code.toUpperCase();
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 mb-4">
            <BarChart3 className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              +{data.summary.recentGrowth.articles} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.summary.totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(data.summary.recentGrowth.views)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.summary.totalLikes)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(data.summary.recentGrowth.likes)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.avgEngagementScore.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Avg reading time: {Math.round(data.summary.avgReadingTime)}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="articles">Top Articles</TabsTrigger>
          <TabsTrigger value="languages">Language Performance</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Views Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
                <CardDescription>Daily views for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Content by Language</CardTitle>
                <CardDescription>Distribution of articles across languages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.languagePerformance.map((lang, index) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{getLanguageName(lang.language)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {lang.articleCount} articles
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Articles</CardTitle>
              <CardDescription>Articles ranked by total views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{article.title}</span>
                        <Badge variant="secondary">{getLanguageName(article.language)}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(article.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {article.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(article.avgReadingTime)}s
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getEngagementColor(article.engagementScore)}`}>
                        {article.engagementScore.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Performance</CardTitle>
              <CardDescription>Analytics breakdown by language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.languagePerformance.map((lang) => (
                  <div key={lang.language} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">{getLanguageName(lang.language)}</span>
                        <Badge variant="outline">{lang.articleCount} articles</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatNumber(lang.totalViews)} total views
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Avg Engagement:</span>
                        <span className={`ml-2 font-medium ${getEngagementColor(lang.avgEngagementScore)}`}>
                          {lang.avgEngagementScore.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Reading Time:</span>
                        <span className="ml-2 font-medium">{Math.round(lang.avgReadingTime)}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Articles published in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                ) : (
                  data.recentActivity.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{article.title}</span>
                          <Badge variant="secondary">{getLanguageName(article.language)}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>by {article.author.username}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(article.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {article.likes}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${getEngagementColor(article.engagementScore)}`}>
                          {article.engagementScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
