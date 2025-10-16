'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Copy,
  RefreshCw,
  Target,
  Clock,
  Hash,
  Link as LinkIcon,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import type { ContentAssistantResponse } from '@/lib/ai/content-assistant';

interface AIContentAssistantProps {
  onContentGenerated: (content: ContentAssistantResponse) => void;
  onGenerationRequested?: () => void;
  className?: string;
}

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
}

export default function AIContentAssistant({ 
  onContentGenerated, 
  onGenerationRequested,
  className = '' 
}: AIContentAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'formal' | 'casual' | 'educational'>('educational');
  const [language, setLanguage] = useState('en');
  const [category, setCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [wordCount, setWordCount] = useState(1500);
  
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
  });
  
  const [generatedContent, setGeneratedContent] = useState<ContentAssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for your article');
      return;
    }

    setError(null);
    setGenerationState({
      isGenerating: true,
      progress: 0,
      currentStep: 'Initializing AI...',
    });

    // Simulate progress updates
    const progressSteps = [
      { progress: 20, step: 'Analyzing topic and requirements...' },
      { progress: 40, step: 'Generating SEO-optimized content...' },
      { progress: 60, step: 'Creating article outline...' },
      { progress: 80, step: 'Optimizing keywords and links...' },
      { progress: 100, step: 'Finalizing content...' },
    ];

    const progressInterval = setInterval(() => {
      const currentStepIndex = Math.floor(generationState.progress / 20);
      if (currentStepIndex < progressSteps.length) {
        setGenerationState(prev => ({
          ...prev,
          ...progressSteps[currentStepIndex],
        }));
      }
    }, 800);

    try {
      onGenerationRequested?.();
      const response = await fetch('/api/ai/content-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          language,
          category: category || undefined,
          targetAudience: targetAudience || undefined,
          wordCount,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const result = await response.json();
      
      if (result.success) {
        setGeneratedContent(result.data);
        onContentGenerated(result.data);
        
        toast.success(
          result.cached 
            ? 'Content loaded from cache' 
            : 'AI content generated successfully!',
          {
            description: `Confidence: ${result.data.confidence}% • ${result.data.estimatedReadTime} min read`,
          }
        );
      } else {
        throw new Error(result.error || 'Failed to generate content');
      }

    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      toast.error('Content generation failed', {
        description: errorMessage,
      });
    } finally {
      setGenerationState({
        isGenerating: false,
        progress: 0,
        currentStep: '',
      });
    }
  };

  const handleInsertContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      toast.success('Content inserted into article form');
    }
  };

  const handleRegenerate = () => {
    setGeneratedContent(null);
    handleGenerate();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between p-4 h-auto"
            disabled={generationState.isGenerating}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Generate Article with AI</span>
              <Badge variant="secondary" className="ml-2">
                <Zap className="w-3 h-3 mr-1" />
                GPT-4
              </Badge>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className={`space-y-4 ${isOpen ? 'block' : 'hidden'}`}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Content Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="topic">Article Topic *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Health Benefits of Raw Honey"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="wordCount">Target Word Count</Label>
                  <Select value={wordCount.toString()} onValueChange={(value) => setWordCount(Number(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="800">800 words</SelectItem>
                      <SelectItem value="1200">1,200 words</SelectItem>
                      <SelectItem value="1500">1,500 words</SelectItem>
                      <SelectItem value="2000">2,000 words</SelectItem>
                      <SelectItem value="3000">3,000 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Health, Nutrition, Recipes"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience (Optional)</Label>
                  <Input
                    id="audience"
                    placeholder="e.g., Health-conscious adults"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={generationState.isGenerating || !topic.trim()}
                  className="flex-1"
                >
                  {generationState.isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                
                {generatedContent && (
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerate}
                    disabled={generationState.isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                )}
              </div>

              {/* Progress Bar */}
              <AnimatePresence>
                {generationState.isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{generationState.currentStep}</span>
                      <span className="text-gray-500">{generationState.progress}%</span>
                    </div>
                    <Progress value={generationState.progress} className="w-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Generated Content Display */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Generated Content
                        <Badge variant="outline" className="ml-2">
                          {generatedContent.confidence}% confidence
                        </Badge>
                      </CardTitle>
                      <Button onClick={handleInsertContent} size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Insert into Article
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Title and Meta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Article Title</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium">{generatedContent.title}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.title, 'Title')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Meta Title</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{generatedContent.metaTitle}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.metaTitle, 'Meta title')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {generatedContent.metaTitle.length}/60 characters
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Meta Description</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-start justify-between">
                          <p className="text-sm">{generatedContent.metaDescription}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(generatedContent.metaDescription, 'Meta description')}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {generatedContent.metaDescription.length}/155 characters
                        </p>
                      </div>
                    </div>

                    {/* Summary and Excerpt */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Summary</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{generatedContent.summary}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.summary, 'Summary')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Excerpt</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start justify-between">
                            <p className="text-sm">{generatedContent.excerpt}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(generatedContent.excerpt, 'Excerpt')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Keywords
                      </Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {generatedContent.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => copyToClipboard(keyword, 'Keyword')}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Article Outline */}
                    <div>
                      <Label className="text-sm font-medium">Article Outline</Label>
                      <div className="mt-2 space-y-3">
                        {generatedContent.outline.map((section, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium text-sm mb-2">{section.heading}</h4>
                            <ul className="space-y-1">
                              {section.subpoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Internal Links
                        </Label>
                        <div className="mt-2 space-y-2">
                          {generatedContent.internalLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded border">
                              <LinkIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-sm flex-1">{link}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(link, 'Internal link')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          External References
                        </Label>
                        <div className="mt-2 space-y-2">
                          {generatedContent.externalLinks.map((link, index) => (
                            <div key={index} className="p-2 bg-green-50 rounded border">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{link.title}</p>
                                  <p className="text-xs text-gray-600">{link.description}</p>
                                  <p className="text-xs text-green-600 mt-1">{link.url}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(link.url, 'External link')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reading Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Estimated reading time: {generatedContent.estimatedReadTime} minutes</span>
                    </div>

                    {/* Suggestions */}
                    {generatedContent.suggestions && generatedContent.suggestions.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">AI Suggestions</Label>
                        <div className="mt-2 space-y-2">
                          {generatedContent.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded border">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                              <p className="text-sm text-yellow-800">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
