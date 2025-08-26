'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireRole } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createArticle, updateArticle } from '@/lib/actions/articles';
import { uploadArticleImage } from '@/lib/services/articleUpload';
import { toast } from 'sonner';

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

interface Article {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    imageUrl?: string;
    status: 'DRAFT' | 'PUBLISHED';
    author: {
        id: string;
        email: string;
        name?: string;
    };
}

interface ArticleFormProps {
    article?: Article;
}

export default function ArticleForm({ article }: ArticleFormProps) {
    const router = useRouter();
    const hasAccess = useRequireRole(['SUPERADMIN', 'ADMIN', 'EDITOR']);
    const isEditing = !!article;

    const [formData, setFormData] = useState({
        title: article?.title ?? '',
        summary: article?.summary ?? '',
        content: article?.content ?? '',
        status: article?.status ?? 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    });

    const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? '');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleImageUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await uploadArticleImage(formData);

            if (response?.error) {
                toast.error(response.error);
                return;
            }

            if (response?.data?.imageUrl) {
                setImageUrl(response.data.imageUrl);
                setFile(null);
                // Clear the file input
                const fileInput = document.getElementById('article-image') as HTMLInputElement;
                if (fileInput) {
                    fileInput.value = '';
                }
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasAccess) {
            toast.error('You do not have permission to perform this action');
            return;
        }

        try {
            setSaving(true);

            const submitData = {
                title: formData.title,
                slug: generateSlug(formData.title),
                summary: formData.summary,
                content: formData.content,
                status: formData.status,
                imageUrl: imageUrl || undefined,
            };

            const formDataObj = new FormData();
            Object.entries(submitData).forEach(([key, value]) => {
                if (value !== undefined) {
                    formDataObj.append(key, value.toString());
                }
            });

            if (isEditing && article) {
                await updateArticle(article.id, formDataObj);
                toast.success('Article updated successfully');
            } else {
                await createArticle(formDataObj);
                toast.success('Article created successfully');
            }

            router.push('/dashboard/articles');
        } catch (error) {
            toast.error('Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    const removeImage = () => {
        setImageUrl('');
        setFile(null);
        const fileInput = document.getElementById('article-image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    if (!hasAccess) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You do not have permission to access this page.</p>
                    <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Link
                        href="/dashboard/articles"
                        className="flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditing ? 'Edit Article' : 'Create New Article'}
                    </h1>
                </div>
                <Badge variant={isEditing ? 'secondary' : 'default'}>
                    {isEditing ? 'Editing' : 'Creating'}
                </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Article Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Enter article title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: 'DRAFT' | 'PUBLISHED') =>
                                        handleInputChange('status', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                        <SelectItem value="PUBLISHED">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="summary">Summary *</Label>
                            <Textarea
                                id="summary"
                                value={formData.summary}
                                onChange={(e) => handleInputChange('summary', e.target.value)}
                                placeholder="Enter article summary"
                                rows={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Content *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                placeholder="Enter article content"
                                rows={10}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Article Image</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="article-image">Upload Image</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="article-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    onClick={handleImageUpload}
                                    disabled={!file || uploading}
                                    variant="outline"
                                >
                                    {uploading ? 'Uploading...' : <Upload className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {imageUrl && (
                            <div className="space-y-2">
                                <Label>Current Image</Label>
                                <div className="relative inline-block">
                                    <img
                                        src={imageUrl}
                                        alt="Article"
                                        className="w-32 h-32 object-cover rounded-lg border"
                                    />
                                    <Button
                                        type="button"
                                        onClick={removeImage}
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end space-x-4">
                    <Link href="/dashboard/articles">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEditing ? 'Update Article' : 'Create Article'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
} 