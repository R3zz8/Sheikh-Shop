'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireRole } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  X, 
  Save, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Calendar,
  Clock,
  User,
  FileText,
  Image as ImageIcon,
  Settings,
  Zap,
  Target,
  Users,
  History,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,

  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { createArticle, updateArticle } from '@/lib/actions/articles';
import { uploadArticleImage } from '@/lib/services/articleUpload';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false
});

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'REVIEW' | 'SCHEDULED';
  author: {
    id: string;
    email: string;
    username?: string;
  };
  scheduledAt?: Date;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  allowComments?: boolean;
}

interface ArticleFormProps {
  article?: Article;
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to validate SEO
function validateSEO(title: string, description: string) {
  const issues: string[] = [];
  
  if (title.length < 30) issues.push('SEO title should be at least 30 characters');
  if (title.length > 60) issues.push('SEO title should be under 60 characters');
  if (description.length < 120) issues.push('SEO description should be at least 120 characters');
  if (description.length > 160) issues.push('SEO description should be under 160 characters');
  
  return issues;
}

export default function EnhancedArticleForm({ article }: ArticleFormProps) {
  const router = useRouter();
  const hasAccess = useRequireRole(['SUPERADMIN', 'ADMIN', 'EDITOR']);
  const isEditing = !!article;

  // Form state
  const [formData, setFormData] = useState({
    title: article?.title ?? '',
    summary: article?.summary ?? '',
    content: article?.content ?? '',
    status: article?.status ?? 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'REVIEW' | 'SCHEDULED',
    scheduledAt: article?.scheduledAt ? new Date(article.scheduledAt) : null,
    tags: article?.tags ?? [],
    seoTitle: article?.seoTitle ?? '',
    seoDescription: article?.seoDescription ?? '',
    featured: article?.featured ?? false,
    allowComments: article?.allowComments ?? true,
  });

  // UI state
  const [imageUrl, setImageUrl] = useState(article?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [showPreview, setShowPreview] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [seoIssues, setSeoIssues] = useState<string[]>([]);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug }));
    }

    // Auto-generate SEO fields if empty
    if (field === 'title' && !formData.seoTitle) {
      setFormData(prev => ({ ...prev, seoTitle: value }));
    }
    if (field === 'summary' && !formData.seoDescription) {
      setFormData(prev => ({ ...prev, seoDescription: value }));
    }

    // Validate form
    validateForm();
  };

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    } else if (formData.summary.length < 50) {
      newErrors.summary = 'Summary must be at least 50 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 100) {
      newErrors.content = 'Content must be at least 100 characters';
    }

    if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
      newErrors.scheduledAt = 'Scheduled date is required for scheduled articles';
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);

    // Validate SEO
    if (formData.seoTitle || formData.seoDescription) {
      const issues = validateSEO(formData.seoTitle, formData.seoDescription);
      setSeoIssues(issues);
    }
  }, [formData]);

  // Validate on form data changes
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle image upload
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
        toast.success('Image uploaded successfully');
        
        // Clear the file input
        const fileInput = document.getElementById('article-image') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess) {
      toast.error('You do not have permission to perform this action');
      return;
    }

    if (!isValid) {
      toast.error('Please fix the form errors before submitting');
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
        scheduledAt: formData.scheduledAt,
        tags: formData.tags,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        featured: formData.featured,
        allowComments: formData.allowComments,
      };

      const formDataObj = new FormData();
      Object.entries(submitData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof Date) {
            formDataObj.append(key, value.toISOString());
          } else if (Array.isArray(value)) {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value.toString());
          }
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

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Remove image
  const removeImage = () => {
    setImageUrl('');
    setFile(null);
    const fileInput = document.getElementById('article-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Access control
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

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/articles">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Article' : 'Create New Article'}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEditing ? 'Update your article content and settings' : 'Write and publish your next article'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!isValid}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Article' : 'Create Article'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Tab */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter article title"
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                    {formData.title && (
                      <p className="text-xs text-gray-500">
                        Slug: {generateSlug(formData.title)}
                      </p>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary *</Label>
                    <Textarea
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Enter article summary"
                      rows={3}
                      className={errors.summary ? 'border-red-500' : ''}
                    />
                    {errors.summary && (
                      <p className="text-sm text-red-500">{errors.summary}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formData.summary.length}/500 characters
                    </p>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      placeholder="Write your article content..."
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500">{errors.content}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {getWordCount(formData.content)} words
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Image Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Featured Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <Image
                          src={imageUrl}
                          alt="Article featured image"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowImageDialog(true)}
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Change Image
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No featured image set</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowImageDialog(true)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Publishing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <div className="flex items-center gap-2">
                            <EyeOff className="w-4 h-4" />
                            Draft
                          </div>
                        </SelectItem>
                        <SelectItem value="REVIEW">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Review
                          </div>
                        </SelectItem>
                        <SelectItem value="SCHEDULED">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Scheduled
                          </div>
                        </SelectItem>
                        <SelectItem value="PUBLISHED">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Published
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Scheduled Date */}
                  {formData.status === 'SCHEDULED' && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Publish Date</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={formData.scheduledAt ? formData.scheduledAt.toISOString().slice(0, 16) : ''}
                        onChange={(e) => handleInputChange('scheduledAt', e.target.value ? new Date(e.target.value) : null)}
                        className={errors.scheduledAt ? 'border-red-500' : ''}
                      />
                      {errors.scheduledAt && (
                        <p className="text-sm text-red-500">{errors.scheduledAt}</p>
                      )}
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => handleInputChange('featured', !!checked)}
                      />
                      <Label htmlFor="featured">Featured Article</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowComments"
                        checked={formData.allowComments}
                        onCheckedChange={(checked) => handleInputChange('allowComments', !!checked)}
                      />
                      <Label htmlFor="allowComments">Allow Comments</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SEO Title */}
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      placeholder="SEO optimized title"
                    />
                    <p className="text-xs text-gray-500">
                      {formData.seoTitle.length}/60 characters
                    </p>
                  </div>

                  {/* SEO Description */}
                  <div className="space-y-2">
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      placeholder="SEO optimized description"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      {formData.seoDescription.length}/160 characters
                    </p>
                  </div>

                  {/* SEO Issues */}
                  {seoIssues.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">SEO Issues</h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        {seoIssues.map((issue, index) => (
                          <li key={index}>• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Tag */}
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      Add
                    </Button>
                  </div>

                  {/* Tags List */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Image Upload Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Featured Image</DialogTitle>
              <DialogDescription>
                Choose an image file to upload as your article's featured image.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article-image">Image File</Label>
                <Input
                  id="article-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              {file && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImageUpload} 
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Article Preview</DialogTitle>
              <DialogDescription>
                Preview how your article will look when published.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {imageUrl && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Article preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{formData.title}</h1>
                <p className="text-gray-600 mb-4">{formData.summary}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Helper function to get word count
function getWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}
