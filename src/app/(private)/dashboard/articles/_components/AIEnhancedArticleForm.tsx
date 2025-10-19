'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createArticle, updateArticle } from '@/lib/actions/articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Plus, X, ExternalLink, Link as LinkIcon, Hash, Clock, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AIContentAssistant from '@/components/ai/AIContentAssistant';
import InternalLinkingSuggestions from './InternalLinkingSuggestions';
import ImageUpload from '@/components/ui/ImageUpload';
import type { ContentAssistantResponse } from '@/lib/ai/content-assistant';
import { useArticleAnalytics } from '@/hooks/useArticleAnalytics';
import { toast } from 'sonner';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: 'DRAFT' | 'PUBLISHED';
  imageUrl?: string | null;
  category?: string | null;
  tags: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords: string[];
  internalLinks: string[];
  externalLinks: string[];
  excerpt?: string | null;
  language: string;
}

interface AIEnhancedArticleFormProps {
  mode?: 'create' | 'edit';
  article?: Article;
}

// Helper function to generate URL slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function AIEnhancedArticleForm({ mode = 'create', article }: AIEnhancedArticleFormProps) {
  const isEditMode = mode === 'edit';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Record<string, string> | null>(null);
  const [keywords, setKeywords] = useState<string[]>(article?.keywords || []);
  const [newKeyword, setNewKeyword] = useState('');
  const [internalLinks, setInternalLinks] = useState<string[]>(article?.internalLinks || []);
  const [newInternalLink, setNewInternalLink] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>(article?.externalLinks || []);
  const [newExternalLink, setNewExternalLink] = useState('');
  const [tags, setTags] = useState<string[]>(article?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState(article?.content || '');
  const [metaTitle, setMetaTitle] = useState(article?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(article?.metaDescription || '');
  const [selectedCategory, setSelectedCategory] = useState(article?.category || '');
  const [imageUrl, setImageUrl] = useState(article?.imageUrl || '');
  const [aiGeneratedContent, setAiGeneratedContent] = useState<ContentAssistantResponse | null>(null);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [createdArticleId, setCreatedArticleId] = useState<string | undefined>(article?.id);

  const draftKey = useMemo(() => 
    isEditMode ? `article:${article?.id}:draft` : 'article:new:draft', 
    [isEditMode, article?.id]
  );
  const { trackAction } = useArticleAnalytics(createdArticleId);

  // Calculate reading time
  const calculateReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const readingTime = calculateReadingTime(content);

  // Handle AI-generated content
  const handleAIContentGenerated = (content: ContentAssistantResponse) => {
    setAiGeneratedContent(content);
    
    // Auto-populate form fields with AI content
    const titleInput = document.getElementById('title') as HTMLInputElement;
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    const summaryInput = document.getElementById('summary') as HTMLTextAreaElement;
    const contentInput = document.getElementById('content') as HTMLTextAreaElement;
    const metaTitleInput = document.getElementById('metaTitle') as HTMLInputElement;
    const metaDescriptionInput = document.getElementById('metaDescription') as HTMLTextAreaElement;
    const excerptInput = document.getElementById('excerpt') as HTMLTextAreaElement;

    if (titleInput) titleInput.value = content.title;
    if (slugInput) slugInput.value = generateSlug(content.title);
    if (summaryInput) summaryInput.value = content.summary;
    if (contentInput) {
      // Generate basic content from outline
      const generatedContent = content.outline.map(section => 
        `## ${section.heading}\n\n${section.subpoints.map(point => `- ${point}`).join('\n')}`
      ).join('\n\n');
      contentInput.value = generatedContent;
      setContent(generatedContent);
    }
    if (metaTitleInput) {
      metaTitleInput.value = content.metaTitle;
      setMetaTitle(content.metaTitle);
    }
    if (metaDescriptionInput) {
      metaDescriptionInput.value = content.metaDescription;
      setMetaDescription(content.metaDescription);
    }
    if (excerptInput) excerptInput.value = content.excerpt;

    // Set keywords, internal links, and external links
    setKeywords(content.keywords);
    setInternalLinks(content.internalLinks);
    setExternalLinks(content.externalLinks.map(link => link.url));

    trackAction('ai_generation_completed');

    // Set category if available
    if (content.keywords.length > 0) {
      const categoryFromKeywords = content.keywords.find(keyword => 
        ['health', 'nutrition', 'recipes', 'lifestyle', 'products', 'guides'].includes(keyword.toLowerCase())
      );
      if (categoryFromKeywords) {
        setSelectedCategory(categoryFromKeywords.toLowerCase());
      }
    }
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let result;
      if (isEditMode && article) {
        result = await updateArticle(article.id, formData);
        trackAction('article_edited', { articleId: article.id });
        const submittedStatus = (formData.get('status') as string) || 'DRAFT';
        if (submittedStatus === 'PUBLISHED') {
          trackAction('article_published_update', { articleId: article.id });
        } else {
          trackAction('article_updated_draft', { articleId: article.id });
        }
      } else {
        result = await createArticle(formData);
        // createArticle redirects on success; capture id if returned
        if (result && typeof result === 'object' && 'data' in result && (result as any).data?.id) {
          setCreatedArticleId((result as any).data.id as string);
          trackAction('article_created', { articleId: (result as any).data.id });
          const submittedStatus = (formData.get('status') as string) || 'DRAFT';
          if (submittedStatus === 'PUBLISHED') {
            trackAction('article_published', { articleId: (result as any).data.id });
          }
        } else {
          // best effort
          trackAction('article_created');
        }
      }
      // clear draft after successful create/update
      try { localStorage.removeItem(draftKey); } catch {}
    } catch (err: any) {
      setError({ general: err.message || `Failed to ${isEditMode ? 'update' : 'create'} article` });
      trackAction(isEditMode ? 'article_update_failed' : 'article_creation_failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autosave: persist draft every 30s and on changes (debounced)
  useEffect(() => {
    const save = () => {
      try {
        setSavingState('saving');
        const title = (document.getElementById('title') as HTMLInputElement)?.value || '';
        const slug = (document.getElementById('slug') as HTMLInputElement)?.value || '';
        const summary = (document.getElementById('summary') as HTMLTextAreaElement)?.value || '';
        const excerpt = (document.getElementById('excerpt') as HTMLTextAreaElement)?.value || '';
        const draft = {
          title, slug, summary, content, metaTitle, metaDescription, selectedCategory,
          keywords, internalLinks, externalLinks, tags, excerpt, imageUrl,
          status: 'DRAFT',
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setSavingState('saved');
        trackAction('article_saved_draft');
        setTimeout(() => setSavingState('idle'), 1500);
      } catch {
        setSavingState('error');
        setTimeout(() => setSavingState('idle'), 2000);
      }
    };

    const interval = setInterval(save, 30000);
    return () => clearInterval(interval);
  }, [content, metaTitle, metaDescription, selectedCategory, keywords, internalLinks, externalLinks, tags, draftKey, trackAction]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const titleInput = document.getElementById('title') as HTMLInputElement | null;
      const slugInput = document.getElementById('slug') as HTMLInputElement | null;
      const summaryInput = document.getElementById('summary') as HTMLTextAreaElement | null;
      const contentInput = document.getElementById('content') as HTMLTextAreaElement | null;
      const metaTitleInput = document.getElementById('metaTitle') as HTMLInputElement | null;
      const metaDescriptionInput = document.getElementById('metaDescription') as HTMLTextAreaElement | null;
      const excerptInput = document.getElementById('excerpt') as HTMLTextAreaElement | null;

      if (titleInput && draft.title) titleInput.value = draft.title;
      if (slugInput && draft.slug) slugInput.value = draft.slug;
      if (summaryInput && draft.summary) summaryInput.value = draft.summary;
      if (contentInput && draft.content) { contentInput.value = draft.content; setContent(draft.content); }
      if (metaTitleInput && draft.metaTitle) { metaTitleInput.value = draft.metaTitle; setMetaTitle(draft.metaTitle); }
      if (metaDescriptionInput && draft.metaDescription) { metaDescriptionInput.value = draft.metaDescription; setMetaDescription(draft.metaDescription); }
      if (excerptInput && draft.excerpt) excerptInput.value = draft.excerpt;
      if (draft.imageUrl) setImageUrl(draft.imageUrl);
      if (draft.selectedCategory) setSelectedCategory(draft.selectedCategory);
      if (Array.isArray(draft.keywords)) setKeywords(draft.keywords);
      if (Array.isArray(draft.internalLinks)) setInternalLinks(draft.internalLinks);
      if (Array.isArray(draft.externalLinks)) setExternalLinks(draft.externalLinks);
      if (Array.isArray(draft.tags)) setTags(draft.tags);

      toast.info('Draft restored');
    } catch {}
  }, [draftKey]);

  return (
    <div className="space-y-6">
      {/* AI Content Assistant */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AIContentAssistant 
          onContentGenerated={handleAIContentGenerated}
          onGenerationRequested={() => trackAction('ai_generation_requested')}
        />
      </motion.div>

      <form action={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {typeof error === 'string' ? error : 'Please fix the errors below.'}
            </AlertDescription>
          </Alert>
        )}

        {/* AI Content Status */}
        {aiGeneratedContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <Sparkles className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>AI Content Generated!</strong> The form has been pre-filled with AI-generated content. 
                Review and edit as needed before submitting.
                <Badge variant="outline" className="ml-2">
                  {aiGeneratedContent.confidence}% confidence
                </Badge>
              </AlertDescription>
            </Alert>
          </motion.div>
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
                    defaultValue={article?.title || ''}
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
                    defaultValue={article?.slug || ''}
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
                  <Select name="status" defaultValue={article?.status || "DRAFT"}>
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
                  <Label htmlFor="image">Featured Image</Label>
                  <div className="mt-1">
                    <ImageUpload
                      value={imageUrl}
                      onChange={setImageUrl}
                      onRemove={() => setImageUrl('')}
                    />
                    <input type="hidden" name="imageUrl" value={imageUrl} />
                  </div>
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
                    defaultValue={article?.summary || ''}
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
                    defaultValue={article?.excerpt || ''}
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
                    defaultValue={article?.content || ''}
                    required
                    rows={12}
                    className="mt-1"
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Estimated reading time: {readingTime} minutes</span>
                    {aiGeneratedContent && (
                      <Badge variant="outline" className="ml-2">
                        AI Generated
                      </Badge>
                    )}
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
                    defaultValue={article?.metaTitle || ''}
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
                    defaultValue={article?.metaDescription || ''}
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

        {/* Hidden inputs for form data */}
        <input type="hidden" name="keywords" value={JSON.stringify(keywords)} />
        <input type="hidden" name="internalLinks" value={JSON.stringify(internalLinks)} />
        <input type="hidden" name="externalLinks" value={JSON.stringify(externalLinks)} />
        <input type="hidden" name="language" value={article?.language || 'en'} />

        <div className="flex justify-between items-center gap-4 pt-6 border-t">
          <div className="text-sm">
            {savingState === 'saving' && <span className="text-gray-500">Saving...</span>}
            {savingState === 'saved' && <span className="text-green-600">Saved</span>}
            {savingState === 'error' && <span className="text-red-600">Auto-save failed</span>}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            disabled={isSubmitting}
            onClick={() => {
              // manual draft save
              try {
                setSavingState('saving');
                const title = (document.getElementById('title') as HTMLInputElement)?.value || '';
                const slug = (document.getElementById('slug') as HTMLInputElement)?.value || '';
                const summary = (document.getElementById('summary') as HTMLTextAreaElement)?.value || '';
                const excerpt = (document.getElementById('excerpt') as HTMLTextAreaElement)?.value || '';
                const draft = {
                  title, slug, summary, content, metaTitle, metaDescription, selectedCategory,
                  keywords, internalLinks, externalLinks, tags, excerpt, imageUrl,
                  status: 'DRAFT',
                };
                localStorage.setItem(draftKey, JSON.stringify(draft));
                setSavingState('saved');
                trackAction('article_saved_draft');
                setTimeout(() => setSavingState('idle'), 1500);
                toast.success('Draft saved');
              } catch {
                setSavingState('error');
                toast.error('Failed to save draft');
                setTimeout(() => setSavingState('idle'), 2000);
              }
            }}
          >
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Article' : 'Create Article')}
          </Button>
        </div>
      </form>
    </div>
  );
}




