'use client';

import { useState } from 'react';
import { createArticle } from '@/lib/actions/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, X, ExternalLink, Link as LinkIcon, Hash, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InternalLinkingSuggestions from './InternalLinkingSuggestions';

export default function EnhancedArticleForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string> | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [internalLinks, setInternalLinks] = useState<string[]>([]);
  const [newInternalLink, setNewInternalLink] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [newExternalLink, setNewExternalLink] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = calculateReadingTime(content);

  // Add keyword
  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  // Remove keyword
  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // Add internal link
  const addInternalLink = () => {
    if (newInternalLink.trim() && !internalLinks.includes(newInternalLink.trim())) {
      setInternalLinks([...internalLinks, newInternalLink.trim()]);
      setNewInternalLink('');
    }
  };

  // Remove internal link
  const removeInternalLink = (index: number) => {
    setInternalLinks(internalLinks.filter((_, i) => i !== index));
  };

  // Add external link
  const addExternalLink = () => {
    if (newExternalLink.trim() && !externalLinks.includes(newExternalLink.trim())) {
      setExternalLinks([...externalLinks, newExternalLink.trim()]);
      setNewExternalLink('');
    }
  };

  // Remove external link
  const removeExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  // Handle adding suggested internal link
  const handleAddSuggestedLink = (url: string, title: string) => {
    if (!internalLinks.includes(url)) {
      setInternalLinks([...internalLinks, url]);
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createArticle(formData);
    } catch (err: any) {
      setError({ general: err.message || 'Failed to create article' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'string' ? error : 'Please fix the errors below.'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Article Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter article title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="auto-generated-from-title"
                  required
                  className="mt-1"
                  onChange={(e) => {
                    if (!e.target.value) {
                      const title = (document.getElementById('title') as HTMLInputElement)?.value;
                      if (title) {
                        e.target.value = generateSlug(title);
                      }
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health & Wellness</SelectItem>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="recipes">Recipes</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="products">Product Reviews</SelectItem>
                    <SelectItem value="guides">Guides & Tips</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select name="status" defaultValue="DRAFT">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="imageUrl">Featured Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Brief summary of the article"
                  required
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Short excerpt for previews"
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Article content (HTML supported)"
                  required
                  rows={12}
                  className="mt-1"
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Estimated reading time: {readingTime} minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - SEO & Links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                SEO Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title *</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  placeholder="SEO-optimized title (max 60 chars)"
                  required
                  maxLength={60}
                  className="mt-1"
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Recommended: 50-60 characters</span>
                  <span className={`text-xs ${metaTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                    {metaTitle.length}/60
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description *</Label>
                <Textarea
                  id="metaDescription"
                  name="metaDescription"
                  placeholder="SEO description (max 155 chars)"
                  required
                  rows={3}
                  maxLength={155}
                  className="mt-1"
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Recommended: 150-155 characters</span>
                  <span className={`text-xs ${metaDescription.length > 155 ? 'text-red-500' : 'text-gray-500'}`}>
                    {metaDescription.length}/155
                  </span>
                </div>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    placeholder="Add keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(index)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <input type="hidden" name="keywords" value={JSON.stringify(keywords)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Internal Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Add at least 2 internal links to improve SEO and user experience.
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://sheikhshops.com/products/..."
                  value={newInternalLink}
                  onChange={(e) => setNewInternalLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInternalLink())}
                />
                <Button type="button" onClick={addInternalLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {internalLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <LinkIcon className="w-4 h-4 text-blue-500" />
                    <span className="flex-1 text-sm">{link}</span>
                    <button
                      type="button"
                      onClick={() => removeInternalLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <input type="hidden" name="internalLinks" value={JSON.stringify(internalLinks)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                External References
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                Add trusted external links (Wikipedia, WHO, FAO, PubMed, etc.)
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://en.wikipedia.org/wiki/..."
                  value={newExternalLink}
                  onChange={(e) => setNewExternalLink(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExternalLink())}
                />
                <Button type="button" onClick={addExternalLink} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {externalLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <ExternalLink className="w-4 h-4 text-green-500" />
                    <span className="flex-1 text-sm">{link}</span>
                    <button
                      type="button"
                      onClick={() => removeExternalLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <input type="hidden" name="externalLinks" value={JSON.stringify(externalLinks)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <input type="hidden" name="tags" value={JSON.stringify(tags)} />
            </CardContent>
          </Card>

          {/* AI-Powered Internal Linking Suggestions */}
          <InternalLinkingSuggestions
            content={content}
            category={selectedCategory}
            tags={tags}
            onAddLink={handleAddSuggestedLink}
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Save Draft
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Article'}
        </Button>
      </div>
    </form>
  );
}