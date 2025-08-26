'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Article } from '@prisma/client';

interface ArticlesPageClientProps {
    initialArticles?: Article[];
}

export default function ArticlesPageClient({ initialArticles = [] }: ArticlesPageClientProps) {
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [loading, setLoading] = useState(false);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/articles');
            const result = await response.json();

            if (result.success && result.data) {
                setArticles(result.data);
            }
        } catch (error) {
            // console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialArticles.length === 0) {
            fetchArticles();
        }
    }, [initialArticles.length]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) {
            return;
        }

        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setArticles(articles.filter(article => article.id !== id));
            }
        } catch (error) {
            // console.error('Failed to delete article:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Articles</h1>
                <Link href="/dashboard/articles/new">
                    <Button>Create New Article</Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                    >
                        <div>
                            <h3 className="font-semibold">{article.title}</h3>
                            <p className="text-sm text-gray-600">{article.summary}</p>
                            <div className="flex gap-2 mt-2">
                                <Badge variant={article.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                    {article.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                    {new Date(article.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/dashboard/articles/${article.id}/edit`}>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </Link>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(article.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {articles.length === 0 && !loading && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No articles found.</p>
                    <Link href="/dashboard/articles/new">
                        <Button className="mt-2">Create your first article</Button>
                    </Link>
                </div>
            )}
        </div>
    );
} 